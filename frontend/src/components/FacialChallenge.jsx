import { useEffect, useRef, useState } from "react";
import * as faceapi from '@vladmandic/face-api';

const CHALLENGES = [
    { id: "TURN_LEFT", text: "Turn Head Left" },
    { id: "TURN_RIGHT", text: "Turn Head Right" },
    { id: "LOOK_UP", text: "Look Up" },
    { id: "LOOK_DOWN", text: "Look Down" }
];

export default function FacialChallenge({ onChallengeSuccess }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [challenge, setChallenge] = useState(null);
    const [status, setStatus] = useState("Initializing camera...");
    const cameraRef = useRef(null);
    const successTriggered = useRef(false);
    const faceMeshRef = useRef(null);

    useEffect(() => {
        const randomChallenge = CHALLENGES[Math.floor(Math.random() * CHALLENGES.length)];
        setChallenge(randomChallenge);

        const loadFaceApiModels = async () => {
            try {
                const modelUrl = 'https://unpkg.com/@vladmandic/face-api/model/';
                await faceapi.nets.ssdMobilenetv1.loadFromUri(modelUrl);
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
                        setStatus(`Challenge: ${randomChallenge.text}`);
                        const landmarks = results.multiFaceLandmarks[0];
                        
                        const nose = landmarks[1];
                        const leftCheek = landmarks[234];
                        const rightCheek = landmarks[454];
                        const topHead = landmarks[10];
                        const bottomChin = landmarks[152];

                        const leftDist = nose.x - leftCheek.x;
                        const rightDist = rightCheek.x - nose.x;
                        const yawRatio = leftDist / rightDist;

                        const topDist = nose.y - topHead.y;
                        const bottomDist = bottomChin.y - nose.y;
                        const pitchRatio = topDist / bottomDist;

                        let success = false;
                        
                        if (randomChallenge.id === "TURN_LEFT") {
                            if (yawRatio > 2.0) success = true;
                        } else if (randomChallenge.id === "TURN_RIGHT") {
                            if (yawRatio < 0.6) success = true; // slightly relaxed from 0.5
                        } else if (randomChallenge.id === "LOOK_UP") {
                            if (pitchRatio < 0.6) success = true;
                        } else if (randomChallenge.id === "LOOK_DOWN") {
                            if (pitchRatio > 1.8) success = true;
                        }

                        if (success) {
                            successTriggered.current = true;
                            setStatus("✅ Challenge successful! Securing Identity...");
                            
                            const imageSrc = canvasRef.current.toDataURL("image/jpeg", 0.9);
                            
                            if (cameraRef.current) {
                                cameraRef.current.stop();
                            }
                            
                            setTimeout(async () => {
                                try {
                                    const img = new Image();
                                    img.src = imageSrc;
                                    await new Promise((resolve) => { img.onload = resolve; });

                                    const detection = await faceapi.detectSingleFace(img)
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
                                            successTriggered.current = false;
                                            if (cameraRef.current) cameraRef.current.start();
                                        }, 2000);
                                    }
                                } catch (e) {
                                    console.error(e);
                                    setStatus("❌ Error securing identity.");
                                }
                            }, 100);
                        }
                    } else {
                        setStatus("Face not detected. Please look at the camera.");
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
                    <div className="absolute inset-0 pointer-events-none border-[3px] border-dashed border-blue-400 opacity-50 rounded-2xl m-4"></div>
                )}
            </div>
            <p className="text-gray-500 mt-4 text-sm text-center">
                Please ensure your face is clearly visible and follow the challenge above to mark your attendance.
            </p>
        </div>
    );
}
