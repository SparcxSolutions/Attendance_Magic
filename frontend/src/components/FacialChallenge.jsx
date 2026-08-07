import React, { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';

const CHALLENGES = [
    { id: 'left', text: 'Turn Head Left ⬅️' },
    { id: 'right', text: 'Turn Head Right ➡️' },
    { id: 'up', text: 'Look Up ⬆️' },
    { id: 'down', text: 'Look Down ⬇️' }
];

const loadScript = (src) => {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) return resolve();
        const script = document.createElement('script');
        script.src = src;
        script.crossOrigin = 'anonymous';
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
    });
};

export default function FacialChallenge({ onChallengeSuccess }) {
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    const [challenge, setChallenge] = useState(null);
    const isDetectingRef = useRef(true);
    const challengeRef = useRef(null);
    const successTriggered = useRef(false);

    useEffect(() => {
        let faceMesh = null;
        let camera = null;

        const initMediaPipe = async () => {
            try {
                await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js');
                await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js');

                // Randomly select a challenge
                const randomChallenge = CHALLENGES[Math.floor(Math.random() * CHALLENGES.length)];
                setChallenge(randomChallenge);
                challengeRef.current = randomChallenge;

                const FaceMesh = window.FaceMesh;
                const Camera = window.Camera;

                faceMesh = new FaceMesh({
                    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
                });

                faceMesh.setOptions({
                    maxNumFaces: 1,
                    refineLandmarks: true,
                    minDetectionConfidence: 0.5,
                    minTrackingConfidence: 0.5
                });

                faceMesh.onResults(onResults);

                if (webcamRef.current && webcamRef.current.video) {
                    camera = new Camera(webcamRef.current.video, {
                        onFrame: async () => {
                            if (webcamRef.current && webcamRef.current.video && isDetectingRef.current) {
                                try {
                                    await faceMesh.send({ image: webcamRef.current.video });
                                } catch (err) {
                                    console.error(err);
                                }
                            }
                        },
                        width: 640,
                        height: 480
                    });
                    camera.start();
                }
            } catch (err) {
                console.error("Failed to load MediaPipe", err);
            }
        };

        initMediaPipe();

        return () => {
            isDetectingRef.current = false;
            if (camera) {
                camera.stop();
            }
            if (faceMesh) {
                faceMesh.close();
            }
        };
    }, []);

    const getDistance = (p1, p2) => {
        return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
    };

    const onResults = (results) => {
        if (!isDetectingRef.current) return;
        
        const canvasCtx = canvasRef.current?.getContext('2d');
        if (canvasCtx && canvasRef.current) {
            canvasCtx.save();
            canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            canvasCtx.restore();
        }

        if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
            const landmarks = results.multiFaceLandmarks[0];
            checkChallenge(landmarks);
        }
    };

    const checkChallenge = (landmarks) => {
        if (!challengeRef.current || successTriggered.current) return;

        const nose = landmarks[1];
        const leftCheek = landmarks[234];
        const rightCheek = landmarks[454];
        const topFace = landmarks[10];
        const chin = landmarks[152];

        const distLeft = getDistance(nose, leftCheek);
        const distRight = getDistance(nose, rightCheek);
        const distTop = getDistance(nose, topFace);
        const distBottom = getDistance(nose, chin);

        let passed = false;
        const currentChallenge = challengeRef.current.id;

        // Tuning thresholds
        if (currentChallenge === 'left' && distRight / distLeft > 1.7) {
            passed = true;
        } else if (currentChallenge === 'right' && distLeft / distRight > 1.7) {
            passed = true;
        } else if (currentChallenge === 'up' && distBottom / distTop > 1.5) {
            passed = true;
        } else if (currentChallenge === 'down' && distTop / distBottom > 1.5) {
            passed = true;
        }

        if (passed) {
            successTriggered.current = true;
            isDetectingRef.current = false;
            
            // Allow time for the user to stabilize their face after the challenge
            setTimeout(() => {
                const imageSrc = webcamRef.current.getScreenshot();
                onChallengeSuccess(imageSrc);
            }, 300);
        }
    };

    return (
        <div className="relative w-full rounded-xl overflow-hidden border bg-gray-900 aspect-video">
            <Webcam
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="w-full h-full object-cover"
                videoConstraints={{ facingMode: "user" }}
                mirrored={true}
            />
            <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none"
            />
            
            <div className="absolute bottom-5 left-0 w-full text-center">
                <div className="inline-block bg-white text-blue-700 px-6 py-2 rounded-full font-bold shadow-lg animate-pulse border-4 border-blue-200">
                    {successTriggered.current ? "✅ Success! Capturing..." : (challenge ? challenge.text : "Initializing Camera...")}
                </div>
            </div>
        </div>
    );
}
