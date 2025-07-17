import axios from 'axios';
import React, { useState, useRef } from 'react';
import { toast } from 'react-toastify';

const AddImages = () => {
    const [imageFile, setImageFile] = useState(null);
    const [imageUrl, setImageUrl] = useState('');
    const [name, setName] = useState('');
    const [uploading, setUploading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [previewUrl, setPreviewUrl] = useState('');
    const fileInputRef = useRef(null);
    
    const imgbbAPIKey = '89cd126a18f125ea9e7f8256dcb15acb'; // 🔐 Replace with your actual imgbb key

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        // Create preview URL
        const preview = URL.createObjectURL(file);
        setPreviewUrl(preview);
        setImageFile(file);
        
        // Upload to imgBB
        setUploading(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbAPIKey}`, {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();
            if (data?.success) {
                setImageUrl(data.data.url);
                toast.success('🖼️ Image uploaded successfully!');
            } else {
                toast.error('❌ Image upload failed');
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('❌ Image upload error');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!imageUrl || !name) return;

        setSubmitting(true);

        try {
            const res = await axios.post('/add-image', {
                url: imageUrl,
                name: name,
            });

            console.log(res.data);
            toast.success('🎉 Image added successfully!');
            // Reset form
            setName('');
            setImageUrl('');
            setPreviewUrl('');
            setImageFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (error) {
            console.error('Submit error:', error);
            toast.error('❌ Failed to add image');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const files = e.dataTransfer.files;
        if (files.length) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                const event = { target: { files: [file] } };
                handleImageChange(event);
            }
        }
    };

    return (
        <div className="max-w-2xl mx-auto mt-8 p-6 bg-gradient-to-br from-white to-gray-50 shadow-xl rounded-xl border border-gray-100">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800">Add New Image</h2>
                <p className="text-gray-600 mt-2">Upload and manage your images</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Preview Section */}
                <div 
                    className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center min-h-[300px] bg-gray-50 transition-all hover:border-blue-400"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                >
                    {previewUrl ? (
                        <div className="relative w-full h-full flex flex-col items-center">
                            <div className="relative w-full h-52 overflow-hidden rounded-lg shadow-md mb-4">
                                <img 
                                    src={previewUrl} 
                                    alt="Preview" 
                                    className="w-full h-full object-contain"
                                />
                                {uploading && (
                                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white"></div>
                                    </div>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => fileInputRef.current.click()}
                                className="text-blue-600 font-medium hover:text-blue-800 transition-colors"
                            >
                                Change Image
                            </button>
                        </div>
                    ) : (
                        <div className="text-center">
                            <div className="mx-auto w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <p className="text-gray-600 mb-4">Drag & drop your image here</p>
                            <p className="text-gray-500 text-sm mb-4">OR</p>
                            <button
                                type="button"
                                onClick={() => fileInputRef.current.click()}
                                className="px-5 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                            >
                                Browse Files
                            </button>
                            <p className="text-gray-500 text-xs mt-4">Supports: JPG, PNG, GIF (Max 5MB)</p>
                        </div>
                    )}
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        ref={fileInputRef}
                    />
                </div>

                {/* Form Section */}
                <div className="flex flex-col justify-center">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* URL Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                            <div className="flex items-center rounded-lg border border-gray-300 px-3 py-2 bg-gray-50">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                </svg>
                                <input
                                    type="text"
                                    value={imageUrl}
                                    readOnly
                                    className="w-full bg-transparent text-gray-600 text-sm truncate"
                                    placeholder="Image URL will appear here"
                                />
                            </div>
                        </div>

                        {/* Name Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Image Name</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition"
                                    placeholder="Enter a descriptive name"
                                />
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute right-3 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </div>
                        </div>

                        {/* Status Indicators */}
                        <div className="space-y-2">
                            {uploading && (
                                <div className="flex items-center text-blue-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 animate-spin mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                                    </svg>
                                    <span>Uploading image to cloud...</span>
                                </div>
                            )}
                            
                            {imageUrl && !uploading && (
                                <div className="flex items-center text-green-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span>Image successfully uploaded</span>
                                </div>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={!imageUrl || !name || uploading || submitting}
                            className={`w-full py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center
                                ${uploading || submitting || !imageUrl || !name
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:opacity-90 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'}`}
                        >
                            {submitting ? (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 animate-spin mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                                    </svg>
                                    Adding Image...
                                </>
                            ) : uploading ? (
                                'Uploading Image...'
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                    Add to Gallery
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddImages;