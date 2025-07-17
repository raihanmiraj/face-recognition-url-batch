import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Skeleton Loading Component
const SkeletonCard = () => (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl border border-gray-100">
        <div className="relative aspect-square w-full bg-gradient-to-r from-gray-100 to-gray-200 animate-pulse" />
        <div className="p-4">
            <div className="flex justify-between items-center">
                <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse mb-2"></div>
                <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
                    <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
                </div>
            </div>
        </div>
    </div>
);

const ImageCard = ({
    img,
    editingId,
    updatedName,
    setUpdatedName,
    handleUpdate,
    handleEdit,
    handleDelete,
    setEditingId
}) => {
    const isEditing = editingId === img._id;

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl border border-gray-100 group">
            <div className="relative aspect-square overflow-hidden">
                <img
                    src={img.url}
                    alt={img.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />

                {!isEditing && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                        <div className="text-white font-medium truncate">{img.name}</div>
                    </div>
                )}
            </div>

            <div className="p-4">
                {isEditing ? (
                    <div className="space-y-3">
                        <input
                            type="text"
                            value={updatedName}
                            onChange={(e) => setUpdatedName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleUpdate(img._id)}
                                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2 px-4 rounded-lg font-medium hover:opacity-90 transition-opacity"
                            >
                                Save
                            </button>
                            <button
                                onClick={() => setEditingId(null)}
                                className="px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex justify-between items-center">
                        <h3 className="font-medium text-gray-800 truncate max-w-[70%]">{img.name}</h3>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <button
                                onClick={() => handleEdit(img._id, img.name)}
                                className="p-2 rounded-full bg-blue-50 text-blue-500 hover:bg-blue-100 transition-colors"
                                title="Edit"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                            </button>
                            <button
                                onClick={() => handleDelete(img._id)}
                                className="p-2 rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                                title="Delete"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const ImageList = () => {
    const [images, setImages] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [updatedName, setUpdatedName] = useState('');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchImages();
    }, []);

    const fetchImages = async () => {
        try {
            setRefreshing(true);
            const res = await axios.get('/images-list');
            setImages(res.data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load images');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this image?')) return;

        try {
            await axios.delete(`/images/${id}`);
            setImages(images.filter((img) => img._id !== id));
            toast.success('Image deleted successfully');
        } catch (error) {
            console.error(error);
            toast.error('Failed to delete image');
        }
    };

    const handleEdit = (id, currentName) => {
        setEditingId(id);
        setUpdatedName(currentName);
    };

    const handleUpdate = async (id) => {
        if (!updatedName.trim()) return;

        try {
            await axios.put(`/images/${id}`, { name: updatedName });
            setImages(
                images.map((img) =>
                    img._id === id ? { ...img, name: updatedName } : img
                )
            );
            setEditingId(null);
            toast.success('Image name updated');
        } catch (error) {
            console.error(error);
            toast.error('Failed to update name');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Image Gallery</h1>
                        <p className="text-gray-600 mt-2">
                            {loading ? 'Loading images...' : `Showing ${images.length} images`}
                        </p>
                    </div>
                    <button
                        onClick={fetchImages}
                        disabled={refreshing}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                        </svg>
                        {refreshing ? 'Refreshing...' : 'Refresh'}
                    </button>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                ) : images.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
                        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-medium text-gray-900 mb-2">No images found</h3>
                        <p className="text-gray-600 max-w-md mx-auto mb-6">
                            There are no images in your gallery yet. Add some images or try refreshing the list.
                        </p>
                        <button
                            onClick={fetchImages}
                            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                        >
                            Refresh Gallery
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {images.map((img) => (
                            <ImageCard
                                key={img._id}
                                img={img}
                                editingId={editingId}
                                updatedName={updatedName}
                                setUpdatedName={setUpdatedName}
                                handleUpdate={handleUpdate}
                                handleEdit={handleEdit}
                                handleDelete={handleDelete}
                                setEditingId={setEditingId}
                            />
                        ))}
                    </div>
                )}
            </div>

            <ToastContainer
                position="bottom-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
            />
        </div>
    );
};

export default ImageList;