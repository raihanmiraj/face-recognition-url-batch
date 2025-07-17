import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const Layout = () => {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <>
            <nav className="w-full bg-white shadow-md px-4 md:px-8 py-4 flex items-center justify-between relative z-20">
                {/* Logo */}
                <div className="text-2xl font-extrabold gray-blue-700 tracking-tight">
                    <NavLink to="/" className="hover:text-blue-500 transition-colors">Face Recognition</NavLink>
                </div>

                {/* Desktop Menu */}
                <ul className="hidden md:flex gap-8 text-gray-700 font-medium">
                    <li>
                        <NavLink
                            to="/add-image"
                            className={({ isActive }) =>
                                `hover:text-blue-600 transition-colors ${isActive ? 'text-blue-600 font-semibold' : ''}`
                            }
                        >
                            Add Image
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/images-list"
                            className={({ isActive }) =>
                                `hover:text-blue-600 transition-colors ${isActive ? 'text-blue-600 font-semibold' : ''}`
                            }
                        >
                            Image List
                        </NavLink>
                    </li>
                </ul>

                {/* User Avatar */}
                <div className="flex items-center gap-4">
                    <img
                        src="https://i.ibb.co/bK7t3zB/IMG-1661.jpg"
                        alt="User"
                        className="w-10 h-10 rounded-full object-cover border-2 border-blue-500"
                    />
                    {/* Hamburger for mobile */}
                    <button
                        className="md:hidden flex flex-col justify-center items-center w-10 h-10"
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label="Toggle menu"
                    >
                        <span className={`block h-0.5 w-6 bg-blue-700 transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
                        <span className={`block h-0.5 w-6 bg-blue-700 my-1 transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`}></span>
                        <span className={`block h-0.5 w-6 bg-blue-700 transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
                    </button>
                </div>

                {/* Mobile Menu */}
                <div className={`absolute top-full left-0 w-full bg-white shadow-md md:hidden transition-all duration-300 ${menuOpen ? 'block' : 'hidden'}`}>
                    <ul className="flex flex-col gap-2 py-4 px-6 text-gray-700 font-medium">
                        <li>
                            <NavLink
                                to="/add-image"
                                className={({ isActive }) =>
                                    `block py-2 hover:text-blue-600 transition-colors ${isActive ? 'text-blue-600 font-semibold' : ''}`
                                }
                                onClick={() => setMenuOpen(false)}
                            >
                                Add Image
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/images-list"
                                className={({ isActive }) =>
                                    `block py-2 hover:text-blue-600 transition-colors ${isActive ? 'text-blue-600 font-semibold' : ''}`
                                }
                                onClick={() => setMenuOpen(false)}
                            >
                                Image List
                            </NavLink>
                        </li>
                    </ul>
                </div>
            </nav>

            <main className="min-h-[calc(100vh-64px)] bg-gray-50 px-2 md:px-8 py-6">
                <Outlet />
            </main>
        </>
    );
};

export default Layout;