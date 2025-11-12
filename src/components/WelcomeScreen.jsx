import React, { useState, useRef } from 'react';

const WelcomeScreen = ({ onStartOnboarding, onSkip, isDarkMode }) => {
    const [currentScreen, setCurrentScreen] = useState(0); // 0 or 1
    const touchStartX = useRef(null);
    const touchEndX = useRef(null);

    const handleTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e) => {
        touchEndX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = () => {
        if (!touchStartX.current || !touchEndX.current) return;

        const distance = touchStartX.current - touchEndX.current;
        const isLeftSwipe = distance > 50;
        const isRightSwipe = distance < -50;

        if (isLeftSwipe && currentScreen === 0) {
            setCurrentScreen(1);
        } else if (isRightSwipe && currentScreen === 1) {
            setCurrentScreen(0);
        }

        touchStartX.current = null;
        touchEndX.current = null;
    };

    // WatchOrNot Icon Component
    const WatchOrNotIcon = () => (
        <div className="flex justify-center mt-12 mb-6">
            <div className="relative w-[140px] h-[140px] rounded-full bg-gradient-to-br from-blue-500 to-purple-500 shadow-2xl shadow-blue-500/50 flex items-center justify-center animate-bounce-slow">
                {/* Camera Icon */}
                <svg className="w-16 h-16 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                </svg>

                {/* Thumbs up badge */}
                <div className="absolute -top-2 -right-2 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg text-xl">
                    👍
                </div>

                {/* Thumbs down badge */}
                <div className="absolute -bottom-2 -left-2 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center shadow-lg text-xl">
                    👎
                </div>
            </div>
        </div>
    );

    // Screen 1: Welcome & Introduction
    const Screen1 = () => (
        <div className="h-full flex flex-col justify-between px-6 py-8">
            <div className="flex-1 flex flex-col">
                <WatchOrNotIcon />

                <div className="text-center">
                    <h1 className="text-4xl font-bold text-white mb-3 leading-tight">
                        Welcome to<br />WatchOrNot
                    </h1>
                    <p className="text-2xl italic text-gray-300 leading-snug">
                        "One Snap. One Answer."
                    </p>
                </div>

                <div className="mt-8 mb-4">
                    <div className="w-full bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-xl">
                        <p className="text-lg text-gray-200 text-center leading-relaxed">
                            <span className="block mb-4">
                                Wondering if that movie<br />
                                on your screen is worth<br />
                                watching tonight?
                            </span>
                            <span className="block font-medium text-blue-300">
                                Just snap a photo and<br />
                                get your answer in seconds ⚡
                            </span>
                        </p>
                    </div>
                </div>
            </div>

            <div className="pb-4">
                <div className="flex flex-col items-center gap-3">
                    {/* Swipe hint with animated arrow */}
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <span>Swipe to see how</span>
                        <svg className="w-4 h-4 animate-slide-right" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5-5 5"/>
                        </svg>
                    </div>

                    {/* Progress dots */}
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-1 rounded-full bg-blue-500"></div>
                        <div className="w-2 h-2 rounded-full bg-gray-600"></div>
                    </div>
                </div>
            </div>
        </div>
    );

    // Screen 2: How It Works
    const Screen2 = () => (
        <div className="h-full flex flex-col px-4 py-8">
            <div className="flex-shrink-0">
                <div className="text-center pt-8 pb-4">
                    <h2 className="text-2xl font-bold text-white">
                        How It Works
                    </h2>
                </div>

                <div className="w-full bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-700/50 shadow-2xl">
                    {/* Horizontal 3-step flow */}
                    <div className="grid grid-cols-5 gap-2 mb-4">
                        {/* Step 1 */}
                        <div className="col-span-2 flex flex-col items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-lg">
                                1
                            </div>
                            <div className="w-full aspect-[3/4] bg-gray-900/50 rounded-lg border border-gray-700/30 p-2 flex items-center justify-center">
                                {/* TV with movie */}
                                <div className="relative">
                                    <div className="w-12 h-16 bg-gradient-to-br from-blue-900 to-black rounded border border-gray-600 flex items-center justify-center">
                                        <div className="text-xl">🎬</div>
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 text-lg">📺</div>
                                </div>
                            </div>
                            <p className="text-xs text-gray-400 text-center leading-tight">
                                See a<br />movie
                            </p>
                        </div>

                        {/* Arrow */}
                        <div className="flex items-center justify-center pt-10">
                            <svg className="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5-5 5"/>
                            </svg>
                        </div>

                        {/* Step 2 */}
                        <div className="col-span-2 flex flex-col items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-white font-bold flex items-center justify-center text-sm shadow-lg">
                                2
                            </div>
                            <div className="w-full aspect-[3/4] bg-gray-900/50 rounded-lg border border-gray-700/30 p-2 flex items-center justify-center">
                                {/* Phone camera */}
                                <div className="relative w-16 h-20 bg-gradient-to-br from-gray-800 to-black rounded-lg border-2 border-gray-700 flex items-center justify-center">
                                    <div className="text-2xl">📷</div>
                                    <div className="absolute -top-1 -right-1 text-sm animate-pulse">✨</div>
                                </div>
                            </div>
                            <p className="text-xs text-gray-400 text-center leading-tight">
                                Snap<br />photo
                            </p>
                        </div>
                    </div>

                    {/* Second row: Arrow and Step 3 centered */}
                    <div className="grid grid-cols-5 gap-2">
                        {/* Empty space */}
                        <div className="col-span-2"></div>

                        {/* Arrow down */}
                        <div className="flex items-start justify-center pt-2">
                            <svg className="w-4 h-4 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
                            </svg>
                        </div>

                        {/* Step 3 */}
                        <div className="col-span-2 flex flex-col items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-green-600 text-white font-bold flex items-center justify-center text-sm shadow-lg">
                                3
                            </div>
                            <div className="w-full aspect-[3/4] bg-gray-900/50 rounded-lg border border-gray-700/30 p-2 flex items-center justify-center">
                                {/* Result */}
                                <div className="relative w-16 h-20 bg-gradient-to-br from-gray-800 to-black rounded-lg border-2 border-gray-700 flex flex-col items-center justify-center gap-1 p-1">
                                    <div className="text-xl">✅</div>
                                    <div className="bg-gradient-to-r from-green-500 to-green-600 px-2 py-1 rounded text-[10px] font-bold text-white text-center leading-tight">
                                        Watch<br />It!
                                    </div>
                                    <div className="absolute -top-1 -right-1 text-sm">🎉</div>
                                </div>
                            </div>
                            <p className="text-xs text-gray-400 text-center leading-tight">
                                Get<br />answer
                            </p>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="text-center pt-4 mt-4 border-t border-gray-700/50">
                        <p className="text-sm text-gray-300 leading-snug">
                            Instant personalized<br />movie recommendations
                        </p>
                    </div>
                </div>
            </div>

            {/* Spacer */}
            <div className="flex-1"></div>

            {/* CTAs */}
            <div className="flex-shrink-0 px-2 mt-4">
                <button
                    onClick={onStartOnboarding}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold text-lg px-6 py-4 rounded-xl shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 min-h-[56px]"
                >
                    <span className="text-2xl">🎬</span>
                    <div className="flex flex-col items-start">
                        <span className="text-lg">Build Your Profile</span>
                        <span className="text-sm font-normal opacity-90">(5 quick votes)</span>
                    </div>
                </button>

                <div className="text-center mt-3">
                    <button
                        onClick={onSkip}
                        className="text-base text-gray-400 hover:text-gray-300 transition-colors duration-200 underline-offset-4 hover:underline py-2"
                    >
                        Skip to app →
                    </button>
                </div>

                {/* Progress dots */}
                <div className="mt-4 pb-4">
                    <div className="flex items-center justify-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-gray-600"></div>
                        <div className="w-8 h-1 rounded-full bg-blue-500"></div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <>
            <style>{`
                @keyframes slide-right {
                    0%, 100% { transform: translateX(0); }
                    50% { transform: translateX(4px); }
                }
                .animate-slide-right {
                    animation: slide-right 1.5s ease-in-out infinite;
                }
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-8px); }
                }
                .animate-bounce-slow {
                    animation: bounce-slow 3s ease-in-out infinite;
                }
            `}</style>

            <div
                className="fixed inset-0 z-50 bg-gradient-to-b from-gray-900 via-black to-gray-900 overflow-hidden"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <div className="relative h-screen max-w-md mx-auto overflow-hidden">
                    {/* Screens container */}
                    <div
                        className="flex h-full transition-transform duration-300 ease-out"
                        style={{
                            transform: `translateX(-${currentScreen * 100}%)`,
                            width: '200%'
                        }}
                    >
                        {/* Screen 1 */}
                        <div className="w-1/2 flex-shrink-0">
                            <Screen1 />
                        </div>

                        {/* Screen 2 */}
                        <div className="w-1/2 flex-shrink-0">
                            <Screen2 />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default WelcomeScreen;
