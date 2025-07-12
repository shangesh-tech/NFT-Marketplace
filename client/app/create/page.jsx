"use client"
import { useState } from "react";
import {
    Upload,
    Image,
    Sparkles,
    ChevronRight,
    ChevronLeft,
    Check,
    Zap,
    Eye,
    Heart,
    Star,
    Loader2,
} from "lucide-react";
import { createNFTOnIPFS } from "@/utils/ipfs";
import useNFTMarketplaceStore from "@/store/contract-store";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const steps = [
    {
        id: 1,
        title: "Choose Collection",
        description: "Select your hero universe",
        icon: <Star className="w-5 h-5" />,
    },
    {
        id: 2,
        title: "Upload Artwork",
        description: "Add your NFT image",
        icon: <Image className="w-5 h-5" />,
    },
    {
        id: 3,
        title: "NFT Details",
        description: "Name and describe your NFT",
        icon: <Sparkles className="w-5 h-5" />,
    },
    {
        id: 4,
        title: "Pricing & Mint",
        description: "Set price and create NFT",
        icon: <Zap className="w-5 h-5" />,
    },
];

const collections = [
    {
        id: "avengers",
        name: "Avengers Heroes",
        gradient: "from-red-500 via-blue-600 to-yellow-400",
        icon: "🦸‍♂️",
    },
    {
        id: "transformers",
        name: "Transformers",
        gradient: "from-blue-500 via-cyan-500 to-purple-600",
        icon: "🤖",
    },
    {
        id: "decepticons",
        name: "Decepticons",
        gradient: "from-purple-600 via-red-500 to-orange-500",
        icon: "🔥",
    },
];

