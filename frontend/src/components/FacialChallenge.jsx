import { useEffect, useRef, useState } from "react";
import * as faceapi from '@vladmandic/face-api';

export default function FacialChallenge({ onChallengeSuccess }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [blinkCount, setBlinkCount] = useState(0);
    const [status, setStatus] = useState("Initializing camera...");
    const [canCapture, setCanCapture] = useState(false);
    const [isCapturing, setIsCapturing] = useState(false);
    const cameraRef = useRef(null);
    const successTriggered = useRef(false);
    const faceMeshRef = useRef(null);
    const lastBlinkState = useRef(false);

    useEffect(() => {

        const loadFaceApiModels = async () => {
            try {
                const modelUrl = 'https://unpkg.com/@vladmandic/face-api/model/';
                await faceapi.nets.tinyFaceDetector.loadFromUri(modelUrl);
                await faceapi.nets.faceLandmark68Net.loadFromUri(modelUrl);
                await faceapi.nets.faceRecognitionNet.loadFromUri(modelUrl);
                console.log("Face-API models loaded");
            } catch (error) {
                console.error("Error loading face-api models:", error);
            }
        };
        loadFaceApiModels();

        const loadScript = (src) => {
            return new Promise((resolve, reject) => {
                if (document.querySelector(`script[src="${src}"]`)) {
                    resolve();
                    return;
                }
                const script = document.createElement("script");
                script.src = src;
                script.crossOrigin = "anonymous";
                script.onload = () => resolve();
                script.onerror = () => reject(new Error(`Failed to load ${src}`));
                document.body.appendChild(script);
            });
        };

        const initMediaPipe = async () => {
            try {
                await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js");
                await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js");
                
                const FaceMesh = window.FaceMesh;
                const Camera = window.Camera;

                faceMeshRef.current = new FaceMesh({
                    locateFile: (file) => {
                        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
                    }
                });

                faceMeshRef.current.setOptions({
                    maxNumFaces: 1,
                    refineLandmarks: true,
                    minDetectionConfidence: 0.5,
                    minTrackingConfidence: 0.5
                });

                faceMeshRef.current.onResults((results) => {
                    if (successTriggered.current) return;
                    
                    if (canvasRef.current && videoRef.current) {
                        const canvasCtx = canvasRef.current.getContext('2d');
                        canvasRef.current.width = videoRef.current.videoWidth;
                        canvasRef.current.height = videoRef.current.videoHeight;
                        canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                        canvasCtx.drawImage(results.image, 0, 0, canvasRef.current.width, canvasRef.current.height);
                    }

                    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
                        const landmarks = results.multiFaceLandmarks[0];
                        
                        // EAR calculation
                        const dist = (p1, p2) => Math.hypot(p1.x - p2.x, p1.y - p2.y);
                        const getEAR = (indices) => {
                            const p1 = landmarks[indices[0]];
                            const p2 = landmarks[indices[1]];
                            const p3 = landmarks[indices[2]];
                            const p4 = landmarks[indices[3]];
                            const p5 = landmarks[indices[4]];
                            const p6 = landmarks[indices[5]];
                            return (dist(p2, p6) + dist(p3, p5)) / (2.0 * dist(p1, p4));
                        };

                        const leftEyeIndices = [33, 160, 158, 133, 153, 144];
                        const rightEyeIndices = [362, 385, 387, 263, 373, 380];
                        
                        const leftEAR = getEAR(leftEyeIndices);
                        const rightEAR = getEAR(rightEyeIndices);
                        const avgEAR = (leftEAR + rightEAR) / 2.0;

                        const isBlinking = avgEAR < 0.22; // Threshold for a blink
                        
                        if (isBlinking && !lastBlinkState.current) {
                            lastBlinkState.current = true;
                        } else if (!isBlinking && lastBlinkState.current) {
                            lastBlinkState.current = false;
                            setBlinkCount(prev => {
                                const newCount = prev + 1;
                                if (newCount < 2) {
                                    setStatus(`Blinks detected: ${newCount} / 2`);
                                }
                                return newCount;
                            });
                        }

                        setBlinkCount(currentCount => {
                            if (currentCount === 0 && !canCapture) {
                                setStatus("Place your face in the circle and blink 2 times.");
                            }
                            
                            if (currentCount >= 2 && !canCapture) {
                                setCanCapture(true);
                                setStatus("✅ 2 Blinks detected! Please click Capture below.");
                            }
                            return currentCount;
                        });
                        
                    } else {
                        if (!canCapture && !isCapturing) {
                            setStatus("Face not detected. Please look at the camera.");
                        }
                    }
                });

                if (videoRef.current) {
                    const camera = new Camera(videoRef.current, {
                        onFrame: async () => {
                            if (videoRef.current && !successTriggered.current && faceMeshRef.current) {
                                await faceMeshRef.current.send({ image: videoRef.current });
                            }
                        },
                        width: 640,
                        height: 480
                    });
                    camera.start();
                    cameraRef.current = camera;
                }
            } catch (error) {
                console.error("Failed to load MediaPipe:", error);
                setStatus("Failed to load tracking modules. Please refresh.");
            }
        };

        initMediaPipe();

        return () => {
            if (cameraRef.current) {
                cameraRef.current.stop();
            }
            if (faceMeshRef.current) {
                faceMeshRef.current.close();
            }
        };
    }, []);

    const handleCapture = () => {
        setIsCapturing(true);
        setCanCapture(false);
        successTriggered.current = true;
        setStatus("Securing Identity... please wait.");
        
        const imageSrc = canvasRef.current.toDataURL("image/jpeg", 0.9);
        
        if (cameraRef.current) {
            cameraRef.current.stop();
        }
        
        // Give UI a chance to update before heavy computation
        setTimeout(async () => {
            try {
                const img = new Image();
                img.src = imageSrc;
                await new Promise((resolve) => { img.onload = resolve; });

                const detection = await faceapi.detectSingleFace(
                    img, 
                    new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.2 })
                )
                    .withFaceLandmarks()
                    .withFaceDescriptor();
                    
                if (detection) {
                    const embeddingArray = Array.from(detection.descriptor);
                    setStatus("✅ Identity secured!");
                    setTimeout(() => {
                        onChallengeSuccess(imageSrc, embeddingArray);
                    }, 500);
                } else {
                    setStatus("❌ Identity extraction failed. Try again.");
                    setTimeout(() => {
                        setIsCapturing(false);
                        setCanCapture(false);
                        setBlinkCount(0);
                        successTriggered.current = false;
                        if (cameraRef.current) cameraRef.current.start();
                    }, 2000);
                }
            } catch (e) {
                console.error(e);
                setStatus("❌ Error securing identity.");
            }
        }, 100);
    };

    return (
        <div className="flex flex-col items-center">
            <h2 className="text-2xl font-bold mb-2">Live Verification</h2>
            <div className={`p-4 rounded-xl font-bold mb-4 text-center w-full text-lg shadow-sm transition-colors duration-300 ${successTriggered.current ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                {status}
            </div>
            
            <div className="relative rounded-2xl overflow-hidden shadow-xl border-4 border-white bg-black w-full max-w-md aspect-[4/3] flex items-center justify-center">
                {/* Video is hidden, we use canvas to show mirrored feed for better UX */}
                <video ref={videoRef} className="hidden" playsInline></video>
                <canvas 
                    ref={canvasRef} 
                    className="w-full h-full object-cover"
                    style={{ transform: 'scaleX(-1)' }} 
                ></canvas>
                {!successTriggered.current && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
                        <div className="w-64 h-64 border-4 border-blue-400 border-dashed rounded-full shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]"></div>
                    </div>
                )}
            </div>
            
            {canCapture && !isCapturing && (
                <button 
                    onClick={handleCapture}
                    className="mt-4 px-6 py-3 bg-green-600 text-white text-lg font-bold rounded-lg shadow-md hover:bg-green-700 w-full max-w-md transition-colors"
                >
                    📸 Capture Image
                </button>
            )}
            
            {isCapturing && (
                <div className="mt-4 flex items-center justify-center space-x-3 text-blue-600 font-bold w-full max-w-md">
                    <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-lg">Processing...</span>
                </div>
            )}
            
            <p className="text-gray-500 mt-4 text-sm text-center">
                Please ensure your face is clearly visible and follow the challenge above to mark your attendance.
            </p>
        </div>
    );
}
