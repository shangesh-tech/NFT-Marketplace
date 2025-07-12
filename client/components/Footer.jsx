export const Footer = () => {
    return (
        <footer >
            <div className="mt-8 text-center text-xl text-zinc-500 mb-4">
                © {new Date().getFullYear()} NFT Marketplace. All rights reserved.
            </div>
            <p className="text-center text-md text-zinc-500 mb-10">
                Build with ❤️ By <span className="font-bold text-amber-400 text-lg">Shangesh</span>
            </p>
        </footer>
    );
}