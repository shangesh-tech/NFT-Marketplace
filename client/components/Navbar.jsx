"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import WalletButton from './WalletButton';

export const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { href: '/marketplace', label: 'Marketplace' },
        { href: '/mynfts', label: 'My NFTs' },
        { href: '/listed', label: 'Listed NFTs' },
        { href: '/create', label: 'Create' },
    ];

    return (
        <header className={`fixed w-full top-0 z-50 transition-all duration-500 ${
            isScrolled
                ? 'bg-black/80 backdrop-blur-md border-b border-white/10'
                : 'bg-transparent'
        }`}>
            <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between">
                <Link href="/" className="text-2xl font-bold font-orbitron bg-gradient-to-r from-purple-500 via-cyan-400 to-amber-400 bg-clip-text text-transparent hover:scale-105 transition-all duration-300">
                    HeroNFT
                </Link>

                <div className="flex items-center gap-4">
                    <nav className="hidden md:flex items-center gap-1 md:gap-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`px-3 py-2 text-sm rounded-lg transition-all ${
                                    pathname === link.href
                                        ? 'bg-zinc-800/80 text-white'
                                        : 'hover:bg-zinc-800 text-white/80'
                                }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                    <WalletButton />

                    <button
                        className="md:hidden p-2 rounded-lg hover:bg-zinc-800 transition-colors"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? (
                            <X className="w-6 h-6 text-white" />
                        ) : (
                            <Menu className="w-6 h-6 text-white" />
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation */}
            {isMenuOpen && (
                <div className="md:hidden px-4 pb-3 bg-black/80 backdrop-blur-md border-t border-white/5 animate-in slide-in-from-top duration-300">
                    <nav className="flex flex-wrap items-center justify-center gap-2 py-3">
                        {navLinks.map((link, index) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setIsMenuOpen(false)}
                                className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                                    pathname === link.href
                                        ? 'bg-zinc-800 text-white'
                                        : 'hover:bg-zinc-800 text-white/80'
                                } ${
                                    link.href === '/create'
                                        ? 'bg-gradient-to-r from-purple-600 to-amber-500 text-white font-semibold shadow hover:scale-105'
                                        : ''
                                }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                </div>
            )}

            {/* Always visible mobile navigation */}
            <div className="md:hidden px-4 pb-3">
                <nav className="flex flex-wrap items-center justify-center gap-2">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                                pathname === link.href
                                    ? 'bg-zinc-800 text-white'
                                    : 'hover:bg-zinc-800 text-white/80'
                            } ${
                                link.href === '/create'
                                    ? 'bg-gradient-to-r from-purple-600 to-amber-500 text-white font-semibold shadow hover:scale-105'
                                    : ''
                            }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>
            </div>
        </header>
    );
};