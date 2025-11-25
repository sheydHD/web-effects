'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Header() {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    return (
        <>
            {/* Darkening Overlay for the rest of the page */}
            <div
                className={`fixed inset-0 bg-black transition-opacity duration-300 pointer-events-none ${isDropdownOpen ? 'opacity-10' : 'opacity-0'
                    }`}
                style={{ zIndex: 40 }}
            />

            <header className="fixed top-0 left-0 right-0 z-50">
                {/* Main Header Bar */}
                <div className="bg-[#faf9f7] px-8 py-2 flex items-center" style={{ paddingLeft: '3cm', gap: '0.5cm' }}>
                    {/* Logo */}
                    <Link href="/" className="text-lg font-semibold text-[#0e101a] hover:text-gray-600 transition-colors">
                        Antigravity
                    </Link>

                    {/* Versions Dropdown */}
                    <div
                        className="relative"
                        onMouseEnter={() => setIsDropdownOpen(true)}
                        onMouseLeave={() => setIsDropdownOpen(false)}
                    >
                        <button
                            className="flex items-center gap-2 text-sm font-medium text-[#0e101a] transition-all px-3 py-1.5 rounded-full"
                            style={{
                                backgroundColor: isDropdownOpen ? 'rgba(14, 16, 26, 0.05)' : 'transparent'
                            }}
                        >
                            <span>Versions</span>
                            <svg
                                className={`w-3 h-3 transition-transform duration-300 ease-in-out ${isDropdownOpen ? 'rotate-180' : 'rotate-0'
                                    }`}
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <polyline points="6 9 12 15 18 9" />
                            </svg>
                        </button>

                        {/* Dropdown Menu - Full Width White Stripe */}
                        <div
                            className={`fixed left-0 right-0 bg-[#faf9f7] transition-all duration-300 ease-in-out ${isDropdownOpen
                                ? 'opacity-100 translate-y-0 pointer-events-auto'
                                : 'opacity-0 -translate-y-2 pointer-events-none'
                                }`}
                            style={{
                                top: '40px',
                                paddingTop: '2cm',
                                paddingBottom: '2cm',
                                borderBottomLeftRadius: '35px',
                                borderBottomRightRadius: '35px',
                                boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)'
                            }}
                        >
                            <div className="flex items-center" style={{ paddingLeft: '3cm', gap: '3cm' }}>
                                {/* Left Side - Descriptive Text */}
                                <div className="flex-shrink-0" style={{ maxWidth: '400px' }}>
                                    <h2 className="text-2xl font-semibold text-[#0e101a] mb-2">
                                        Intuitive for every type of builder
                                    </h2>
                                    <p className="text-base text-gray-600">
                                        Explore how Particle Antigravity helps you build
                                    </p>
                                </div>

                                {/* Version Links - 3cm gap from text, on left side */}
                                <div className="flex flex-col gap-1">
                                    <Link
                                        href="/versions/v1"
                                        className="text-sm font-medium text-[#0e101a] hover:text-gray-600 transition-colors py-2 px-4 rounded-full hover:bg-gray-200/50"
                                    >
                                        Version 1
                                    </Link>
                                    <Link
                                        href="/versions/v2"
                                        className="text-sm font-medium text-[#0e101a] hover:text-gray-600 transition-colors py-2 px-4 rounded-full hover:bg-gray-200/50"
                                    >
                                        Version 2
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
        </>
    );
}
