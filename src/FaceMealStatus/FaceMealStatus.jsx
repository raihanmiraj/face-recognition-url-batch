import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as faceapi from 'face-api.js';
import Webcam from 'react-webcam';

const FaceMealStatus = () => {
    const webcamRef = useRef(null);
    const [isReady, setIsReady] = useState(false);
    const [detectedPerson, setDetectedPerson] = useState(null);
    const [referenceDescriptors, setReferenceDescriptors] = useState([]);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [threshold, setThreshold] = useState(0.5);
    const [error, setError] = useState(null);

    const peopleData = [
        {
            "id": 1,
            "name": "Oni",
            "url": "https://i.ibb.co.com/5TPB7rG/IMG-1666.jpg"
        },
        {
            "id": 2,
            "name": "Rana",
            "url": "https://i.ibb.co/tKCZvNK/RANA.png"
        },
        {
            "id": 3,
            "name": "Siam",
            "url": "https://i.ibb.co.com/qmdbHxW/IMG-1657.jpg"
        },
        {
            "id": 4,
            "name": "Nabil",
            "url": "https://i.ibb.co/dQPSzBm/IMG-6418.jpg"
        },
        {
            "id": 5,
            "name": "Saad",
            "url": "https://i.ibb.co.com/Ns9ZRDc/IMG-1668.jpg"
        },
        {
            "id": 6,
            "name": "Mahee vai",
            "url": "https://i.ibb.co/qBtZKc6/IMG-20240915-224256.jpg"
        },
        {
            "id": 7,
            "name": "Fareed",
            "url": "https://i.ibb.co/Sd5whc9/IMG-20240920-000539.jpg"
        },
        {
            "id": 8,
            "name": "Boric Ghosh",
            "url": "https://i.ibb.co/H4grDf0/IMG-20240917-005048.jpg"
        },
        {
            "id": 9,
            "name": "Raihan Miraj",
            "url": "https://i.ibb.co.com/crxqvDF/IMG-1661.jpg"
        },
        {
            "id": 10,
            "name": "Shimanto",
            "url": "https://i.ibb.co/YLgX7TY/Screenshot-2024-09-16-20-47-51-515-com-miui-gallery.jpg"
        },
        {
            "id": 11,
            "name": "Salman",
            "url": "https://i.ibb.co.com/cQvB2hx/119224889-698726800854667-486240646048911969-n.jpg"
        },
        {
            "id": 12,
            "name": "Easin",
            "url": "https://i.ibb.co/YbR8vzr/EA.png"
        },
        {
            "id": 13,
            "name": "Sanjid",
            "url": "https://i.ibb.co/B616drR/Sanjidvai.png"
        },
        {
            "id": 14,
            "name": "Shahadat",
            "url": "https://i.ibb.co/Wvkz1CC/IMG-20240915-224524.jpg"
        },
        {
            "id": 15,
            "name": "Al Sabab",
            "url": "https://i.ibb.co/prPMBk0/IMG-20240916-WA0001.jpg"
        },
        {
            "id": 16,
            "name": "Shohan",
            "url": "https://i.ibb.co/gyd467d/IMG-20240917-232640.jpg"
        },
        {
            "id": 17,
            "name": "Mahim",
            "url": "https://i.ibb.co.com/h86nLXq/IMG-1667.jpg"
        },
        {
            "id": 18,
            "name": "Bond",
            "url": "https://i.ibb.co/pzf0hSc/IMG-2069.jpg"
        },
        {
            "id": 19,
            "name": "Aronno",
            "url": "https://i.ibb.co/qkk33pK/IMG-20240916-WA0000.jpg"
        },
        {
            "id": 20,
            "name": "Aminul",
            "url": "https://i.ibb.co/SNv80xC/IMG-20240916-WA0004.jpg"
        },
        {
            "id": 21,
            "name": "Shafi",
            "url": "https://i.ibb.co/djNs2dN/Shafi.png"
        },
        {
            "id": 22,
            "name": "Tamzid",
            "url": "https://i.ibb.co/nbxwkdb/IMG-20240918-183853.jpg"
        },
        {
            "id": 23,
            "name": "Rana vai",
            "url": "https://i.ibb.co.com/Vvn8zyr/IMG-2100.jpg"
        },
        {
            "id": 24,
            "name": "Tanveen",
            "url": "https://i.ibb.co.com/dLvkzHF/IMG-20241022-005441.jpg"
        },
        {
            "id": 25,
            "name": "Adan 14",
            "url": "https://i.ibb.co.com/FgCZ8pK/IMG-1663.jpg"
        },
        {
            "id": 26,
            "name": "Adan",
            "url": "https://i.ibb.co/C20yMP5/IMG-2059.jpg"
        },
        {
            "id": 27,
            "name": "Mehdi vai",
            "url": "https://i.ibb.co/RcR2Trg/IMG-20240923-164700.jpg"
        },
        {
            "id": 28,
            "name": "Saim",
            "url": "https://i.ibb.co.com/6B5rTYQ/IMG-20241006-032214.jpg"
        }
    ];

    // Validate URL format
    const isValidUrl = (url) => {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    };

    // Load models and reference images
    useEffect(() => {
        const loadAll = async () => {
            try {
                setError(null);

                // Load models
                await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
                setLoadingProgress(30);
                await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
                setLoadingProgress(60);
                await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
                setLoadingProgress(80);

                // Load reference images
                await loadReferenceDescriptors();
                setLoadingProgress(100);
                setIsReady(true);
            } catch (error) {
                console.error('Initialization error:', error);
                setError('Failed to load models. Check console for details.');
                setDetectedPerson({ name: 'Error', distance: 1 });
            }
        };

        loadAll();
    }, []);

    // Process reference images
    const loadReferenceDescriptors = async () => {
        const descriptors = [];
        const total = peopleData.length;

        for (let i = 0; i < total; i++) {
            try {
                const person = peopleData[i];
                const img = await faceapi.fetchImage(person.url);
                const detection = await faceapi
                    .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
                    .withFaceLandmarks()
                    .withFaceDescriptor();

                if (detection) {
                    descriptors.push({
                        id: person.id,
                        name: person.name,
                        url: person.url,
                        descriptor: detection.descriptor
                    });
                }

                // Update progress
                setLoadingProgress(80 + Math.floor((i / total) * 20));
            } catch (error) {
                console.error(`Error processing ${person.name}:`, error);
            }
        }

        setReferenceDescriptors(descriptors);
        return descriptors;
    };

    // Face detection handler
    const detectFace = useCallback(async () => {
        if (!isReady || !webcamRef.current || referenceDescriptors.length === 0) return;

        try {
            const video = webcamRef.current.video;
            if (!video || video.readyState !== 4) return;

            const detection = await faceapi
                .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
                .withFaceLandmarks()
                .withFaceDescriptor();

            if (detection) {
                const bestMatch = referenceDescriptors.reduce((best, person) => {
                    const distance = faceapi.euclideanDistance(
                        detection.descriptor,
                        person.descriptor
                    );
                    return distance < best.distance ?
                        { ...person, distance } : best;
                }, { name: 'Unknown', distance: 0.6, url: null });

                if (bestMatch.distance < threshold) {
                    setDetectedPerson(bestMatch);
                } else {
                    setDetectedPerson({
                        name: 'Unknown',
                        distance: bestMatch.distance,
                        message: 'No match found'
                    });
                }
            } else {
                setDetectedPerson({
                    name: 'No face',
                    distance: 1,
                    message: 'Position your face in the camera'
                });
            }
        } catch (error) {
            console.error('Detection error:', error);
            setDetectedPerson({
                name: 'Error',
                distance: 1,
                message: 'Detection failed'
            });
        }
    }, [isReady, referenceDescriptors, threshold]);

    // Setup detection interval when ready
    useEffect(() => {
        let intervalId;
        if (isReady) {
            intervalId = setInterval(detectFace, 1000);
        }
        return () => clearInterval(intervalId);
    }, [isReady, detectFace]);

    // Calculate confidence percentage
    const getConfidence = (distance) => {
        return Math.max(0, (1 - distance) * 100).toFixed(1);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
                    Face Recognition System
                </h1>

                {error && (
                    <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 border border-red-200">
                        {error}
                    </div>
                )}

                {!isReady ? (
                    <div className="bg-white rounded-xl shadow-md p-6 max-w-2xl mx-auto">
                        <p className="text-center text-gray-700 mb-3">
                            Loading models... {loadingProgress}%
                        </p>
                        <div className="w-full bg-gray-200 rounded-full h-4">
                            <div
                                className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                                style={{ width: `${loadingProgress}%` }}
                            ></div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Webcam Section */}
                        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                            <Webcam
                                ref={webcamRef}
                                audio={false}
                                screenshotFormat="image/jpeg"
                                videoConstraints={{
                                    facingMode: 'user',
                                    width: 1280,
                                    height: 720
                                }}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Controls and Results Section */}
                        <div className="space-y-6">
                            {/* Threshold Control */}
                            <div className="bg-white rounded-2xl shadow-xl p-6">
                                <label className="block text-gray-700 mb-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-medium">Recognition Threshold: {threshold}</span>
                                        <span className="text-sm text-gray-500">
                                            {threshold < 0.4 ? 'Loose' : threshold > 0.55 ? 'Strict' : 'Normal'}
                                        </span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0.3"
                                        max="0.7"
                                        step="0.05"
                                        value={threshold}
                                        onChange={(e) => setThreshold(parseFloat(e.target.value))}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                                        <span>Loose (0.3)</span>
                                        <span>Strict (0.7)</span>
                                    </div>
                                </label>

                                <div className="mt-4 p-3 bg-blue-50 rounded-lg text-blue-700">
                                    Loaded {referenceDescriptors.length} reference images
                                </div>
                            </div>

                            {/* Results Card */}
                            <div className={`bg-white rounded-2xl shadow-xl p-6 ${detectedPerson?.name === 'Unknown' || detectedPerson?.name === 'No face'
                                ? 'bg-amber-50 border border-amber-200'
                                : detectedPerson?.url
                                    ? 'bg-green-50 border border-green-200'
                                    : ''
                                }`}>
                                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                                    Detection Results
                                </h2>

                                {detectedPerson && (
                                    <div className="space-y-4">
                                        <h3 className={`text-xl font-semibold ${detectedPerson.name === 'Unknown' || detectedPerson.name === 'No face'
                                            ? 'text-amber-700'
                                            : 'text-green-700'
                                            }`}>
                                            {detectedPerson.name === 'Unknown' || detectedPerson.name === 'No face'
                                                ? detectedPerson.message
                                                : `Identified: ${detectedPerson.name}`}
                                        </h3>

                                        {detectedPerson.distance && (
                                            <div>
                                                <div className="flex justify-between text-gray-700 mb-1">
                                                    <span>Confidence: {getConfidence(detectedPerson.distance)}%</span>
                                                    <span className="text-sm">Distance: {detectedPerson.distance.toFixed(4)}</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-3">
                                                    <div
                                                        className="h-3 rounded-full bg-gradient-to-r from-red-400 via-yellow-400 to-green-500"
                                                        style={{ width: `${getConfidence(detectedPerson.distance)}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        )}

                                        {detectedPerson.url && isValidUrl(detectedPerson.url) && (
                                            <div className="mt-4">
                                                <p className="text-gray-700 mb-2">Reference Image:</p>
                                                <a
                                                    href={detectedPerson.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="block group"
                                                >
                                                    <div className="border-2 border-gray-300 rounded-xl overflow-hidden transition-all duration-300 group-hover:border-blue-500 group-hover:shadow-lg">
                                                        <img
                                                            src={detectedPerson.url}
                                                            alt={detectedPerson.name}
                                                            className="w-full h-48 object-cover"
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.parentNode.innerHTML = '<div class="bg-red-50 text-red-700 p-4 text-center">Image failed to load</div>';
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="mt-2 text-center">
                                                        <button className="text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center gap-1">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                                            </svg>
                                                            View full image
                                                        </button>
                                                    </div>
                                                </a>
                                            </div>
                                        )}

                                        {detectedPerson.url && !isValidUrl(detectedPerson.url) && (
                                            <div className="bg-red-50 text-red-700 p-3 rounded-lg mt-4">
                                                Invalid image URL format
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FaceMealStatus;