"use client";

import { useEffect, useState } from "react";
import { Search, Grid, List } from "lucide-react";
import useNFTMarketplaceStore from "@/store/contract-store";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

// Fallback images in case NFT metadata is missing
const fallbackImage = "/nft-placeholder.jpg";

function NFTCard({ tokenId, title, creator, price, image }) {
    return (
        <div className="group relative bg-gradient-to-br from-black/70 via-zinc-900/80 to-black/60 rounded-2xl overflow-hidden shadow-xl border border-white/10 hover:scale-[1.03] hover:shadow-purple-500/30 transition-all duration-300">
            <div className="relative w-full h-56 overflow-hidden">
                <img
                    src={image || fallbackImage}
                    alt={title}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = fallbackImage;
                    }}
                />
            </div>
            <div className="p-5">
                <h3 className="text-lg font-bold mb-1 text-white font-orbitron">{title || `NFT #${tokenId}`}</h3>
                <div className="flex items-center justify-between text-sm text-zinc-400 mb-2">
                    <span>by {creator || "Unknown"}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="font-bold text-gradient-primary font-orbitron">{price} ETH</span>
                    <span className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-600 to-green-500 text-white font-semibold shadow">
                        Listed
                    </span>
                </div>
            </div>
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
        </div>
    );
}

