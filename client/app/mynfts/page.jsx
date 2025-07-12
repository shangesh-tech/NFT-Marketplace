"use client";

import { useEffect, useState } from "react";
import { Search, Grid, List } from "lucide-react";
import useNFTMarketplaceStore from "@/store/contract-store";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

// Fallback images in case NFT metadata is missing
const fallbackImage = "/nft-placeholder.jpg";

    function NFTCard({ tokenId, title, creator, price, image,  onResell }) {
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
                    <button 
                        onClick={() => onResell(tokenId)}
                        className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-amber-500 text-white font-semibold shadow hover:scale-105 transition-all"
                    >
                        Resell
                    </button>
                </div>
            </div>
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
        </div>
    );
}

export default function MyNFTs() {
    const [viewMode, setViewMode] = useState("grid");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCollection, setSelectedCollection] = useState("all");
    const [sortBy, setSortBy] = useState("newest");
    const [nfts, setNfts] = useState([]);
    const [collections, setCollections] = useState(["all"]);
    const [isLoading, setIsLoading] = useState(true);
    const [resellTokenId, setResellTokenId] = useState(null);
    const [resellPrice, setResellPrice] = useState("");
    const [showResellModal, setShowResellModal] = useState(false);
    
    const router = useRouter();
    
    const { 
        account, 
        loading, 
        loadContractData,
        contract,
        fetchMyNFTs,
        fetchTokenMetadata,
        resellToken,
        listingPrice
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
                
                // Fetch user's NFTs using the fetchMyNFTs function
                const items = await fetchMyNFTs();
                if (items && items.length > 0) {
                    await processNFTs(items);
                } else {
                    setNfts([]);
                    setIsLoading(false);
                }
            } catch (error) {
                console.error("Error loading NFTs:", error);
                toast.error("Failed to load your NFTs from blockchain");
                setIsLoading(false);
            }
        };

        loadNFTs();
    }, [contract, account, loadContractData, fetchMyNFTs]);

    // Process market items into NFT display data
    const processNFTs = async (items) => {
        if (!items || items.length === 0) {
            setNfts([]);
            setIsLoading(false);
            return;
        }

        try {
            const uniqueCollections = new Set(["all"]);
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
                            
                            // Add collection to unique collections
                            if (metadata.collection) {
                                uniqueCollections.add(metadata.collection);
                            }
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
            setCollections(Array.from(uniqueCollections));
            setIsLoading(false);
            
        } catch (error) {
            console.error("Error processing NFTs:", error);
            toast.error("Failed to process NFT data");
            setIsLoading(false);
        }
    };

    // Handle reselling an NFT
    const handleResellNFT = async (tokenId) => {
        setResellTokenId(tokenId);
        setShowResellModal(true);
    };

    // Execute the resell transaction
    const executeResell = async () => {
        if (!resellPrice || parseFloat(resellPrice) <= 0) {
            toast.error("Please enter a valid price");
            return;
        }

        try {
            setShowResellModal(false);
            toast.loading("Processing resell...", { id: "resell-nft" });
            
            const tx = await resellToken(resellTokenId, resellPrice);
            
            if (tx) {
                toast.success("NFT listed for resale successfully!", { id: "resell-nft" });
                
                // Reload NFT data after reselling
                setIsLoading(true);
                await loadContractData();
                const updatedItems = await fetchMyNFTs();
                await processNFTs(updatedItems);
            } else {
                toast.error("Transaction failed", { id: "resell-nft" });
            }
        } catch (error) {
            console.error("Error reselling NFT:", error);
            toast.error(`Failed to resell NFT: ${error.message}`, { id: "resell-nft" });
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
                    <p className="text-zinc-400">Please connect your wallet to view your NFTs</p>
                    <button 
                        onClick={() => router.push('/')}
                        className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-amber-500 text-white font-semibold shadow hover:scale-105 transition-all"
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
                    <p className="text-gray-600 dark:text-gray-400">Loading your NFTs from blockchain...</p>
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
                            My
                        </span>{" "}
                        NFTs
                    </h1>
                    <p className="text-lg text-zinc-400">
                        Manage and resell your owned NFT collection
                    </p>
                </div>

                {/* Search & Filters*/}
                <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 mb-8 justify-center">
                    {/* Search */}
                    <div className="relative flex-1 w-full max-w-lg">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search your NFTs..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 md:py-3 bg-zinc-900/80 border border-white/10 rounded-xl text-white placeholder-zinc-400 focus:outline-none focus:border-purple-500 focus:bg-zinc-900/90 transition-all duration-300"
                        />
                    </div>
                    {/* Filters & Controls */}
                    <div className="flex flex-wrap gap-3 md:gap-4 items-center">
                        {/* Collection */}
                        <select
                            value={selectedCollection}
                            onChange={(e) => setSelectedCollection(e.target.value)}
                            className="px-4 py-2 bg-zinc-900/80 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-all duration-300"
                        >
                            {collections.map((collection) => (
                                <option key={collection} value={collection}>
                                    {collection === "all" ? "All Collections" : collection}
                                </option>
                            ))}
                        </select>
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
                        <p className="text-xl text-zinc-400">You don't own any NFTs yet</p>
                        <button 
                            onClick={() => router.push('/marketplace')}
                            className="mt-6 px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-amber-500 text-white font-semibold shadow hover:scale-105 transition-all"
                        >
                            Browse Marketplace
                        </button>
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
                                onResell={handleResellNFT}
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
                                <button 
                                    onClick={() => handleResellNFT(nft.tokenId)}
                                    className="ml-4 px-5 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-amber-500 text-white font-semibold shadow hover:scale-105 transition-all"
                                >
                                    Resell
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Resell Modal */}
            {showResellModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 max-w-md w-full">
                        <h3 className="text-2xl font-bold mb-4 text-white">Resell Your NFT</h3>
                        <p className="text-zinc-400 mb-2">Listing fee: {listingPrice} ETH</p>
                        <div className="mb-4">
                            <label className="block text-zinc-400 mb-2">New Price (ETH)</label>
                            <input
                                type="number"
                                min="0.001"
                                step="0.001"
                                value={resellPrice}
                                onChange={(e) => setResellPrice(e.target.value)}
                                className="w-full px-4 py-2 bg-zinc-800 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
                                placeholder="Enter price in ETH"
                            />
                        </div>
                        <div className="flex space-x-4">
                            <button
                                onClick={() => setShowResellModal(false)}
                                className="flex-1 px-4 py-2 border border-white/10 rounded-xl text-white hover:bg-zinc-800 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={executeResell}
                                className="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-amber-500 text-white font-semibold shadow hover:scale-105 transition-all"
                            >
                                List for Sale
                            </button>
                        </div>
                    </div>
                </div>
            )}
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