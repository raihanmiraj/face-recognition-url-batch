import React from 'react';
import { Link, Outlet } from 'react-router-dom';

const Layout = () => {
    return (
        <>

            <nav className="w-full bg-white shadow-md px-6 py-4 flex justify-between items-center">
                {/* Logo */}
                <div className="text-xl font-bold text-gray-800">
                    <Link to="/" className="hover:text-blue-600">Face Recognition</Link>
                </div>

                {/* Center Menu (Optional) */}
                <ul className="hidden md:flex gap-6 text-gray-600 font-medium">
                    <Link to={`/add-image`} className="hover:text-blue-600 cursor-pointer">Add Image</Link>
                    <Link to={`/images-list`} className="hover:text-blue-600 cursor-pointer">Image List</Link>
                </ul>

                {/* Right Side Image */}
                <div className="flex items-center gap-4">
                    <img
                        src="https://i.ibb.co/bK7t3zB/IMG-1661.jpg"
                        alt="User"
                        className="w-10 h-10 rounded-full object-cover border-2 border-blue-500"
                    />
                </div>
            </nav>

            <Outlet />
        </>
    );
};

export default Layout;
