"use client";

import { useState, useEffect, useRef } from 'react';
import { Wallet, LogOut, User, ChevronDown } from 'lucide-react';
import useNFTMarketplaceStore from '@/store/contract-store';
import toast from 'react-hot-toast';
import Image from 'next/image';

// Wallet Connection Modal Component
const WalletConnectionModal = ({ isOpen, onClose }) => {
    const { connectWallet } = useNFTMarketplaceStore();
    const modalRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleConnect = async (walletType) => {
        try {
            await connectWallet(walletType);
            onClose();
        } catch (error) {
            toast.error("Failed to connect wallet: " + (error.message || "Unknown error"));
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div ref={modalRef} className="bg-zinc-900 p-6 rounded-xl w-full max-w-md border border-zinc-700 shadow-xl">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white">Connect Wallet</h3>
                    <button
                        onClick={onClose}
                        className="text-zinc-400 hover:text-white transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <div className="space-y-4">
                    <button
                        onClick={() => handleConnect('metamask')}
                        className="w-full flex items-center justify-between p-4 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors"
                    >
                        <div className="flex items-center">
                            <div className="w-10 h-10 mr-4 flex-shrink-0 relative">
                                <Image src="/metamask.svg" alt="MetaMask" width={40} height={40} />
                            </div>
                            <span className="text-white font-medium">MetaMask</span>
                        </div>
                        <span className="text-sm text-zinc-400">Popular</span>
                    </button>

                    <button
                        onClick={() => handleConnect('brave')}
                        className="w-full flex items-center justify-between p-4 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors"
                    >
                        <div className="flex items-center">
                            <div className="w-10 h-10 mr-4 flex-shrink-0 relative">
                                <Image src="/brave.svg" alt="Brave Wallet" width={40} height={40} />
                            </div>
                            <span className="text-white font-medium">Brave Wallet</span>
                        </div>
                        <span className="text-sm text-zinc-400">Browser</span>
                    </button>

                    <button
                        onClick={() => handleConnect('walletconnect')}
                        className="w-full flex items-center justify-between p-4 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors"
                    >
                        <div className="flex items-center">
                            <div className="w-10 h-10 mr-4 flex-shrink-0 relative">
                                <Image src="/walletconnect.png" alt="WalletConnect" width={40} height={40} />
                            </div>
                            <span className="text-white font-medium">WalletConnect</span>
                        </div>
                        <span className="text-sm text-zinc-400">Mobile</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function WalletButton() {
    const [walletModalOpen, setWalletModalOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    
    const {
        account,
        disconnectWallet,
        chainId
    } = useNFTMarketplaceStore();

    const isWalletConnected = !!account;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };

        if (dropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dropdownOpen]);

    const handleConnect = () => {
        setWalletModalOpen(true);
    };

    const handleDisconnect = async () => {
        try {
            await disconnectWallet();
            setDropdownOpen(false);
        } catch (error) {
            toast.error("Failed to disconnect wallet: " + (error.message || "Unknown error"));
        }
    };

    const shortenAddress = (address) => {
        return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "";
    };

    return (
        <>
            <div className="relative">
                {isWalletConnected ? (
                    <div className="wallet-dropdown">
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600/20 to-amber-500/20 hover:from-purple-600/30 hover:to-amber-500/30 transition-all duration-300 border border-white/10"
                        >
                            <User className="h-4 w-4 text-white" />
                            <span className="font-medium text-white">{shortenAddress(account)}</span>
                            <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${dropdownOpen ? "rotate-180" : ""}`} />
                        </button>

                        {dropdownOpen && (
                            <div ref={dropdownRef} className="absolute right-0 mt-2 w-64 origin-top-right rounded-xl bg-zinc-900 border border-white/10 shadow-xl">
                                <div className="p-3 text-sm text-zinc-400 border-b border-white/10">
                                    Connected to {chainId ? `Chain ID: ${chainId}` : "Unknown"}
                                </div>
                                <div className="p-2">
                                    <button
                                        onClick={handleDisconnect}
                                        className="flex w-full items-center px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 rounded-lg transition-colors duration-200"
                                    >
                                        <LogOut className="mr-3 h-4 w-4" />
                                        Disconnect Wallet
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <button
                        onClick={handleConnect}
                        className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-amber-500 text-white hover:opacity-90 transition-all duration-300 shadow-lg shadow-purple-500/20 hover:shadow-amber-500/30"
                    >
                        <Wallet className="w-5 h-5" />
                        <span className="font-medium">Connect Wallet</span>
                    </button>
                )}
            </div>

            <WalletConnectionModal
                isOpen={walletModalOpen}
                onClose={() => setWalletModalOpen(false)}
            />
        </>
    );
} 