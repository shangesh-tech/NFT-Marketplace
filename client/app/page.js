"use client";

import { useState, useEffect, useRef } from 'react';
import { TrendingUp, Users, Zap, Play, Star, Trophy } from 'lucide-react';
import Link from 'next/link';
import { Features } from '@/components/home/Features';

export default function Home() {
  const [stats, setStats] = useState({
    totalNFTs: 0,
    creators: 0,
    volume: 0,
    users: 0
  });

  const [activeIndex, setActiveIndex] = useState(0);
  // Remove mousePosition state for particles, but keep for text transform
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  const featuredNFTs = [
    {
      name: "1",
      image: "https://e0.pxfuel.com/wallpapers/314/513/desktop-wallpaper-transformers-dark-of-the-moon-2011-phone-moviemania-optimus-prime-transformers-movie-optimus-prime-autobots-thumbnail.jpg"

    },
    {
      name: "2",
      image: "https://i.pinimg.com/736x/21/d6/21/21d62106e83e8bddfa41024dfc195356.jpg"
    },
    {
      name: "3",
      image: "https://img1.wallspic.com/previews/7/1/8/1/5/151817/151817-robot-bumblebee-transformers-bumblebee_movie-decepticon-550x310.jpg"

    },
    {
      name: "4",
      image: "https://images.hdqwalls.com/download/megatron-transformers-forged-to-fight-o4-1152x864.jpg"
    }
  ];

  // Handle mouse move to set position for text transform only
  const handleMouseMove = (e) => {
    if (!heroRef.current) return;

    const rect = heroRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    setMousePosition({ x, y });
  };

  // Animate stats on mount
  useEffect(() => {
    const animateStats = () => {
      const targets = { totalNFTs: 15420, creators: 2840, volume: 47.8, totalNFTsSold: 8920 };
      const duration = 2000;
      const steps = 50;
      const interval = duration / steps;

      let step = 0;
      const timer = setInterval(() => {
        step++;
        const progress = step / steps;

        setStats({
          totalNFTs: Math.floor(targets.totalNFTs * progress),
          creators: Math.floor(targets.creators * progress),
          volume: +(targets.volume * progress).toFixed(1),
          totalNFTsSold: Math.floor(targets.totalNFTsSold * progress)
        });

        if (step === steps) {
          clearInterval(timer);
        }
      }, interval);
    };

    const timer = setTimeout(animateStats, 500);

    // Auto-rotate featured NFTs
    const rotateTimer = setInterval(() => {
      if (!isHovered) {
        setActiveIndex((prev) => (prev + 1) % featuredNFTs.length);
      }
    }, 3000);

    return () => {
      clearTimeout(timer);
      clearInterval(rotateTimer);
    };
  }, []);

  // Generate random particles ONCE (do not change on mouse move)
  const particlesRef = useRef(
    Array.from({ length: 60 }, (_, i) => ({
      id: i,
      size: Math.random() * 12,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: Math.random() * 20,
      delay: Math.random() * 1
    }))
  );
  const particles = particlesRef.current;

  return (
    <div
      ref={heroRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen w-full overflow-hidden bg-background"
    >
      <div className="absolute inset-0 z-0">
        <div
          className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-500/20 via-cyan-500/10 to-amber-500/10 animate-pulse"
        />
        {/* Particle system */}
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              background: particle.id % 3 === 0
                ? 'radial-gradient(circle, hsla(260, 100%, 65%, 0.3) 0%, transparent 70%)'
                : particle.id % 3 === 1
                  ? 'radial-gradient(circle, hsla(180, 100%, 60%, 0.2) 0%, transparent 70%)'
                  : 'radial-gradient(circle, hsla(45, 100%, 60%, 0.25) 0%, transparent 70%)',
              transform: 'translate(-50%, -50%)',
              animation: `float ${particle.duration}s infinite alternate ease-in-out`,
              animationDelay: `${particle.delay}s`
            }}
          />
        ))}
      </div>

      <div className="container mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-screen items-center pt-20 pb-16 px-4">
          {/* Left Content Area */}
          <div className="lg:col-span-7 space-y-8 text-left py-10">
            {/* Main Heading */}
            <div className="space-y-4" style={{ perspective: "1000px" }}>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight">
                <div className="overflow-hidden">
                  <span
                    className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-purple-700 animate-fade-in-down"
                    style={{
                      transform: `
                        rotateX(${mousePosition.y * 30}deg) 
                        rotateY(${mousePosition.x * 20}deg)
                      `
                    }}
                  >
                    COLLECT
                  </span>
                </div>
                <div className="overflow-hidden">
                  <span
                    className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-amber-600 animate-fade-in-down"
                    style={{
                      animationDelay: '0.2s',
                      transform: `
                        rotateX(${mousePosition.y * 30}deg) 
                        rotateY(${mousePosition.x * 0}deg)
                      `
                    }}
                  >
                    LEGENDARY
                  </span>
                </div>
                <div className="overflow-hidden">
                  <span
                    className="text-white inline-block animate-fade-in-down"
                    style={{
                      animationDelay: '0.4s',
                      transform: `
                        rotateX(${mousePosition.y * 30}deg) 
                        rotateY(${mousePosition.x * 20}deg)
                      `
                    }}
                  >
                    HEROES
                  </span>
                </div>
              </h1>


            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-6 items-center animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
              <Link href="/marketplace" className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-cyan-500 to-amber-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition duration-500"></div>
                <button className="relative bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-8 rounded-xl flex items-center space-x-2 transition-all duration-300">
                  <Zap className="w-5 h-5 mr-2 animate-pulse" />
                  Explore Marketplace
                </button>
              </Link>

              <Link href="/create" className="group">
                <button className="bg-black/30 backdrop-blur-lg hover:bg-black/40 text-white border border-white/10 font-medium py-3 px-8 rounded-xl flex items-center space-x-2 transition-all duration-300 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-cyan-500/20 to-transparent w-[200%] animate-shine"></div>
                  <Play className="w-5 h-5 mr-2" />
                  Create NFT
                </button>
              </Link>

              <div className="hidden md:flex items-center ml-2 bg-black/30 backdrop-blur-lg p-3 rounded-xl border border-white/10 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300">
                <div className="flex -space-x-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="w-12 h-12 rounded-full border-2 border-black overflow-hidden hover:scale-110 transition-transform duration-300">
                      <div className="w-full h-full bg-gradient-to-br from-purple-500 to-cyan-500"></div>
                    </div>
                  ))}
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-400">Trusted by</p>
                  <p className="text-sm font-semibold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-amber-600">3.9k+ collectors</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-12 pb-4 animate-fade-in-up" style={{ animationDelay: '1s' }}>
              {[
                { value: stats.creators, label: "Creators", gradient: "from-amber-400 to-amber-600", icon: <Users className="w-5 h-5" /> },
                { value: stats.totalNFTs, label: "NFTs Created", gradient: "from-purple-500 to-purple-700", icon: <Star className="w-5 h-5" /> },
                { value: stats.totalNFTsSold, label: "NFTs Sold", gradient: "from-amber-400 to-amber-600", icon: <Trophy className="w-5 h-5" /> },
                { value: `${stats.volume}K`, label: "ETH Volume", gradient: "from-purple-500 to-purple-700", icon: <TrendingUp className="w-5 h-5" /> },
              ].map((stat, i) => (
                <div key={i} className="bg-black/30 backdrop-blur-lg p-4 rounded-2xl border border-white/10 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 group">
                  <div className={`bg-clip-text text-transparent bg-gradient-to-r ${stat.gradient} mb-1`}>{stat.icon}</div>
                  <div className={`text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${stat.gradient} group-hover:scale-110 transition-transform duration-300`}>
                    {stat.value}+
                  </div>
                  <div className="text-xs text-gray-400 uppercase tracking-wider mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right */}
          <div
            className="lg:col-span-5 relative animate-fade-in-up"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className="relative h-[600px] w-full">
              {featuredNFTs.map((nft, i) => (
                <div
                  key={i}
                  className={`absolute transition-all duration-700 ease-in-out ${i === activeIndex ? 'opacity-100 scale-100 z-30' :
                    i === (activeIndex + 1) % featuredNFTs.length ? 'opacity-60 scale-90 translate-x-[40%] z-20' :
                      i === (activeIndex + 2) % featuredNFTs.length ? 'opacity-30 scale-80 translate-x-[80%] z-10' :
                        'opacity-0 scale-70 translate-x-[100%] z-0'
                    }`}

                >
                  <div className="bg-black/30 backdrop-blur-lg rounded-2xl overflow-hidden w-[280px] md:w-[350px] shadow-2xl border border-white/10 hover:shadow-purple-500/30 transition-all duration-300 group">
                    {/* NFT Image */}
                    <div className="w-full h-[380px] md:h-[450px] overflow-hidden relative group">

                      <img src={nft.image} alt={nft.name} className="object-cover w-full h-full" />

                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
            <div className="w-10 h-16 border-2 border-white/20 rounded-full flex justify-center bg-black/30 backdrop-blur-lg shadow-lg shadow-purple-500/20">
              <div className="w-2 h-5 bg-gradient-to-b from-purple-500 via-cyan-500 to-amber-500 rounded-full mt-2 animate-bounce" />
            </div>
          </div>
        </div>
      </div>
      <Features />
    </div>
  );
}
