import React, { useState, useRef } from 'react';

const WelcomeScreen = ({ onStartOnboarding, onSkip, isDarkMode }) => {
    const [currentScreen, setCurrentScreen] = useState(0); // 0 or 1
    const touchStartX = useRef(null);
    const touchEndX = useRef(null);

    const handleTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX;
        console.log('Touch start:', touchStartX.current);
    };

    const handleTouchMove = (e) => {
        touchEndX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = () => {
        if (!touchStartX.current || !touchEndX.current) return;

        const distance = touchStartX.current - touchEndX.current;
        const isLeftSwipe = distance > 50;
        const isRightSwipe = distance < -50;

        console.log('Swipe distance:', distance, 'Left:', isLeftSwipe, 'Right:', isRightSwipe, 'Current:', currentScreen);

        if (isLeftSwipe && currentScreen === 0) {
            console.log('Switching to screen 2');
            setCurrentScreen(1);
        } else if (isRightSwipe && currentScreen === 1) {
            console.log('Switching to screen 1');
            setCurrentScreen(0);
        }

        touchStartX.current = null;
        touchEndX.current = null;
    };

    // Debug: Add click handler to switch screens
    const handleScreenClick = () => {
        const newScreen = currentScreen === 0 ? 1 : 0;
        console.log('Click: switching to screen', newScreen);
        setCurrentScreen(newScreen);
    };

    console.log('WelcomeScreen render, currentScreen:', currentScreen);

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
            `}</style>

            <div
                className="fixed inset-0 z-50 bg-gradient-to-b from-gray-900 via-black to-gray-900 overflow-hidden"
                style={{ height: '100dvh', maxHeight: '100dvh' }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {/* Swipeable container - positioned relative for child absolute positioning */}
                <div className="relative w-full h-full overflow-hidden">
                    {/* Inner sliding wrapper - 200vw wide containing two 100vw screens */}
                    <div
                        className="absolute top-0 left-0 h-full flex transition-transform duration-300 ease-out"
                        style={{
                            width: '200vw',
                            transform: `translateX(-${currentScreen * 100}vw)`
                        }}
                    >
                        {/* Screen 1: Welcome & Introduction - FULL viewport width */}
                        <div className="relative w-screen h-full flex-shrink-0">
                            <div className="w-full h-full flex flex-col justify-between safe-area-top safe-area-bottom">
                                <div className="flex-1 flex flex-col px-6 pt-4">
                                    {/* Icon */}
                                    <div className="flex justify-center mt-8 mb-6">
                                        <div className="relative w-[120px] h-[120px] rounded-full bg-gradient-to-br from-blue-500 to-purple-500 shadow-2xl shadow-blue-500/50 flex items-center justify-center animate-bounce-slow">
                                            <svg className="w-14 h-14 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                                                <circle cx="12" cy="13" r="4"/>
                                            </svg>
                                            <div className="absolute -top-1 -right-1 w-9 h-9 bg-green-500 rounded-full flex items-center justify-center shadow-lg text-lg">
                                                👍
                                            </div>
                                            <div className="absolute -bottom-1 -left-1 w-9 h-9 bg-red-500 rounded-full flex items-center justify-center shadow-lg text-lg">
                                                👎
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-center mb-6">
                                        <h1 className="text-3xl font-bold text-white mb-3 leading-tight">
                                            Welcome to<br />WatchOrNot
                                        </h1>
                                        <p className="text-xl italic text-gray-300 leading-snug">
                                            "One Snap. One Answer."
                                        </p>
                                    </div>

                                    <div className="flex-1 flex items-center">
                                        <div className="w-full bg-gray-800/50 backdrop-blur-sm rounded-2xl p-5 border border-gray-700/50 shadow-xl">
                                            <p className="text-base text-gray-200 text-center leading-relaxed">
                                                <span className="block mb-3">
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

                                <div className="px-6 pb-6">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                                            <span>Swipe to see how</span>
                                            <svg className="w-4 h-4 animate-slide-right" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5-5 5"/>
                                            </svg>
                                        </div>
                                        <div className="flex items-center gap-2" onClick={handleScreenClick}>
                                            <div className="w-8 h-1 rounded-full bg-blue-500"></div>
                                            <div className="w-2 h-2 rounded-full bg-gray-600"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Screen 2: How It Works - FULL viewport width */}
                        <div className="relative w-screen h-full flex-shrink-0">
                            <div className="w-full h-full flex flex-col justify-between safe-area-top safe-area-bottom">
                                <div className="flex-1 flex flex-col px-5 pt-4">
                                    <div className="text-center mb-4">
                                        <h2 className="text-2xl font-bold text-white">
                                            How It Works
                                        </h2>
                                    </div>

                                    <div className="flex-1 flex items-center">
                                        <div className="w-full bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-700/50 shadow-2xl">
                                            {/* Vertical 3-step flow */}
                                            <div className="flex flex-col items-center gap-2">
                                                {/* Step 1 */}
                                                <div className="flex items-center gap-4 w-full">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold flex items-center justify-center text-base shadow-lg flex-shrink-0">
                                                        1
                                                    </div>
                                                    <div className="flex items-center gap-3 flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <div className="relative">
                                                                <div className="w-16 h-16 bg-gradient-to-br from-blue-900 to-black rounded border border-gray-600 flex items-center justify-center">
                                                                    <div className="text-2xl">🎬</div>
                                                                </div>
                                                                <div className="absolute -bottom-1 -right-1 text-xl">📺</div>
                                                            </div>
                                                        </div>
                                                        <p className="text-sm text-gray-200 font-medium">
                                                            See a movie<br/>on your screen
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Arrow down */}
                                                <div className="flex justify-center">
                                                    <svg className="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
                                                    </svg>
                                                </div>

                                                {/* Step 2 */}
                                                <div className="flex items-center gap-4 w-full">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-white font-bold flex items-center justify-center text-base shadow-lg flex-shrink-0">
                                                        2
                                                    </div>
                                                    <div className="flex items-center gap-3 flex-1">
                                                        <div className="relative w-16 h-16 bg-gradient-to-br from-gray-800 to-black rounded-lg border-2 border-gray-700 flex items-center justify-center">
                                                            <div className="text-3xl">📱</div>
                                                            <div className="absolute -top-1 -right-1 text-base animate-pulse">✨</div>
                                                        </div>
                                                        <p className="text-sm text-gray-200 font-medium">
                                                            Snap a quick<br/>photo
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Arrow down */}
                                                <div className="flex justify-center py-1">
                                                    <svg className="w-5 h-5 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
                                                    </svg>
                                                </div>

                                                {/* Step 3 */}
                                                <div className="flex items-center gap-4 w-full">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 text-white font-bold flex items-center justify-center text-base shadow-lg flex-shrink-0">
                                                        3
                                                    </div>
                                                    <div className="flex items-center gap-3 flex-1">
                                                        <div className="relative w-16 h-16 bg-gradient-to-br from-gray-800 to-black rounded-lg border-2 border-gray-700 flex flex-col items-center justify-center gap-1 p-1">
                                                            <div className="text-2xl">✅</div>
                                                            <div className="bg-gradient-to-r from-green-500 to-green-600 px-2 py-1 rounded text-[10px] font-bold text-white text-center leading-tight">
                                                                Watch It!
                                                            </div>
                                                            <div className="absolute -top-1 -right-1 text-base">🎉</div>
                                                        </div>
                                                        <p className="text-sm text-gray-200 font-medium">
                                                            Get personalized<br/>answer
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Description */}
                                                <div className="text-center pt-2 mt-1 border-t border-gray-700/50 w-full">
                                                    <p className="text-sm text-gray-300 leading-snug">
                                                        Instant recommendations<br/>based on your taste
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* CTAs */}
                                <div className="px-6 pb-10">
                                    <button
                                        onClick={onStartOnboarding}
                                        className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold text-base px-6 py-3.5 rounded-xl shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2"
                                    >
                                        <span className="text-xl">🎬</span>
                                        <div className="flex flex-col items-start">
                                            <span className="text-base">Build Your Profile</span>
                                            <span className="text-xs font-normal opacity-90">(5 quick votes)</span>
                                        </div>
                                    </button>

                                    <div className="text-center mt-3">
                                        <button
                                            onClick={onSkip}
                                            className="text-sm text-gray-400 hover:text-gray-300 transition-colors duration-200 underline-offset-4 hover:underline py-2"
                                        >
                                            Skip to app →
                                        </button>
                                    </div>

                                    <div className="mt-3" onClick={handleScreenClick}>
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-gray-600"></div>
                                            <div className="w-8 h-1 rounded-full bg-blue-500"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default WelcomeScreen;