export default function ListedNFTs() {
    const [viewMode, setViewMode] = useState("grid");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCollection, setSelectedCollection] = useState("all");
    const [sortBy, setSortBy] = useState("newest");
    const [nfts, setNfts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const router = useRouter();
    
    const { 
        account, 
        loading, 
        loadContractData,
        contract,
        fetchItemsListed,
        fetchTokenMetadata
    } = useNFTMarketplaceStore();

    // Load NFT data from blockchain
    useEffect(() => {
        const loadNFTs = async () => {
            if (!contract || !account) {
                setIsLoading(false);
                return;
            }
            
            try {
                setIsLoading(true);
                await loadContractData();
                
                // Fetch user's listed NFTs using the fetchItemsListed function
                const items = await fetchItemsListed();
                if (items && items.length > 0) {
                    await processNFTs(items);
                } else {
                    setNfts([]);
                    setIsLoading(false);
                }
            } catch (error) {
                console.error("Error loading NFTs:", error);
                toast.error("Failed to load your listed NFTs from blockchain");
                setIsLoading(false);
            }
        };

        loadNFTs();
    }, [contract, account, loadContractData, fetchItemsListed]);

    // Process market items into NFT display data
    const processNFTs = async (items) => {
        if (!items || items.length === 0) {
            setNfts([]);
            setIsLoading(false);
            return;
        }

        try {
            const processedNFTs = await Promise.all(
                items.map(async (item) => {
                    try {
                        // Get token metadata using the fetchTokenMetadata function
                        const tokenId = Number(item.tokenId);
                        const metadata = await fetchTokenMetadata(tokenId);
                        
                        // Default values if metadata is missing
                        let title = `NFT #${tokenId}`;
                        let description = "";
                        let image = fallbackImage;
                        let collection = "Uncategorized";
                        let attributes = [];
                        let creator = item.seller ? (item.seller.slice(0, 6) + "..." + item.seller.slice(-4)) : "Unknown";
                        
                        // Use metadata if available
                        if (metadata) {
                            title = metadata.name || title;
                            description = metadata.description || description;
                            image = metadata.image || image;
                            collection = metadata.collection || collection;
                            attributes = metadata.attributes || attributes;
                            creator = metadata.creator || creator;
                        }
                        
                        return {
                            id: tokenId.toString(),
                            tokenId: tokenId,
                            title: title,
                            description: description,
                            creator: creator,
                            price: item.price,
                            priceWei: item.priceWei,
                            image: image,
                            collection: collection,
                            attributes: attributes,
                            seller: item.seller,
                            owner: item.owner,
                            sold: item.sold,
                        };
                    } catch (err) {
                        console.error(`Error processing NFT ${item.tokenId}:`, err);
                        return null;
                    }
                })
            );
            
            // Filter out null entries from failed processing
            const validNFTs = processedNFTs.filter(nft => nft !== null);
            setNfts(validNFTs);
            setIsLoading(false);
            
        } catch (error) {
            console.error("Error processing NFTs:", error);
            toast.error("Failed to process NFT data");
            setIsLoading(false);
        }
    };

    // Filtering
    let filteredNFTs = nfts.filter((nft) => {
        const matchesSearch =
            nft.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            nft.creator.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCollection =
            selectedCollection === "all" || nft.collection === selectedCollection;
        return matchesSearch && matchesCollection;
    });

    // Sorting
    filteredNFTs = [...filteredNFTs].sort((a, b) => {
        if (sortBy === "newest") return b.id - a.id;
        if (sortBy === "oldest") return a.id - b.id;
        if (sortBy === "price_low") return parseFloat(a.price) - parseFloat(b.price);
        if (sortBy === "price_high") return parseFloat(b.price) - parseFloat(a.price);
        return 0;
    });

    if (!account) {
        return (
            <div className="min-h-screen pt-24 px-4 bg-gradient-to-br from-purple-950/60 via-black/80 to-amber-900/10 flex items-center justify-center">
                <div className="text-center space-y-6">
                    <h2 className="text-3xl font-bold text-white">Connect Your Wallet</h2>
                    <p className="text-zinc-400">Please connect your wallet to view your listed NFTs</p>
                    <button 
                        onClick={() => router.push('/')}
                        className="mt-6 px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-amber-500 text-white font-semibold shadow hover:scale-105 transition-all"
                    >
                        Go to Home
                    </button>
                </div>
            </div>
        );
    }

    if (loading || isLoading) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading your listed NFTs from blockchain...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 px-4 bg-gradient-to-br from-purple-950/60 via-black/80 to-amber-900/10">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-4xl md:text-6xl font-bold font-orbitron mb-4">
                        <span className="bg-gradient-to-r from-purple-500 via-cyan-400 to-amber-400 bg-clip-text text-transparent">
                            My Listed
                        </span>{" "}
                        NFTs
                    </h1>
                    <p className="text-lg text-zinc-400">
                        View all your NFTs currently for sale in the marketplace
                    </p>
                </div>

                {/* Search & Filters*/}
                <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 mb-8 justify-center">
                    {/* Search */}
                    <div className="relative flex-1 w-full max-w-lg">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search your listed NFTs..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 md:py-3 bg-zinc-900/80 border border-white/10 rounded-xl text-white placeholder-zinc-400 focus:outline-none focus:border-purple-500 focus:bg-zinc-900/90 transition-all duration-300"
                        />
                    </div>
                    {/* Filters & Controls */}
                    <div className="flex flex-wrap gap-3 md:gap-4 items-center">
                        {/* Sort */}
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-4 py-2 bg-zinc-900/80 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-all duration-300"
                        >
                            {sortOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        {/* View Mode */}
                        <div className="flex items-center space-x-1 bg-zinc-900/80 rounded-xl p-1 border border-white/10">
                            <button
                                onClick={() => setViewMode("grid")}
                                className={`px-3 py-1 rounded-lg transition-all duration-200 ${viewMode === "grid"
                                    ? "bg-gradient-to-r from-purple-600 to-amber-500 text-white shadow"
                                    : "text-zinc-400 hover:bg-zinc-800"
                                    }`}
                                aria-label="Grid view"
                            >
                                <Grid className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode("list")}
                                className={`px-3 py-1 rounded-lg transition-all duration-200 ${viewMode === "list"
                                    ? "bg-gradient-to-r from-purple-600 to-amber-500 text-white shadow"
                                    : "text-zinc-400 hover:bg-zinc-800"
                                    }`}
                                aria-label="List view"
                            >
                                <List className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Results Count */}
                <div className="flex items-center justify-between mb-8">
                    <p className="text-zinc-400">
                        Showing {filteredNFTs.length} of {nfts.length} NFTs
                    </p>
                </div>

                {/* NFT Grid/List */}
                {filteredNFTs.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-xl text-zinc-400">You don't have any NFTs listed for sale</p>
                        <div className="mt-6 flex flex-wrap gap-4 justify-center">
                            <button 
                                onClick={() => router.push('/mynfts')}
                                className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-amber-500 text-white font-semibold shadow hover:scale-105 transition-all"
                            >
                                View My NFTs
                            </button>
                            <button 
                                onClick={() => router.push('/marketplace')}
                                className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold shadow hover:scale-105 transition-all"
                            >
                                Browse Marketplace
                            </button>
                        </div>
                    </div>
                ) : viewMode === "grid" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-12">
                        {filteredNFTs.map((nft) => (
                            <NFTCard 
                                key={nft.id} 
                                tokenId={nft.tokenId}
                                title={nft.title} 
                                creator={nft.creator}
                                price={nft.price}
                                image={nft.image}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4 mb-12">
                        {filteredNFTs.map((nft) => (
                            <div
                                key={nft.id}
                                className="bg-black/30 backdrop-blur-lg border border-white/10 rounded-2xl p-6 flex items-center gap-6 hover:shadow-lg hover:shadow-purple-500/20 transition-all"
                            >
                                <img
                                    src={nft.image || fallbackImage}
                                    alt={nft.title}
                                    className="w-24 h-24 object-cover rounded-xl"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = fallbackImage;
                                    }}
                                />
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-xl font-bold font-orbitron text-white truncate">
                                        {nft.title}
                                    </h3>
                                    <p className="text-zinc-400 truncate">by {nft.creator}</p>
                                    <p className="text-sm text-zinc-500 truncate">{nft.collection}</p>
                                </div>
                                <div className="text-right min-w-[90px]">
                                    <p className="text-lg font-bold bg-gradient-to-r from-purple-500 via-cyan-400 to-amber-400 bg-clip-text text-transparent font-orbitron">
                                        {nft.price} ETH
                                    </p>
                                </div>
                                <span className="ml-4 px-5 py-2 rounded-lg bg-gradient-to-r from-green-600 to-green-500 text-white font-semibold shadow">
                                    Listed
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// Sort options
const sortOptions = [
    { value: "newest", label: "Newest" },
    { value: "oldest", label: "Oldest" },
    { value: "price_low", label: "Price: Low to High" },
    { value: "price_high", label: "Price: High to Low" },
]; 