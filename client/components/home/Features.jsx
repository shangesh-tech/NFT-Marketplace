import { Flame, ArrowRight } from "lucide-react";
import Link from "next/link";

// Example featured NFTs data (replace with real data or props as needed)
const featuredNFTs = [
    {
        id: 1,
        name: "Optimus Prime",
        image:
            "https://e0.pxfuel.com/wallpapers/314/513/desktop-wallpaper-transformers-dark-of-the-moon-2011-phone-moviemania-optimus-prime-transformers-movie-optimus-prime-autobots-thumbnail.jpg",
        likes: 120,
    },
    {
        id: 2,
        name: "Bumblebee",
        image:
            "https://img1.wallspic.com/previews/7/1/8/1/5/151817/151817-robot-bumblebee-transformers-bumblebee_movie-decepticon-550x310.jpg",
        likes: 98,
    },
    {
        id: 3,
        name: "Megatron",
        image:
            "https://images.hdqwalls.com/download/megatron-transformers-forged-to-fight-o4-1152x864.jpg",
        likes: 77,
    },
    {
        id: 4,
        name: "Starscream",
        image:
            "https://i.pinimg.com/736x/21/d6/21/21d62106e83e8bddfa41024dfc195356.jpg",
        likes: 65,
    },
];

// NFT Card Component
function NFTCard({ name, image, likes }) {
    return (
        <div
            className={
                "group relative bg-gradient-to-br from-black/70 via-zinc-900/80 to-black/60 rounded-2xl overflow-hidden shadow-xl border border-white/10 hover:scale-[1.03] hover:shadow-purple-500/30 transition-all duration-300"
            }
        >
            <div className="relative w-full h-64 overflow-hidden">
                <img
                    src={image}
                    alt={name}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 bg-black/60 rounded-full px-3 py-1 flex items-center text-xs text-white font-semibold shadow">
                    <Flame className="w-4 h-4 text-amber-400 mr-1" />
                    {likes}
                </div>
            </div>
            <div className="p-5">
                <h3 className="text-lg font-bold mb-1 text-white font-orbitron">{name}</h3>
                <Link
                    href={`/nft/${encodeURIComponent(name.toLowerCase().replace(/\s+/g, "-"))}`}
                    className="inline-block w-full mt-4"
                >
                    <button
                        type="button"
                        className="w-full font-medium py-2 px-4 rounded-lg bg-zinc-900 text-white border border-purple-500/40 hover:bg-gradient-to-r hover:from-purple-600 hover:to-amber-500 hover:text-white transition-all"
                    >
                        View NFT
                    </button>
                </Link>
            </div>
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
        </div>
    );
}

export const Features = () => {
    return (
        <section className="py-20 px-4 relative z-10">
            <div className="container mx-auto">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center space-x-2 glass-card px-4 py-2 rounded-full mb-6 border border-purple-500/30 bg-black/30 backdrop-blur-md shadow">
                        <Flame className="w-4 h-4 text-amber-400" />
                        <span className="text-sm font-medium text-amber-400">Hot Drops</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold font-orbitron mb-4">
                        <span className="text-gradient-primary bg-gradient-to-r from-purple-500 via-cyan-400 to-amber-400 bg-clip-text text-transparent">
                            Featured
                        </span>{" "}
                        NFTs
                    </h2>
                    <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
                        Discover the most sought-after superhero NFTs in our marketplace
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                    {featuredNFTs.map((nft) => (
                        <NFTCard key={nft.id} {...nft} />
                    ))}
                </div>

                <div className="text-center">
                    <Link href="/marketplace">
                        <button
                            type="button"
                            className="text-lg px-8 py-3 rounded-lg border border-purple-500/40 bg-transparent hover:bg-gradient-to-r hover:from-purple-600 hover:to-amber-500 hover:text-white transition-all flex items-center justify-center mx-auto"
                        >
                            View All NFTs
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </button>
                    </Link>
                </div>
            </div>
            {/* Subtle background gradient for extra polish */}
            <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-purple-900/30 via-cyan-900/10 to-amber-900/10" />
        </section>
    );
};