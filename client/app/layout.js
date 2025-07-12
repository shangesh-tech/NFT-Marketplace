import './globals.css';
import { Orbitron } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import Link from 'next/link';
import WalletButton from '@/components/WalletButton';
import { Navbar } from '@/components/Navbar';

const orbitron = Orbitron({ subsets: ['latin'], variable: '--font-orbitron' });

export const metadata = {
  title: 'NFT Marketplace',
  description: 'A decentralized NFT marketplace for digital collectibles',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${orbitron.variable} bg-black text-white`}>
        <Toaster position="top-center" />
        <Navbar/>
        <div className="pt-24 md:pt-16">
          {children}
        </div>
      </body>
    </html>
  );
}