export default function Create() {
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedCollection, setSelectedCollection] = useState("");
    const [uploadedImage, setUploadedImage] = useState(null);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [nftName, setNftName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    
    // Get contract functions from store
    const { createToken, account } = useNFTMarketplaceStore();
    const router = useRouter();

    const handleImageUpload = (event) => {
        const file = event.target.files?.[0];
        if (file) {
            // Store the actual file for IPFS upload
            setUploadedFile(file);
            
            // Create preview URL for display
            const reader = new window.FileReader();
            reader.onload = (e) => {
                setUploadedImage(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const nextStep = () => {
        if (currentStep < steps.length) setCurrentStep(currentStep + 1);
    };

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    // Only require selectedCollection for step 1
    const canProceed = () => {
        switch (currentStep) {
            case 1:
                return !!selectedCollection;
            case 2:
                return uploadedImage;
            case 3:
                return nftName && description;
            case 4:
                return price;
            default:
                return false;
        }
    };

    const selectedCollectionData = collections.find(
        (c) => c.id === selectedCollection
    );

    // Handle NFT creation with IPFS upload and blockchain minting
    const handleCreateNFT = async () => {
        if (!account) {
            toast.error("Please connect your wallet first");
            return;
        }

        if (!uploadedFile || !nftName || !description || !price || !selectedCollection) {
            toast.error("Please fill in all required fields");
            return;
        }

        setIsCreating(true);


        try {
            // Step 1: Upload to IPFS (image + metadata)
            const ipfsResult = await createNFTOnIPFS({
                imageFile: uploadedFile,
                name: nftName,
                description: description,
                collection: selectedCollection,
                attributes: [
                    {
                        trait_type: "Rarity",
                        value: "Epic"
                    },
                    {
                        trait_type: "Creator",
                        value: "Hero Marketplace"
                    }
                ]
            });

            if (!ipfsResult.success) {
                throw new Error(ipfsResult.error);
            }

            // Step 2: Mint NFT on blockchain
            toast.loading("Minting NFT on blockchain...", { id: "nft-mint" });
            
            const tokenId = await createToken(ipfsResult.metadataUrl, price);
            
            if (tokenId) {
                toast.success(`NFT minted successfully! Token ID: ${tokenId}`, { id: "nft-mint" });

                router.push('/'); 

                // Reset form
                setCurrentStep(1);
                setSelectedCollection("");
                setUploadedImage(null);
                setUploadedFile(null);
                setNftName("");
                setDescription("");
                setPrice("");
            } else {
                throw new Error("Failed to mint NFT on blockchain");
            }
        } catch (error) {
            console.error("NFT creation error:", error);
            toast.error(`Failed to create NFT: ${error.message}`, { id: "nft-mint" });
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="min-h-screen pt-24 px-4 bg-gradient-to-br from-purple-950/60 via-black/80 to-amber-900/10">
            <div className="container mx-auto max-w-6xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl md:text-7xl font-bold font-orbitron mb-6">
                        <span className="bg-gradient-to-r from-purple-500 via-cyan-400 to-amber-400 bg-clip-text text-transparent">
                            Mint Your
                        </span>
                        <br />
                        <span className="bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-400 bg-clip-text text-transparent">
                            Hero
                        </span>
                    </h1>
                    <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
                        Transform your superhero artwork into legendary NFTs with our streamlined creation process
                    </p>
                </div>

                {/* Progress Indicator */}
                <div className="mb-16">
                    <div className="flex items-center justify-center space-x-8">
                        {steps.map((step, index) => (
                            <div key={step.id} className="flex items-center">
                                <div className="flex flex-col items-center space-y-3">
                                    <div
                                        className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-200
                      ${currentStep === step.id
                                                ? "border-yellow-400 bg-yellow-400/10 text-yellow-400"
                                                : currentStep > step.id
                                                    ? "border-green-400 bg-green-400/10 text-green-400"
                                                    : "border-zinc-700 bg-zinc-800 text-zinc-400"
                                            }
                    `}
                                    >
                                        {currentStep > step.id ? (
                                            <Check className="w-5 h-5" />
                                        ) : (
                                            step.icon
                                        )}
                                    </div>
                                    <div className="text-center hidden md:block">
                                        <p className="font-semibold text-sm text-white">{step.title}</p>
                                        <p className="text-xs text-zinc-400">{step.description}</p>
                                    </div>
                                </div>
                                {index < steps.length - 1 && (
                                    <div
                                        className={`w-16 h-0.5 mx-4 transition-colors duration-300 ${currentStep > step.id ? "bg-green-400" : "bg-zinc-700"
                                            }`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Step Content */}
                <div className="grid lg:grid-cols-2 gap-12 items-start">
                    {/* Left Column - Step Content */}
                    <div className="space-y-8">
                        {/* Step 1: Collection Selection */}
                        {currentStep === 1 && (
                            <div className="bg-zinc-900/80 p-8 rounded-3xl shadow-lg">
                                <h3 className="text-3xl font-bold font-orbitron mb-6 bg-gradient-to-r from-purple-500 via-cyan-400 to-amber-400 bg-clip-text text-transparent">
                                    Choose Your Universe
                                </h3>
                                <p className="text-zinc-400 mb-8">
                                    Select the collection that best represents your superhero NFT
                                </p>
                                <div className="space-y-4">
                                    {collections.map((collection) => (
                                        <div
                                            key={collection.id}
                                            className={`relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300 ${selectedCollection === collection.id
                                                ? "ring-2 ring-yellow-400 scale-[1.02]"
                                                : "hover:scale-[1.01]"
                                                }`}
                                            onClick={() => setSelectedCollection(collection.id)}
                                        >
                                            <div
                                                className={`bg-gradient-to-r ${collection.gradient} p-6 text-white flex items-center space-x-3`}
                                            >
                                                <span className="text-3xl">{collection.icon}</span>
                                                <h4 className="text-xl font-bold font-orbitron">
                                                    {collection.name}
                                                </h4>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Step 2: Upload Artwork */}
                        {currentStep === 2 && (
                            <div className="bg-zinc-900/80 p-8 rounded-3xl shadow-lg">
                                <h3 className="text-3xl font-bold font-orbitron mb-6 bg-gradient-to-r from-purple-500 via-cyan-400 to-amber-400 bg-clip-text text-transparent">
                                    Upload Your Artwork
                                </h3>
                                <p className="text-zinc-400 mb-8">
                                    Add the visual representation of your NFT
                                </p>
                                <div className="border-2 border-dashed border-yellow-400/30 rounded-2xl p-12 text-center hover:border-yellow-400/50 transition-colors duration-300">
                                    {uploadedImage ? (
                                        <div className="space-y-6">
                                            <div className="relative inline-block">
                                                <img
                                                    src={uploadedImage}
                                                    alt="Preview"
                                                    className="w-48 h-48 object-cover rounded-2xl shadow-2xl"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-2xl pointer-events-none" />
                                            </div>
                                            <div>
                                                <p className="text-lg font-semibold text-white mb-2">
                                                    Perfect! Your artwork looks amazing
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setUploadedImage(null);
                                                        setUploadedFile(null);
                                                    }}
                                                    className="inline-flex items-center px-4 py-2 rounded-lg border border-yellow-400 text-yellow-400 bg-transparent hover:bg-yellow-400/10 transition-all"
                                                >
                                                    <Upload className="w-4 h-4 mr-2" />
                                                    Change Image
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            <div className="w-24 h-24 bg-yellow-400/20 rounded-2xl flex items-center justify-center mx-auto">
                                                <Image className="w-12 h-12 text-yellow-400" />
                                            </div>
                                            <div>
                                                <p className="text-xl font-semibold text-white mb-2">
                                                    Drop your artwork here
                                                </p>
                                                <p className="text-zinc-400 mb-6">
                                                    PNG, JPG, GIF up to 50MB • Recommended: 1000x1000px
                                                </p>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageUpload}
                                                    className="hidden"
                                                    id="image-upload"
                                                />
                                                <label htmlFor="image-upload">
                                                    <span className="inline-flex items-center px-5 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-amber-500 text-white font-semibold shadow hover:scale-105 transition-all cursor-pointer">
                                                        <Upload className="w-5 h-5 mr-2" />
                                                        Choose File
                                                    </span>
                                                </label>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Step 3: NFT Details */}
                        {currentStep === 3 && (
                            <div className="bg-zinc-900/80 p-8 rounded-3xl shadow-lg">
                                <h3 className="text-3xl font-bold font-orbitron mb-6 bg-gradient-to-r from-purple-500 via-cyan-400 to-amber-400 bg-clip-text text-transparent">
                                    NFT Details
                                </h3>
                                <p className="text-zinc-400 mb-8">
                                    Give your NFT a unique identity
                                </p>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-lg font-semibold text-white mb-3">
                                            NFT Name
                                        </label>
                                        <input
                                            type="text"
                                            value={nftName}
                                            onChange={(e) => setNftName(e.target.value)}
                                            placeholder="e.g., Legendary Hero Edition"
                                            className="w-full p-4 bg-zinc-800 border border-white/20 rounded-2xl text-white placeholder-zinc-400 focus:outline-none focus:border-yellow-400 focus:bg-zinc-900 transition-all duration-300 text-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-lg font-semibold text-white mb-3">
                                            Description
                                        </label>
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Tell the world about your legendary NFT..."
                                            rows={4}
                                            className="w-full p-4 bg-zinc-800 border border-white/20 rounded-2xl text-white placeholder-zinc-400 focus:outline-none focus:border-yellow-400 focus:bg-zinc-900 transition-all duration-300 resize-none text-lg"
                                        />
                                    </div>
                                    {/* Royalty Percentage removed */}
                                </div>
                            </div>
                        )}

                        {/* Step 4: Pricing & Mint */}
                        {currentStep === 4 && (
                            <div className="bg-zinc-900/80 p-8 rounded-3xl shadow-lg">
                                <h3 className="text-3xl font-bold font-orbitron mb-6 bg-gradient-to-r from-purple-500 via-cyan-400 to-amber-400 bg-clip-text text-transparent">
                                    Set Price & Mint
                                </h3>
                                <p className="text-zinc-400 mb-8">
                                    Final step to bring your NFT to life
                                </p>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-lg font-semibold text-white mb-3">
                                            Listing Price
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={price}
                                                onChange={(e) => setPrice(e.target.value)}
                                                placeholder="0.00"
                                                step="0.01"
                                                className="w-full p-4 bg-zinc-800 border border-white/20 rounded-2xl text-white placeholder-zinc-400 focus:outline-none focus:border-yellow-400 focus:bg-zinc-900 transition-all duration-300 text-lg pr-16"
                                            />
                                            <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white font-semibold">
                                                ETH
                                            </span>
                                        </div>
                                    </div>
                                    {/* Transaction Summary removed */}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Preview */}
                    <div className="lg:sticky lg:top-32">
                        <div className="bg-zinc-900/80 p-8 rounded-3xl shadow-lg">
                            <h4 className="text-2xl font-bold font-orbitron mb-6 bg-gradient-to-r from-cyan-400 to-amber-400 bg-clip-text text-transparent">
                                Live Preview
                            </h4>
                            {/* NFT Card Preview */}
                            <div className="max-w-md mx-auto">
                                <div className="p-6">
                                    <div className="relative overflow-hidden rounded-2xl mb-6">
                                        {uploadedImage ? (
                                            <img
                                                src={uploadedImage}
                                                alt="NFT Preview"
                                                className="w-full h-64 object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-64 bg-zinc-800 flex items-center justify-center">
                                                <div className="text-center">
                                                    <Image className="w-12 h-12 text-zinc-400 mx-auto mb-2" />
                                                    <p className="text-zinc-400">Upload image to preview</p>
                                                </div>
                                            </div>
                                        )}
                                        {selectedCollectionData && (
                                            <div className="absolute top-3 right-3 px-3 py-1 bg-black/50 backdrop-blur-sm rounded-full">
                                                <span className="text-xs font-bold text-white uppercase tracking-wider">
                                                    Epic
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-4">
                                        {selectedCollectionData && (
                                            <div className="text-xs text-zinc-400 uppercase tracking-wider">
                                                {selectedCollectionData.name}
                                            </div>
                                        )}
                                        <h3 className="font-bold text-xl text-white font-orbitron">
                                            {nftName || "Your NFT Name"}
                                        </h3>
                                        <p className="text-sm text-zinc-400">
                                            by <span className="text-yellow-400">You</span>
                                        </p>
                                        <div className="flex items-center justify-between pt-4">
                                            <div>
                                                <p className="text-xs text-zinc-400">Current Price</p>
                                                <p className="text-lg font-bold bg-gradient-to-r from-purple-500 via-cyan-400 to-amber-400 bg-clip-text text-transparent font-orbitron">
                                                    {price || "0.00"} ETH
                                                </p>
                                            </div>
                                            <div className="flex items-center space-x-4 text-zinc-400 text-sm">
                                                <div className="flex items-center space-x-1">
                                                    <Heart className="w-4 h-4" />
                                                    <span>0</span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <Eye className="w-4 h-4" />
                                                    <span>0</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between mt-12 pt-8 border-t border-white/10">
                    <button
                        type="button"
                        onClick={prevStep}
                        disabled={currentStep === 1}
                        className={`flex items-center space-x-2 px-6 py-3 rounded-lg border border-zinc-700 text-zinc-300 bg-zinc-900/80 hover:bg-zinc-800 transition-all ${currentStep === 1 ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                    >
                        <ChevronLeft className="w-5 h-5" />
                        <span>Previous</span>
                    </button>
                    {currentStep === steps.length ? (
                        <button
                            type="button"
                            disabled={!canProceed() || isCreating}
                            onClick={handleCreateNFT}
                            className={`flex items-center space-x-2 text-lg px-12 py-3 rounded-lg bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-400 text-white font-semibold shadow hover:scale-105 transition-all ${!canProceed() || isCreating ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                        >
                            {isCreating ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Creating NFT...</span>
                                </>
                            ) : (
                                <>
                                    <Zap className="w-5 h-5" />
                                    <span>Mint NFT</span>
                                </>
                            )}
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={nextStep}
                            disabled={!canProceed()}
                            className={`flex items-center space-x-2 px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-amber-500 text-white font-semibold shadow hover:scale-105 transition-all ${!canProceed() ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                        >
                            <span>Continue</span>
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}