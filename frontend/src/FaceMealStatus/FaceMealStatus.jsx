import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as faceapi from 'face-api.js';
import Webcam from 'react-webcam';
import axios from 'axios';

const FaceMealStatus = () => {
    const webcamRef = useRef(null);
    const [isReady, setIsReady] = useState(false);
    const [detectedPerson, setDetectedPerson] = useState(null);
    const [referenceDescriptors, setReferenceDescriptors] = useState([]);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [threshold, setThreshold] = useState(0.5);
    const [error, setError] = useState(null);
    const [peopleData, setPeopleData] = useState([]);
    const [isDetecting, setIsDetecting] = useState(true);

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
                const response = await axios.get('/images-list');
                setPeopleData(response.data);
                setLoadingProgress(20);
                setError(null);
                let peopleDataArr = response.data;

                await Promise.all([
                    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
                    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
                    faceapi.nets.faceLandmark68Net.loadFromUri('/models')
                ]);
                setLoadingProgress(80);

                // Load reference images
                await loadReferenceDescriptors(peopleDataArr);
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
    const loadReferenceDescriptors = async (peopleDataArr) => {
        const descriptors = [];
        let peopleData = [...peopleDataArr];
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
        if (!isReady || !webcamRef.current || referenceDescriptors.length === 0 || !isDetecting) return;

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
    }, [isReady, referenceDescriptors, threshold, isDetecting]);

    // Setup detection interval when ready
    useEffect(() => {
        let intervalId;
        if (isReady && isDetecting) {
            intervalId = setInterval(detectFace, 1000);
        }
        return () => clearInterval(intervalId);
    }, [isReady, detectFace, isDetecting]);

    // Calculate confidence percentage
    const getConfidence = (distance) => {
        return Math.max(0, (1 - distance) * 100).toFixed(1);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6 px-4 sm:px-6">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                        Face Recognition System
                    </h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Real-time face detection and recognition powered by AI
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 max-w-4xl mx-auto flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <strong className="font-medium">System Error:</strong> {error}
                        </div>
                    </div>
                )}

                {!isReady ? (
                    <div className="bg-white rounded-2xl shadow-lg p-6 max-w-3xl mx-auto">
                        <div className="text-center mb-6">
                            <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center bg-blue-50 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-semibold text-gray-800">Initializing Face Recognition</h2>
                            <p className="text-gray-600 mt-1">Loading models and reference images...</p>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Progress</span>
                                <span>{loadingProgress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                                <div
                                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-300"
                                    style={{ width: `${loadingProgress}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Webcam Section */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-2xl shadow-xl overflow-hidden relative">
                                <div className="aspect-video relative">
                                    <Webcam
                                        ref={webcamRef}
                                        audio={false}
                                        screenshotFormat="image/jpeg"
                                        videoConstraints={{
                                            facingMode: 'user',
                                            width: 1280,
                                            height: 720
                                        }}
                                        className="w-full h-full object-cover transform scale-x-[-1]"
                                    />

                                    {/* Detection status overlay */}
                                    <div className="absolute top-4 right-4 flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full ${isDetecting ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`}></div>
                                        <span className="text-sm font-medium text-white bg-black/50 px-2 py-1 rounded-full">
                                            {isDetecting ? 'Detecting' : 'Paused'}
                                        </span>
                                    </div>

                                    {/* Controls */}
                                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3">
                                        <button
                                            onClick={() => setIsDetecting(!isDetecting)}
                                            className="p-3 bg-white/80 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-colors"
                                        >
                                            {isDetecting ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            )}
                                        </button>
                                        <button
                                            onClick={detectFace}
                                            disabled={isDetecting}
                                            className="p-3 bg-white/80 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-colors disabled:opacity-50"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                                    <div className="text-sm text-gray-600">
                                        <span className="font-medium">Live Feed</span>
                                        <span className="ml-2">•</span>
                                        <span className="ml-2">720p</span>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        {referenceDescriptors.length} reference images loaded
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Controls and Results Section */}
                        <div className="space-y-8">
                            {/* Threshold Control */}
                            <div className="bg-white rounded-2xl shadow-xl p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-lg font-bold text-gray-800">Recognition Settings</h2>
                                    <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                        {threshold < 0.4 ? 'Loose' : threshold > 0.55 ? 'Strict' : 'Normal'}
                                    </div>
                                </div>

                                <div className="space-y-5">
                                    <div>
                                        <div className="flex justify-between text-gray-700 mb-2">
                                            <span className="font-medium">Threshold: {threshold}</span>
                                            <span className="text-sm">Confidence: {detectedPerson ? getConfidence(detectedPerson.distance) : '--'}%</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0.3"
                                            max="0.7"
                                            step="0.05"
                                            value={threshold}
                                            onChange={(e) => setThreshold(parseFloat(e.target.value))}
                                            className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-blue-600"
                                        />
                                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                                            <span>Loose (0.3)</span>
                                            <span>Strict (0.7)</span>
                                        </div>
                                    </div>

                                    <div className="relative pt-1">
                                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                                            <span>Current confidence</span>
                                            <span>{detectedPerson ? getConfidence(detectedPerson.distance) : '--'}%</span>
                                        </div>
                                        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-gray-200">
                                            <div
                                                style={{ width: `${detectedPerson ? getConfidence(detectedPerson.distance) : 0}%` }}
                                                className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center rounded-full ${detectedPerson?.name === 'Unknown' || detectedPerson?.name === 'No face'
                                                        ? 'bg-amber-500'
                                                        : detectedPerson?.url
                                                            ? 'bg-green-500'
                                                            : 'bg-gray-300'
                                                    }`}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Results Card */}
                            <div className={`bg-white rounded-2xl shadow-xl p-6 transition-all ${detectedPerson?.name === 'Unknown' || detectedPerson?.name === 'No face'
                                    ? 'bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200'
                                    : detectedPerson?.url
                                        ? 'bg-gradient-to-br from-green-50 to-green-100 border border-green-200'
                                        : 'bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200'
                                }`}>
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-lg font-bold text-gray-800">Detection Results</h2>
                                    <div className={`w-3 h-3 rounded-full ${detectedPerson?.name === 'Unknown' || detectedPerson?.name === 'No face'
                                            ? 'bg-amber-500'
                                            : detectedPerson?.url
                                                ? 'bg-green-500'
                                                : 'bg-gray-500'
                                        }`}></div>
                                </div>

                                {detectedPerson ? (
                                    <div className="space-y-5">
                                        <div className="text-center">
                                            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-3 ${detectedPerson.name === 'Unknown' || detectedPerson.name === 'No face'
                                                    ? 'bg-amber-100 text-amber-700'
                                                    : 'bg-green-100 text-green-700'
                                                }`}>
                                                {detectedPerson.name === 'Unknown' || detectedPerson.name === 'No face' ? (
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                ) : (
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                                    </svg>
                                                )}
                                            </div>

                                            <h3 className={`text-xl font-bold ${detectedPerson.name === 'Unknown' || detectedPerson.name === 'No face'
                                                    ? 'text-amber-700'
                                                    : 'text-green-700'
                                                }`}>
                                                {detectedPerson.name === 'Unknown' || detectedPerson.name === 'No face'
                                                    ? detectedPerson.message
                                                    : `Identified: ${detectedPerson.name}`}
                                            </h3>

                                            {detectedPerson.distance && (
                                                <p className="text-gray-600 mt-1">
                                                    Distance: {detectedPerson.distance.toFixed(4)}
                                                </p>
                                            )}
                                        </div>

                                        {detectedPerson.url && isValidUrl(detectedPerson.url) && (
                                            <div className="mt-4">
                                                <p className="text-sm font-medium text-gray-700 mb-2">Reference Image:</p>
                                                <a
                                                    href={detectedPerson.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="block group"
                                                >
                                                    <div className="border-2 border-gray-200 rounded-xl overflow-hidden transition-all duration-300 group-hover:border-blue-500 group-hover:shadow-lg">
                                                        <img
                                                            src={detectedPerson.url}
                                                            alt={detectedPerson.name}
                                                            className="w-full h-40 object-cover"
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.parentNode.innerHTML = '<div class="bg-red-50 text-red-700 p-4 text-center">Image failed to load</div>';
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="mt-2 text-center">
                                                        <button className="text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center gap-1 text-sm">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                                            </svg>
                                                            View full image
                                                        </button>
                                                    </div>
                                                </a>
                                            </div>
                                        )}

                                        {detectedPerson.url && !isValidUrl(detectedPerson.url) && (
                                            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mt-4 text-sm">
                                                Invalid image URL format
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="w-16 h-16 mx-auto bg-gray-200 rounded-full mb-4"></div>
                                        <p className="text-gray-600">Waiting for detection...</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-gray-200 text-center text-gray-500 text-sm">
                <p>Face Recognition System • Powered by FaceAPI.js</p>
                <p className="mt-1">Real-time face detection and recognition technology</p>
            </div>
        </div>
    );
};

export default FaceMealStatus;