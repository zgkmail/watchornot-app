import React, { useState, useRef, useEffect } from 'react';
import OnboardingModal from './components/OnboardingModal';


        // SVG Icon Components
        const Camera = ({ className }) => (
            <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                <circle cx="12" cy="13" r="4"></circle>
            </svg>
        );

        const Clock = ({ className }) => (
            <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
        );

        const User = ({ className }) => (
            <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
            </svg>
        );

        const ThumbsUp = ({ className }) => (
            <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
            </svg>
        );

        const ThumbsDown = ({ className }) => (
            <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"></path>
            </svg>
        );

        const Upload = ({ className }) => (
            <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
        );

        const Search = ({ className }) => (
            <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
            </svg>
        );

        const X = ({ className }) => (
            <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        );

        const ChevronRight = ({ className }) => (
            <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
        );

        const ImdbLogo = ({ className }) => (
            <svg className={className} width="16" height="16" viewBox="0 0 48 24" fill="none">
                <rect width="48" height="24" rx="2" fill="#F5C518"/>
                <text x="24" y="17" fontFamily="Arial, sans-serif" fontSize="12" fontWeight="bold" fill="#000000" textAnchor="middle">IMDb</text>
            </svg>
        );

        const Palette = ({ className }) => (
            <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="13.5" cy="6.5" r=".5"></circle>
                <circle cx="17.5" cy="10.5" r=".5"></circle>
                <circle cx="8.5" cy="7.5" r=".5"></circle>
                <circle cx="6.5" cy="12.5" r=".5"></circle>
                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"></path>
            </svg>
        );

        const Trash2 = ({ className }) => (
            <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
        );

        const Hash = ({ className }) => (
            <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="4" y1="9" x2="20" y2="9"></line>
                <line x1="4" y1="15" x2="20" y2="15"></line>
                <line x1="10" y1="3" x2="8" y2="21"></line>
                <line x1="16" y1="3" x2="14" y2="21"></line>
            </svg>
        );

        const Moon = ({ className }) => (
            <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
        );

        const Sun = ({ className }) => (
            <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
        );

        const HelpCircle = ({ className }) => (
            <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
        );

        const WatchOrNotIcon = ({ className, size = 80 }) => (
            <svg className={className} width={size} height={size} viewBox="0 0 100 100" fill="none">
                {/* Circular background with gradient */}
                <defs>
                    <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3B82F6" />
                        <stop offset="100%" stopColor="#8B5CF6" />
                    </linearGradient>
                </defs>

                {/* Main circle */}
                <circle cx="50" cy="50" r="45" fill="url(#iconGradient)" />

                {/* Camera body */}
                <rect x="30" y="40" width="40" height="28" rx="4" fill="white" fillOpacity="0.9" />

                {/* Camera lens */}
                <circle cx="50" cy="54" r="10" fill="url(#iconGradient)" />
                <circle cx="50" cy="54" r="6" fill="white" fillOpacity="0.3" />

                {/* Camera viewfinder */}
                <rect x="42" y="36" width="6" height="4" rx="1" fill="white" fillOpacity="0.9" />

                {/* Thumbs up indicator */}
                <path d="M 65 48 L 68 48 L 68 58 L 65 58 Z M 68 48 L 68 45 C 68 43 70 43 70 45 L 70 48 L 72 48 L 72 58 L 68 58"
                      fill="#10B981" stroke="#10B981" strokeWidth="0.5" />

                {/* Thumbs down indicator */}
                <path d="M 32 58 L 35 58 L 35 48 L 32 48 Z M 32 58 L 32 61 C 32 63 30 63 30 61 L 30 58 L 28 58 L 28 48 L 32 48"
                      fill="#EF4444" stroke="#EF4444" strokeWidth="0.5" />
            </svg>
        );

        const App = () => {
            const [activeTab, setActiveTab] = useState('snap');
            const [hasScanned, setHasScanned] = useState(false);
            const [isProcessing, setIsProcessing] = useState(false);
            const [currentMovie, setCurrentMovie] = useState(null);
            const [currentMovieRating, setCurrentMovieRating] = useState(null);
            const [movieHistory, setMovieHistory] = useState({});
            const [searchQuery, setSearchQuery] = useState('');
            const [searchMode, setSearchMode] = useState(false);
            const fileInputRef = useRef(null);
            const cameraInputRef = useRef(null);
            const videoRef = useRef(null);
            const searchInputRef = useRef(null);
            const [stream, setStream] = useState(null);
            const [cameraActive, setCameraActive] = useState(false);

            // Swipe-to-delete state
            const [swipedItem, setSwipedItem] = useState(null);
            const [swipeOffset, setSwipeOffset] = useState(0);
            const [touchStart, setTouchStart] = useState(null);

            // How It Works collapsible state
            const [howItWorksExpanded, setHowItWorksExpanded] = useState(false);

            // Movie detail modal state
            const [detailModalMovie, setDetailModalMovie] = useState(null);

            // Title correction modal state
            const [showCorrectionModal, setShowCorrectionModal] = useState(false);
            const [correctionSearchQuery, setCorrectionSearchQuery] = useState('');
            const [correctionSearchResults, setCorrectionSearchResults] = useState([]);
            const [isSearchingCorrection, setIsSearchingCorrection] = useState(false);

            // Dark mode state
            const [isDarkMode, setIsDarkMode] = useState(() => {
                const saved = localStorage.getItem('darkMode');
                return saved !== null ? JSON.parse(saved) : true; // Default to dark mode
            });

            // Onboarding state
            const [showOnboarding, setShowOnboarding] = useState(false);
            const [onboardingKey, setOnboardingKey] = useState(0);
            const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(() => {
                const saved = localStorage.getItem('hasCompletedOnboarding');
                return saved === 'true';
            });

            // Backend API configuration
            // Automatically use the same host as the frontend (for network testing on iPhone/devices)
            // If accessing via IP (e.g., http://192.168.1.5:3000), backend will be http://192.168.1.5:3001
            // If accessing via localhost, backend will be http://localhost:3001
            const getBackendUrl = () => {
                // In production, use environment variable or default production URL
                if (import.meta.env.PROD) {
                    return import.meta.env.VITE_BACKEND_URL || 'https://watchornot-backend.onrender.com';
                }

                // In development, use dynamic hostname with port 3001
                const hostname = window.location.hostname;
                const backendPort = '3001';
                return `http://${hostname}:${backendPort}`;
            };
            const BACKEND_URL = getBackendUrl();

            // Session management for Safari/browsers that block cookies
            const SESSION_STORAGE_KEY = 'watchornot_session_id';

            // In-memory fallback for Safari private mode where localStorage might not work
            let memorySessionId = null;

            const getStoredSessionId = () => {
                try {
                    const stored = localStorage.getItem(SESSION_STORAGE_KEY);
                    if (stored) return stored;
                } catch (e) {
                    // localStorage not available, fall back to memory
                }

                // Fallback to memory
                if (memorySessionId) return memorySessionId;

                return null;
            };

            const storeSessionId = (sessionId) => {
                if (!sessionId) return;

                // Always store in memory as fallback
                memorySessionId = sessionId;

                // Try to store in localStorage
                try {
                    localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
                } catch (e) {
                    // localStorage blocked, using memory fallback only
                }
            };

            // Helper to make authenticated requests with session handling
            const fetchWithSession = async (url, options = {}) => {
                const sessionId = getStoredSessionId();

                // Add session ID header if we have one
                const headers = {
                    ...options.headers,
                };

                if (sessionId) {
                    headers['X-Session-ID'] = sessionId;
                }

                const response = await fetch(url, {
                    ...options,
                    credentials: 'include', // Still send cookies if they work
                    headers
                });

                // For JSON responses, extract and store session ID BEFORE returning
                // This ensures the next request will use the correct session ID
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    // Clone response so we can read it multiple times
                    const clonedResponse = response.clone();
                    try {
                        const data = await clonedResponse.json();
                        if (data._sessionId) {
                            // Store session ID synchronously before returning
                            storeSessionId(data._sessionId);
                        }
                    } catch (e) {
                        // Response might not be valid JSON, ignore
                    }
                }

                return response;
            };

            // Helper function to get badge display name
            const getBadgeDisplayName = (badgeType) => {
                const badgeNames = {
                    'perfect-match': 'Perfect Match',
                    'great-pick': 'Great Pick',
                    'worth-a-try': 'Worth a Try',
                    'mixed-feelings': 'Mixed Feelings',
                    'not-your-style': 'Not Your Style'
                };
                return badgeNames[badgeType] || badgeType;
            };

            // Helper function to normalize poster URLs (handles both full URLs and paths)
            const getPosterUrl = (poster) => {
                if (!poster) return null;
                // If it's already a full URL, return as is
                if (poster.startsWith('http://') || poster.startsWith('https://')) {
                    return poster;
                }
                // If it's a path (starts with /), construct the TMDB URL
                if (poster.startsWith('/')) {
                    return `https://image.tmdb.org/t/p/w500${poster}`;
                }
                // Otherwise return as is
                return poster;
            };

            // Load movie history from backend on mount
            React.useEffect(() => {
                const loadMovieHistory = async () => {
                    try {
                        const response = await fetchWithSession(`${BACKEND_URL}/api/ratings`);

                        if (response.ok) {
                            const data = await response.json();
                            // Convert array to object keyed by movie_id for compatibility
                            const historyObj = {};
                            data.ratings.forEach(movie => {
                                historyObj[movie.movie_id] = {
                                    id: movie.movie_id,
                                    title: movie.title,
                                    year: movie.year,
                                    genre: movie.genre,
                                    cast: movie.cast,
                                    poster: movie.poster,
                                    imdbRating: movie.imdb_rating,
                                    rottenTomatoes: movie.rotten_tomatoes,
                                    metacritic: movie.metacritic,
                                    rating: movie.rating,
                                    timestamp: movie.timestamp,
                                    badge: movie.badge,
                                    badgeEmoji: movie.badgeEmoji,
                                    badgeDescription: movie.badgeDescription,
                                    tier: movie.tier
                                };
                            });
                            setMovieHistory(historyObj);
                            console.log('✅ Loaded', data.ratings.length, 'movies from backend');

                            // Show onboarding if user has no ratings and hasn't completed it before
                            if (data.ratings.length === 0 && !hasCompletedOnboarding) {
                                setShowOnboarding(true);
                            }
                        } else {
                            console.warn('Failed to load movie history from backend');
                        }
                    } catch (error) {
                        console.error('Error loading movie history:', error);
                    }
                };

                loadMovieHistory();
            }, []);

            // Persist dark mode preference
            React.useEffect(() => {
                localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
            }, [isDarkMode]);

            // Focus search input when search mode is enabled (iOS compatible)
            useEffect(() => {
                if (searchMode && searchInputRef.current) {
                    searchInputRef.current.focus();
                    // Set cursor at the end of the text if there's a query
                    if (searchQuery) {
                        const length = searchQuery.length;
                        searchInputRef.current.setSelectionRange(length, length);
                    }

                    // Wait for keyboard to open, then scroll input into view
                    // iOS keyboard animation takes ~300ms
                    setTimeout(() => {
                        if (searchInputRef.current) {
                            // Get the input's position
                            const inputRect = searchInputRef.current.getBoundingClientRect();
                            const viewportHeight = window.innerHeight;

                            // If input is in the bottom half of viewport (likely covered by keyboard)
                            if (inputRect.top > viewportHeight / 2) {
                                // Scroll it into the top third of the viewport
                                searchInputRef.current.scrollIntoView({
                                    behavior: 'smooth',
                                    block: 'start'
                                });
                                // Add extra scroll to ensure it's well above keyboard
                                setTimeout(() => {
                                    window.scrollBy(0, -100);
                                }, 100);
                            }
                        }
                    }, 400);
                }
            }, [searchMode, searchQuery]);

            const votedMovies = Object.values(movieHistory).filter(movie => movie.rating !== null);
            const votedCount = votedMovies.length;
            const totalNeeded = 5;
            const remainingNeeded = totalNeeded - votedCount;
            const progressPercentage = (votedCount / totalNeeded) * 100;

            // Track if we've already recalculated badges after reaching 5 votes
            const [badgesRecalculated, setBadgesRecalculated] = useState(false);

            // Recalculate badges for all movies when user becomes eligible
            React.useEffect(() => {
                const recalculateAllBadges = async () => {
                    // Only run once when user reaches 5 votes
                    if (votedCount < 5 || badgesRecalculated) return;

                    // Check if any movies are missing badge data
                    const moviesNeedingBadges = Object.values(movieHistory).filter(movie => !movie.badge);
                    if (moviesNeedingBadges.length === 0) {
                        setBadgesRecalculated(true);
                        return;
                    }

                    console.log(`🔄 User is now eligible! Recalculating badges for ${moviesNeedingBadges.length} movies...`);

                    try {
                        // Calculate badges for all movies that don't have them
                        const badgePromises = moviesNeedingBadges.map(async (movie) => {
                            try {
                                const response = await fetchWithSession(`${BACKEND_URL}/api/ratings/calculate-badge`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        id: movie.id,
                                        title: movie.title,
                                        genre: movie.genre,
                                        year: movie.year,
                                        imdbRating: movie.imdbRating,
                                        rottenTomatoes: movie.rottenTomatoes,
                                        metacritic: movie.metacritic,
                                        poster: movie.poster,
                                        cast: movie.cast,
                                        rating: movie.rating,
                                        timestamp: movie.timestamp
                                    })
                                });

                                if (response.ok) {
                                    const badgeData = await response.json();
                                    return {
                                        movieId: movie.id,
                                        badge: badgeData.badge,
                                        badgeEmoji: badgeData.badgeEmoji,
                                        badgeDescription: badgeData.badgeDescription,
                                        tier: badgeData.tier
                                    };
                                }
                                return null;
                            } catch (error) {
                                console.error(`Error calculating badge for ${movie.title}:`, error);
                                return null;
                            }
                        });

                        const badgeResults = await Promise.all(badgePromises);

                        // Update movieHistory with all the new badge data
                        setMovieHistory(prev => {
                            const updated = { ...prev };
                            badgeResults.forEach(result => {
                                if (result && updated[result.movieId]) {
                                    updated[result.movieId] = {
                                        ...updated[result.movieId],
                                        badge: result.badge,
                                        badgeEmoji: result.badgeEmoji,
                                        badgeDescription: result.badgeDescription,
                                        tier: result.tier
                                    };
                                }
                            });
                            return updated;
                        });

                        console.log('✅ All badges recalculated successfully!');
                        setBadgesRecalculated(true);
                    } catch (error) {
                        console.error('Error recalculating badges:', error);
                    }
                };

                recalculateAllBadges();
            }, [votedCount, movieHistory, badgesRecalculated]); // Safe to include all deps now with flag

            const handleMovieRating = async (movieId, rating) => {
                const movie = movieHistory[movieId];
                if (!movie) return;

                // Toggle rating if same, otherwise set new rating
                const newRating = movie.rating === rating ? null : rating;

                // Optimistically update UI
                setMovieHistory(prev => ({
                    ...prev,
                    [movieId]: {
                        ...movie,
                        rating: newRating
                    }
                }));

                // Also optimistically update detailModalMovie if it's the same movie
                if (detailModalMovie && detailModalMovie.id === movieId) {
                    setDetailModalMovie(prev => ({
                        ...prev,
                        rating: newRating
                    }));
                }

                // Save to backend
                try {
                    const response = await fetchWithSession(`${BACKEND_URL}/api/ratings`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id: movie.id,
                            title: movie.title,
                            genre: movie.genre,
                            year: movie.year,
                            imdbRating: movie.imdbRating,
                            rottenTomatoes: movie.rottenTomatoes,
                            metacritic: movie.metacritic,
                            poster: movie.poster,
                            cast: movie.cast,
                            rating: newRating,
                            timestamp: movie.timestamp
                        })
                    });

                    if (response.ok) {
                        const data = await response.json();
                        // Update with badge data from backend
                        setMovieHistory(prev => ({
                            ...prev,
                            [movieId]: {
                                ...prev[movieId],
                                badge: data.badge,
                                badgeEmoji: data.badgeEmoji,
                                badgeDescription: data.badgeDescription,
                                tier: data.tier
                            }
                        }));

                        // Also update currentMovie if it's the same movie
                        if (currentMovie && currentMovie.id === movieId) {
                            setCurrentMovie(prev => ({
                                ...prev,
                                rating: newRating,
                                badge: data.badge,
                                badgeEmoji: data.badgeEmoji,
                                badgeDescription: data.badgeDescription,
                                tier: data.tier
                            }));
                        }

                        // Also update detailModalMovie if it's the same movie
                        if (detailModalMovie && detailModalMovie.id === movieId) {
                            setDetailModalMovie(prev => ({
                                ...prev,
                                rating: newRating,
                                badge: data.badge,
                                badgeEmoji: data.badgeEmoji,
                                badgeDescription: data.badgeDescription,
                                tier: data.tier
                            }));
                        }

                        console.log('✅ Rating saved, badge:', data.badge, data.badgeEmoji, data.badgeDescription);
                    } else {
                        console.error('Failed to save rating');
                    }
                } catch (error) {
                    console.error('Error saving rating:', error);
                }
            };

            // Swipe-to-delete handlers
            const handleTouchStart = (e, movieId) => {
                // If touching a different item, reset swipe state
                if (swipedItem && swipedItem !== movieId) {
                    setSwipeOffset(0);
                }
                setTouchStart(e.touches[0].clientX);
                setSwipedItem(movieId);
            };

            const handleTouchMove = (e, movieId) => {
                if (!touchStart || swipedItem !== movieId) return;

                const currentTouch = e.touches[0].clientX;
                const diff = touchStart - currentTouch;

                // Allow left swipe (positive diff) up to 100px, and right swipe (negative diff) to cancel
                if (diff > 0) {
                    setSwipeOffset(Math.min(diff, 100));
                } else {
                    // Right swipe - snap back to 0
                    setSwipeOffset(0);
                }
            };

            const handleTouchEnd = () => {
                // If swiped more than 50px, keep it revealed
                if (swipeOffset > 50) {
                    setSwipeOffset(100);
                } else {
                    // Otherwise, snap back
                    setSwipeOffset(0);
                    setSwipedItem(null);
                }
                setTouchStart(null);
            };

            const handleDeleteMovie = async (movieId) => {
                // Optimistically update UI
                setMovieHistory(prev => {
                    const newHistory = { ...prev };
                    delete newHistory[movieId];
                    return newHistory;
                });
                setSwipedItem(null);
                setSwipeOffset(0);

                // Delete from backend
                try {
                    await fetchWithSession(`${BACKEND_URL}/api/ratings/${movieId}`, {
                        method: 'DELETE'
                    });
                    console.log('✅ Movie deleted from backend');
                } catch (error) {
                    console.error('Error deleting movie from backend:', error);
                }
            };

            const startCamera = async () => {
                try {
                    console.log('🎥 Requesting camera access...');

                    // Check if getUserMedia is available
                    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                        throw new Error('Camera API not available. Your browser may not support camera access.');
                    }

                    const mediaStream = await navigator.mediaDevices.getUserMedia({
                        video: { facingMode: 'environment' }
                    });

                    console.log('✅ Camera access granted');

                    if (videoRef.current) {
                        videoRef.current.srcObject = mediaStream;
                        setStream(mediaStream);
                        setCameraActive(true);
                    }
                } catch (err) {
                    console.error('❌ Camera error:', err);

                    let errorMessage = '📷 Camera Access Issue\n\n';

                    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                        errorMessage += '⚠️ Camera permission denied\n\n';
                        errorMessage += 'On iOS Safari:\n';
                        errorMessage += '• Go to Settings > Safari > Camera\n';
                        errorMessage += '• Allow camera access\n';
                        errorMessage += '• Or use "Upload Image" instead';
                    } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                        errorMessage += '⚠️ No camera found\n\n';
                        errorMessage += 'Please use "Upload Image" instead';
                    } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
                        errorMessage += '⚠️ Camera is being used by another app\n\n';
                        errorMessage += 'Close other apps and try again';
                    } else if (err.name === 'NotSupportedError' || err.message.includes('secure')) {
                        errorMessage += '⚠️ HTTPS Required\n\n';
                        errorMessage += 'Camera access requires HTTPS.\n\n';
                        errorMessage += 'Workaround:\n';
                        errorMessage += '1. Use "Upload Image" instead\n';
                        errorMessage += '2. Take a photo first, then upload it\n';
                        errorMessage += '3. Or use manual search';
                    } else {
                        errorMessage += '⚠️ Error: ' + (err.message || err.name || 'Unknown error') + '\n\n';
                        errorMessage += 'Try using "Upload Image" instead';
                    }

                    alert(errorMessage);
                }
            };

            const stopCamera = () => {
                if (stream) {
                    stream.getTracks().forEach(track => track.stop());
                    setStream(null);
                    setCameraActive(false);
                }
            };

            const captureFromCamera = () => {
                if (!videoRef.current) return;
                const canvas = document.createElement('canvas');
                canvas.width = videoRef.current.videoWidth;
                canvas.height = videoRef.current.videoHeight;
                canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
                const imageDataUrl = canvas.toDataURL('image/jpeg');
                stopCamera();
                processImage(imageDataUrl);
            };

            const handleFileUpload = (event) => {
                const file = event.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        processImage(e.target.result);
                    };
                    reader.readAsDataURL(file);
                }
            };

            /**
             * Clean and extract movie/show title and year from OCR text
             * Handles streaming interfaces, posters, and title cards
             * Returns: { title: string, year: number|null }
             */
            const cleanMovieTitle = (rawText) => {
                console.log('🧹 Cleaning detected text...');
                console.log('Raw text:', rawText);

                if (!rawText || rawText.trim().length === 0) {
                    return null;
                }

                // Split into lines
                const lines = rawText.split('\n').map(line => line.trim()).filter(line => line.length > 0);

                console.log('Lines found:', lines.length);
                console.log('Lines:', lines);

                // Extract year if present (looking for 4-digit years between 1900-2099)
                let extractedYear = null;
                const yearPattern = /\b(19\d{2}|20\d{2})\b/;

                for (const line of lines) {
                    const yearMatch = line.match(yearPattern);
                    if (yearMatch) {
                        extractedYear = parseInt(yearMatch[1]);
                        console.log('📅 Found year:', extractedYear);
                        break;
                    }
                }

                // Common UI elements and browser noise to remove
                const uiNoise = [
                    'play', 'pause', 'watch', 'trailer', 'resume', 'continue watching',
                    'add to list', 'my list', 'more info', 'details', 'info',
                    'hd', 'uhd', '4k', 'ad', 'cc', 'audio description',
                    'pg-13', 'pg', 'r', 'nr', 'tv-ma', 'tv-14', 'tv-pg', 'tv-y', 'tv-g',
                    'episodes', 'seasons', 'season', 'episode',
                    'download', 'share', 'rate', 'similar titles',
                    // Browser UI
                    'tab', 'tabs', 'window', 'close', 'minimize', 'maximize',
                    'back', 'forward', 'reload', 'home', 'search',
                    // Generic words
                    'baby', 'fish', 'people', 'man', 'woman', 'boy', 'girl'
                ];

                // Filter out lines that look like URLs or file paths
                const isUrlOrPath = (line) => {
                    return line.includes('://') ||
                           line.includes('www.') ||
                           line.includes('.com') ||
                           line.includes('.net') ||
                           line.match(/^[a-z]+\/[a-z]+/) || // path like "user/repo"
                           line.includes('github') ||
                           line.includes('localhost');
                };

                // Clean each line
                const cleanedLines = lines.map(line => {
                    let cleaned = line;

                    // Filter out URLs and paths first
                    if (isUrlOrPath(cleaned)) {
                        return '';
                    }

                    // Remove special characters at the start (like #, @, etc.)
                    cleaned = cleaned.replace(/^[#@$%^&*]+/, '');

                    // Remove common patterns
                    cleaned = cleaned.replace(/^\d+$/, ''); // Pure numbers
                    cleaned = cleaned.replace(/^[+\-×xX]$/, ''); // Single operators including X
                    cleaned = cleaned.replace(/^\d{4}$/, ''); // Years alone
                    cleaned = cleaned.replace(/^\d+h?\s*\d*m?$/, ''); // Runtime (2h 22m)
                    cleaned = cleaned.replace(/^[0-9.,]+$/, ''); // Ratings/numbers

                    // Remove UI noise words
                    const lowerCleaned = cleaned.toLowerCase();
                    if (uiNoise.some(noise => lowerCleaned === noise)) {
                        return '';
                    }

                    // Remove lines that are mostly symbols
                    if (cleaned.replace(/[a-zA-Z0-9]/g, '').length > cleaned.length * 0.5) {
                        return '';
                    }

                    // Remove very short lines (likely UI elements)
                    if (cleaned.length <= 1) {
                        return '';
                    }

                    // Remove single capital letters (like menu items)
                    if (/^[A-Z]$/.test(cleaned)) {
                        return '';
                    }

                    return cleaned.trim();
                }).filter(line => line.length > 0);

                console.log('Cleaned lines:', cleanedLines);

                if (cleanedLines.length === 0) {
                    console.log('⚠️  No clean text remaining after filtering');
                    return null;
                }

                // Score each line to find the most title-like one
                const scoreLine = (line) => {
                    let score = 0;

                    // Prefer lines with multiple words
                    const wordCount = line.split(/\s+/).length;
                    if (wordCount >= 2 && wordCount <= 6) score += 30;
                    if (wordCount === 1) score += 10;

                    // Prefer title case (first letter of words capitalized)
                    const words = line.split(/\s+/);
                    const capitalizedWords = words.filter(w => /^[A-Z]/.test(w)).length;
                    score += (capitalizedWords / words.length) * 20;

                    // Penalize all caps (usually UI elements)
                    if (line === line.toUpperCase() && line.length > 3) {
                        score -= 15;
                    }

                    // Prefer reasonable length (5-50 chars)
                    if (line.length >= 5 && line.length <= 50) {
                        score += 20;
                    }

                    // Penalize very short or very long
                    if (line.length < 3) score -= 20;
                    if (line.length > 60) score -= 10;

                    return score;
                };

                // Score and sort candidates
                const scoredLines = cleanedLines.map(line => ({
                    line,
                    score: scoreLine(line)
                })).sort((a, b) => b.score - a.score);

                console.log('Scored candidates:');
                scoredLines.slice(0, 5).forEach((item, i) => {
                    console.log(`  ${i+1}. "${item.line}" (score: ${item.score})`);
                });

                // Pick the best candidate
                let title = scoredLines[0].line;

                // Final cleanup
                title = title
                    .replace(/[#@$%^&*_+=|\\<>]/g, '') // Remove special chars
                    .replace(/\s+/g, ' ') // Normalize spaces
                    .trim();

                console.log('✨ Extracted title:', title);
                if (extractedYear) {
                    console.log('✨ Extracted year:', extractedYear);
                }

                return { title: title || null, year: extractedYear };
            };

            /**
             * Extract movie title candidates from multiple detection sources
             * Prioritizes web detection, then falls back to OCR text
             */
            const extractMovieCandidates = (webDetection, textAnnotations, logoAnnotations) => {
                console.log('\n🎬 Extracting movie candidates...');

                const candidates = [];
                const seenTitles = new Set();

                // Streaming services to filter out
                const streamingServices = new Set([
                    'netflix', 'prime video', 'amazon prime', 'disney+', 'disney plus', 'hulu',
                    'hbo max', 'paramount+', 'peacock', 'apple tv+', 'youtube', 'tubi'
                ]);

                // 1. WEB DETECTION - Most reliable source
                if (webDetection?.webEntities) {
                    console.log('📊 Processing web entities...');
                    webDetection.webEntities.forEach(entity => {
                        if (!entity.description) return;

                        const title = entity.description.trim();
                        const lowerTitle = title.toLowerCase();

                        // Filter out streaming services and very short titles
                        if (streamingServices.has(lowerTitle) || title.length < 2) return;

                        // Filter out generic terms
                        if (['film', 'movie', 'series', 'tv show', 'watch', 'play', 'episode'].includes(lowerTitle)) return;

                        const titleKey = lowerTitle.replace(/[^\w]/g, '');
                        if (seenTitles.has(titleKey)) return;
                        seenTitles.add(titleKey);

                        candidates.push({
                            title: title,
                            confidence: Math.min(entity.score || 0.7, 0.95),
                            source: 'web_entity'
                        });
                    });
                }

                // 2. BEST GUESS LABELS - High confidence
                if (webDetection?.bestGuessLabels) {
                    console.log('🎯 Processing best guess labels...');
                    webDetection.bestGuessLabels.forEach(label => {
                        if (!label.label) return;

                        const title = label.label.trim();
                        const lowerTitle = title.toLowerCase();

                        if (streamingServices.has(lowerTitle) || title.length < 2) return;

                        const titleKey = lowerTitle.replace(/[^\w]/g, '');
                        if (seenTitles.has(titleKey)) return;
                        seenTitles.add(titleKey);

                        candidates.push({
                            title: title,
                            confidence: 0.9,
                            source: 'best_guess'
                        });
                    });
                }

                // 3. OCR TEXT - Fallback (extract multiple candidates from OCR)
                if (textAnnotations.length > 0 && candidates.length < 3) {
                    console.log('📝 Processing OCR text as fallback...');
                    const detectedText = textAnnotations[0]?.description || '';
                    if (detectedText) {
                        const cleanedData = cleanMovieTitle(detectedText);
                        if (cleanedData?.title) {
                            const titleKey = cleanedData.title.toLowerCase().replace(/[^\w]/g, '');
                            if (!seenTitles.has(titleKey)) {
                                seenTitles.add(titleKey);
                                candidates.push({
                                    title: cleanedData.title,
                                    year: cleanedData.year,
                                    confidence: 0.6,
                                    source: 'ocr_text'
                                });
                            }
                        }

                        // Also try extracting title-like phrases directly from the text
                        const lines = detectedText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
                        for (const line of lines) {
                            // Look for title case phrases (3-50 chars, multiple capitalized words)
                            if (line.length >= 3 && line.length <= 50) {
                                const words = line.split(/\s+/);
                                const capitalizedCount = words.filter(w => /^[A-Z]/.test(w)).length;

                                // If most words are capitalized (title case), it might be a title
                                if (words.length >= 2 && capitalizedCount >= words.length * 0.6) {
                                    const titleKey = line.toLowerCase().replace(/[^\w]/g, '');
                                    if (!seenTitles.has(titleKey) && candidates.length < 5) {
                                        seenTitles.add(titleKey);
                                        candidates.push({
                                            title: line.trim(),
                                            confidence: 0.5,
                                            source: 'ocr_phrase'
                                        });
                                    }
                                }
                            }
                        }
                    }
                }

                // Sort by confidence (highest first)
                candidates.sort((a, b) => b.confidence - a.confidence);

                return candidates.slice(0, 5); // Return top 5 candidates
            };

            /**
             * Search for movie using multiple candidates in order of confidence
             */
            const searchMovieWithCandidates = async (candidates) => {
                for (let i = 0; i < candidates.length; i++) {
                    const candidate = candidates[i];
                    console.log(`\n🔍 Trying candidate ${i+1}/${candidates.length}: "${candidate.title}"`);

                    try {
                        const result = await searchMovie(candidate.title, candidate.year, true);

                        // If we found a result, we're done
                        if (result) {
                            console.log('✅ Found match!');
                            return result;
                        }

                        // If confidence is low and no result, try next
                        if (candidate.confidence < 0.7) {
                            console.log('⚠️  Low confidence, trying next candidate...');
                            continue;
                        }
                    } catch (error) {
                        console.error('❌ Error searching for candidate:', error);
                        // Continue to next candidate
                    }
                }

                // If we get here, nothing worked
                alert('Could not find a matching movie or TV show.\n\nDetected text doesn\'t match any titles.\nTry:\n• Taking another photo with better angle\n• Uploading a clearer image\n• Using manual search');
                setIsProcessing(false);
                setSearchMode(true);
            };

            /**
             * Compress image to stay under Claude API's 5 MB limit
             * Reduces dimensions and adjusts quality while maintaining readability
             */
            const compressImage = async (imageDataUrl) => {
                return new Promise((resolve, reject) => {
                    const img = new Image();
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');

                        // Calculate new dimensions to keep under ~4 MB (buffer for 5 MB limit)
                        // Base64 is ~1.37x larger than binary, so target ~3 MB binary = ~4 MB base64
                        const MAX_SIZE_MB = 4;
                        const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

                        let width = img.width;
                        let height = img.height;
                        let quality = 0.85;

                        // Start with a reasonable max dimension
                        const MAX_DIMENSION = 1920;
                        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
                            if (width > height) {
                                height = Math.round((height * MAX_DIMENSION) / width);
                                width = MAX_DIMENSION;
                            } else {
                                width = Math.round((width * MAX_DIMENSION) / height);
                                height = MAX_DIMENSION;
                            }
                        }

                        canvas.width = width;
                        canvas.height = height;
                        ctx.drawImage(img, 0, 0, width, height);

                        // Try to compress until under size limit
                        let compressed = canvas.toDataURL('image/jpeg', quality);
                        let attempts = 0;

                        while (compressed.length > MAX_SIZE_BYTES && attempts < 5) {
                            quality -= 0.1;
                            if (quality < 0.5) {
                                // Reduce dimensions further
                                width = Math.round(width * 0.8);
                                height = Math.round(height * 0.8);
                                canvas.width = width;
                                canvas.height = height;
                                ctx.drawImage(img, 0, 0, width, height);
                                quality = 0.85;
                            }
                            compressed = canvas.toDataURL('image/jpeg', quality);
                            attempts++;
                        }

                        console.log('🗜️  Image compressed:');
                        console.log('   Original:', imageDataUrl.length, 'bytes');
                        console.log('   Compressed:', compressed.length, 'bytes');
                        console.log('   Dimensions:', width, 'x', height);
                        console.log('   Quality:', quality);
                        console.log('   Reduction:', ((1 - compressed.length / imageDataUrl.length) * 100).toFixed(1) + '%');

                        resolve(compressed);
                    };
                    img.onerror = () => reject(new Error('Failed to load image for compression'));
                    img.src = imageDataUrl;
                });
            };

            const processImage = async (imageData) => {
                setIsProcessing(true);
                console.log('\n========== FRONTEND IMAGE PROCESSING ==========');
                console.log('Timestamp:', new Date().toISOString());

                try {
                    // Validate image data
                    if (!imageData) {
                        throw new Error('No image data provided');
                    }

                    console.log('✓ Image data received');
                    console.log('Data URL length:', imageData.length);
                    console.log('Data URL prefix:', imageData.substring(0, 50));

                    // Compress image to stay under Claude API's 5 MB limit
                    const compressedImage = await compressImage(imageData);

                    // Extract base64 portion
                    const base64Image = compressedImage.split(',')[1];

                    if (!base64Image) {
                        throw new Error('Failed to extract base64 data from image');
                    }

                    console.log('✓ Base64 extracted, length:', base64Image.length, 'characters');
                    console.log('📤 Sending request to Claude API...');
                    console.log('Backend URL:', `${BACKEND_URL}/api/claude/identify`);

                    const requestStart = Date.now();
                    const claudeResponse = await fetchWithSession(`${BACKEND_URL}/api/claude/identify`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ image: base64Image })
                    });

                    const requestDuration = Date.now() - requestStart;
                    console.log('📥 Response received in', requestDuration, 'ms');
                    console.log('Response status:', claudeResponse.status);
                    console.log('Response OK:', claudeResponse.ok);

                    if (!claudeResponse.ok) {
                        const errorData = await claudeResponse.json();
                        console.error('❌ Backend error response:', errorData);

                        let errorMsg = errorData.error || 'Claude API error';
                        if (errorData.debug) {
                            console.error('Debug info:', errorData.debug);
                            errorMsg += '\n\nDebug: ' + JSON.stringify(errorData.debug, null, 2);
                        }

                        throw new Error(errorMsg);
                    }

                    const claudeData = await claudeResponse.json();
                    console.log('✅ Claude API response received');
                    console.log('Response data:', claudeData);

                    const detectedTitle = claudeData.title;
                    const detectedYear = claudeData.year;
                    const detectedMediaType = claudeData.media_type;
                    const confidence = claudeData.confidence || 0.9;

                    console.log('\n🎯 Claude identified:');
                    console.log('   Title:', detectedTitle);
                    if (detectedYear) {
                        console.log('   Year:', detectedYear);
                    }
                    if (detectedMediaType) {
                        console.log('   Media Type:', detectedMediaType);
                    }
                    console.log('   Confidence:', (confidence * 100).toFixed(1) + '%');

                    if (!detectedTitle) {
                        alert('Could not identify a movie or TV show in the image.\n\nTips:\n• Point camera at the title screen\n• Ensure the title is clearly visible\n• Try manual search instead');
                        setIsProcessing(false);
                        setSearchMode(true);
                        return;
                    }

                    // Search for the movie directly with Claude's identified title, year, and media type
                    console.log('\n🔍 Searching TMDB for:', detectedTitle + (detectedYear ? ' (' + detectedYear + ')' : '') + (detectedMediaType ? ' [' + detectedMediaType + ']' : ''));
                    await searchMovie(detectedTitle, detectedYear, detectedMediaType);
                } catch (error) {
                    console.error('\n❌❌❌ FRONTEND ERROR ❌❌❌');
                    console.error('Error type:', error.constructor.name);
                    console.error('Error message:', error.message);
                    console.error('Error stack:', error.stack);
                    console.error('===============================================\n');

                    // Create user-friendly error message
                    let userMessage = 'Error processing image:\n\n';

                    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                        userMessage += '❌ Cannot connect to backend server\n';
                        userMessage += '• Is the backend running on ' + BACKEND_URL + '?\n';
                        userMessage += '• Check browser console for details\n';
                    } else if (error.message.includes('API key')) {
                        userMessage += '❌ API key issue\n';
                        userMessage += '• Vision API key may be invalid or missing\n';
                        userMessage += '• Check backend .env file\n';
                    } else if (error.message.includes('403')) {
                        userMessage += '❌ API authentication failed\n';
                        userMessage += '• Vision API key lacks permissions\n';
                        userMessage += '• Ensure Vision API is enabled in Google Cloud Console\n';
                    } else {
                        userMessage += error.message;
                    }

                    userMessage += '\n\nTry manual search instead.';

                    alert(userMessage);
                    setIsProcessing(false);
                    setSearchMode(true);
                }
            };

            // Search for movies and return multiple results for user selection
            const searchCorrectionResults = async (query) => {
                if (!query || query.trim().length < 2) {
                    setCorrectionSearchResults([]);
                    return;
                }

                setIsSearchingCorrection(true);
                console.log('🔍 Searching for correction candidates:', query);

                try {
                    const response = await fetchWithSession(
                        `${BACKEND_URL}/api/tmdb/search?query=${encodeURIComponent(query)}`
                    );

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || 'TMDB search error');
                    }

                    const data = await response.json();

                    // Filter to only movies and TV shows
                    const validResults = (data.results || [])
                        .filter(result => result.media_type === 'movie' || result.media_type === 'tv')
                        .slice(0, 10); // Show top 10 results

                    console.log('✓ Found', validResults.length, 'results');
                    setCorrectionSearchResults(validResults);
                } catch (error) {
                    console.error('❌ Search error:', error);
                    setCorrectionSearchResults([]);
                } finally {
                    setIsSearchingCorrection(false);
                }
            };

            // Handle selecting a movie from correction search results
            const handleCorrectionSelect = async (selectedMovie) => {
                console.log('✅ User selected correct movie:', selectedMovie.title || selectedMovie.name);
                setShowCorrectionModal(false);
                setCorrectionSearchQuery('');
                setCorrectionSearchResults([]);
                setIsProcessing(true);

                // Use searchMovie to fetch full details and update currentMovie
                const title = selectedMovie.title || selectedMovie.name;
                const year = (selectedMovie.release_date || selectedMovie.first_air_date || '').split('-')[0];
                await searchMovie(title, year ? parseInt(year) : null);
                setIsProcessing(false);
            };

            const searchMovie = async (query, year = null, mediaType = null, silent = false) => {
                console.log('🎬 Starting movie search with query:', query);
                if (year) {
                    console.log('📅 Using year for filtering/ranking:', year);
                }
                if (mediaType) {
                    console.log('🎭 Media type filter:', mediaType);
                }

                // Generate alternative search queries as fallbacks
                const generateAlternatives = (originalQuery, targetYear) => {
                    const alternatives = [originalQuery];

                    // Try with "The" prepended (common for movies)
                    if (!originalQuery.toLowerCase().startsWith('the ')) {
                        alternatives.push('The ' + originalQuery);
                    }

                    // Try without "The" if it starts with it
                    if (originalQuery.toLowerCase().startsWith('the ')) {
                        alternatives.push(originalQuery.substring(4));
                    }

                    // Try with "A" prepended
                    if (!originalQuery.toLowerCase().startsWith('a ')) {
                        alternatives.push('A ' + originalQuery);
                    }

                    // Try splitting compound words (e.g., "Reddragon" -> "Red dragon")
                    // Look for lowercase letter followed by uppercase letter
                    const spacedQuery = originalQuery.replace(/([a-z])([A-Z])/g, '$1 $2');
                    if (spacedQuery !== originalQuery) {
                        alternatives.push(spacedQuery);
                        alternatives.push(spacedQuery.charAt(0).toUpperCase() + spacedQuery.slice(1).toLowerCase());
                    }

                    // Try sequel variations if year is provided (common OCR miss for sequels)
                    if (targetYear) {
                        // Try adding common sequel suffixes
                        alternatives.push(originalQuery + ' II');
                        alternatives.push(originalQuery + ' 2');
                        alternatives.push(originalQuery + ' Part II');
                        alternatives.push(originalQuery + ' Part 2');
                        alternatives.push(originalQuery + ' III');
                        alternatives.push(originalQuery + ' 3');
                    }

                    console.log('📋 Search alternatives:', alternatives);
                    return alternatives;
                };

                // Rank/score a result based on title match, year match, media type, and popularity
                const scoreResult = (result, targetYear, searchQuery, targetMediaType) => {
                    let score = 0;

                    const resultTitle = (result.title || result.name || '').toLowerCase();
                    const queryLower = searchQuery.toLowerCase();

                    // Title match scoring (highest priority)
                    if (resultTitle === queryLower) {
                        score += 10000; // Exact title match
                        console.log('      🎯 EXACT TITLE MATCH!');
                    } else if (resultTitle.startsWith(queryLower) || resultTitle.endsWith(queryLower)) {
                        score += 5000; // Title starts or ends with query
                        console.log('      ✓ Strong title match (prefix/suffix)');
                    } else if (resultTitle.includes(queryLower)) {
                        score += 1000; // Title contains query
                        console.log('      ~ Partial title match (substring)');
                    } else {
                        console.log('      ⚠️  Weak title match');
                    }

                    // Extract year from result
                    const releaseDate = result.release_date || result.first_air_date;
                    const resultYear = releaseDate ? parseInt(releaseDate.split('-')[0]) : null;

                    // Year match scoring (high priority - increase weight significantly)
                    if (targetYear && resultYear) {
                        const yearDiff = Math.abs(resultYear - targetYear);
                        if (yearDiff === 0) {
                            score += 5000; // Exact year match (increased from 1000)
                            console.log('      🎯 Exact year match!', resultYear);
                        } else if (yearDiff === 1) {
                            score += 2000; // Off by 1 year (increased from 500)
                            console.log('      📅 Year close match:', resultYear, '(target:', targetYear + ')');
                        } else if (yearDiff <= 3) {
                            score += 500; // Within 3 years
                            console.log('      📅 Year nearby:', resultYear, '(target:', targetYear + ')');
                        } else {
                            // Penalize results with very different years
                            score -= (yearDiff * 100);
                            console.log('      ⚠️  Year mismatch penalty:', resultYear, '(target:', targetYear + ')');
                        }
                    }

                    // Media type scoring (important when year is not available)
                    if (targetMediaType) {
                        if (result.media_type === targetMediaType) {
                            score += 3000; // Strong preference for matching media type
                            console.log('      🎭 Media type match:', targetMediaType);
                        } else {
                            // Penalize wrong media type
                            score -= 2000;
                            console.log('      ⚠️  Media type mismatch (got:', result.media_type, 'want:', targetMediaType + ')');
                        }
                    } else if (!targetYear) {
                        // When no year and no media type specified, prefer movies slightly
                        // (users snap movies more often than TV shows)
                        if (result.media_type === 'movie') {
                            score += 1000;
                            console.log('      🎬 Default movie preference');
                        }
                    }

                    // Popularity scoring - more heavily weighted when year is null
                    const popularityWeight = targetYear ? 1 : 5;
                    const popularityScore = Math.min(result.popularity || 0, 100) * popularityWeight;
                    score += popularityScore;

                    console.log('      Total Score:', score, '(popularity:', result.popularity?.toFixed(1) + ')');
                    return score;
                };

                const trySearch = async (searchQuery, targetYear, targetMediaType) => {
                    console.log('  🔎 Trying:', searchQuery);

                    // Build search URL with optional media_type parameter
                    let searchUrl = `${BACKEND_URL}/api/tmdb/search?query=${encodeURIComponent(searchQuery)}`;
                    if (targetMediaType) {
                        searchUrl += `&media_type=${targetMediaType}`;
                    }

                    const response = await fetchWithSession(searchUrl);

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || 'TMDB search error');
                    }

                    const data = await response.json();

                    // Filter results to only include movies and TV shows (exclude people, etc.)
                    if (data.results && data.results.length > 0) {
                        // When using /search/movie or /search/tv endpoints, TMDB doesn't include media_type
                        // in the results, so we need to set it manually based on what we searched for
                        const resultsWithMediaType = data.results.map(result => {
                            // If media_type is not set and we used a specific search, infer it
                            if (!result.media_type && targetMediaType) {
                                return { ...result, media_type: targetMediaType };
                            }
                            // For /search/movie, results have release_date; for /search/tv, first_air_date
                            if (!result.media_type) {
                                if (result.release_date) {
                                    return { ...result, media_type: 'movie' };
                                } else if (result.first_air_date) {
                                    return { ...result, media_type: 'tv' };
                                }
                            }
                            return result;
                        });

                        const validResults = resultsWithMediaType.filter(result => {
                            if (result.media_type !== 'movie' && result.media_type !== 'tv') {
                                return false;
                            }

                            // Filter out ONLY "making-of" bonus content, NOT standalone documentaries
                            // This keeps: "Free Solo", "Planet Earth", etc.
                            // This filters: "The Making of Back to the Future", "Behind the Scenes: Star Wars"
                            const title = (result.title || result.name || '').toLowerCase();
                            const bonusContentPatterns = [
                                /^the making of/i,
                                /^making of/i,
                                /^behind the scenes/i,
                                /: the making of/i,
                                /: behind the scenes/i,
                                /- the making of/i,
                                /- behind the scenes/i
                            ];

                            for (const pattern of bonusContentPatterns) {
                                if (pattern.test(title)) {
                                    console.log('      ⚠️  Filtering out bonus content:', title);
                                    return false;
                                }
                            }

                            return true;
                        });

                        if (validResults.length > 0) {
                            console.log('    ✓ Found', validResults.length, 'movie/TV results (filtered from', data.results.length, 'total)');

                            // Rank results
                            const scoredResults = validResults.map(result => ({
                                ...result,
                                _score: scoreResult(result, targetYear, searchQuery, targetMediaType)
                            }));

                            // Sort by score (highest first)
                            scoredResults.sort((a, b) => b._score - a._score);

                            // Log top 3 results for debugging
                            console.log('    📊 Top results:');
                            scoredResults.slice(0, 3).forEach((result, idx) => {
                                console.log(`      ${idx + 1}. "${result.title || result.name}" (${result.media_type}, ${(result.release_date || result.first_air_date)?.split('-')[0]}) - Score: ${result._score}`);
                            });

                            const best = scoredResults[0];
                            console.log('    🏆 Selected:', best.title || best.name, '(' + best.media_type + ', ' + (best.release_date || best.first_air_date)?.split('-')[0] + ')');

                            return best;
                        } else {
                            console.log('    ✗ No movie/TV results (found', data.results.length, 'other results)');
                            return null;
                        }
                    }

                    return null;
                };

                try {
                    const alternatives = generateAlternatives(query, year);
                    let movie = null;
                    let successfulQuery = null;

                    // Try each alternative until we find a match
                    for (const altQuery of alternatives) {
                        movie = await trySearch(altQuery, year, mediaType);
                        if (movie) {
                            successfulQuery = altQuery;
                            console.log('✅ Found match with:', successfulQuery);
                            break;
                        }
                    }

                    if (!movie) {
                        console.log('❌ No results found with any search strategy');
                        if (silent) {
                            return false;
                        }
                        alert('No results found. Please try:\n\n• Manual search with the exact title\n• Check if the title was detected correctly in the console');
                        setIsProcessing(false);
                        setSearchMode(true);
                        return;
                    }

                    // Validate media type
                    if (movie.media_type !== 'movie' && movie.media_type !== 'tv') {
                        console.error('❌ Invalid media type:', movie.media_type);
                        throw new Error('Invalid media type: ' + movie.media_type + '. Expected "movie" or "tv".');
                    }

                    console.log('📦 Fetching details for:', movie.title || movie.name);

                    // Fetch movie details
                    const detailsResponse = await fetchWithSession(
                        `${BACKEND_URL}/api/tmdb/${movie.media_type}/${movie.id}`
                    );

                    if (!detailsResponse.ok) {
                        const errorData = await detailsResponse.json();
                        throw new Error(errorData.error || 'TMDB details error');
                    }

                    const details = await detailsResponse.json();

                    // Try to fetch OMDb ratings if IMDb ID is available
                    let omdbRatings = null;
                    const imdbId = details.external_ids?.imdb_id;

                    if (imdbId) {
                        console.log('📊 Fetching additional ratings from OMDb...');
                        console.log('   IMDb ID:', imdbId);

                        try {
                            const omdbResponse = await fetchWithSession(
                                `${BACKEND_URL}/api/omdb/ratings/${imdbId}`
                            );

                            if (omdbResponse.ok) {
                                const omdbData = await omdbResponse.json();
                                if (omdbData.found) {
                                    omdbRatings = omdbData;
                                    console.log('✅ OMDb data fetched:');
                                    console.log('   IMDb:', omdbRatings.ratings.imdb.rating);
                                    console.log('   Rotten Tomatoes:', omdbRatings.ratings.rottenTomatoes);
                                    console.log('   Metacritic:', omdbRatings.ratings.metacritic);
                                    console.log('   Director:', omdbRatings.director);
                                    console.log('   Actors:', omdbRatings.actors);
                                } else {
                                    console.log('⚠️  Movie not found in OMDb');
                                }
                            } else if (omdbResponse.status === 429) {
                                // Rate limit exceeded
                                const errorData = await omdbResponse.json();
                                console.warn('⚠️  OMDb API rate limit exceeded:', errorData.message);
                                console.warn('   Continuing without OMDb ratings...');
                                // Don't show error to user, just continue without ratings
                            } else {
                                console.warn('⚠️  OMDb API request failed:', omdbResponse.status);
                            }
                        } catch (omdbError) {
                            console.warn('⚠️  Could not fetch OMDb ratings:', omdbError.message);
                        }
                    } else {
                        console.log('⚠️  No IMDb ID available, skipping OMDb ratings');
                    }

                    // Extract trailer URL from videos
                    let trailerUrl = null;
                    if (details.videos?.results?.length > 0) {
                        // Find YouTube trailer (prefer "Trailer" type, fallback to "Teaser")
                        const trailer = details.videos.results.find(v =>
                            v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
                        );
                        if (trailer) {
                            trailerUrl = `https://www.youtube.com/watch?v=${trailer.key}`;
                            console.log('🎬 Trailer found:', trailerUrl);
                        }
                    }

                    const movieData = {
                        id: movie.id,
                        title: movie.title || movie.name,
                        year: (movie.release_date || movie.first_air_date || '').split('-')[0],
                        genre: details.genres?.slice(0, 3).map(g => g.name).join(', ') || 'Drama',
                        director: omdbRatings?.director || details.credits?.crew?.find(c => c.job === 'Director')?.name || null,
                        cast: omdbRatings?.actors || details.credits?.cast?.slice(0, 3).map(c => c.name).join(', ') || 'N/A',
                        poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
                        score: movie.vote_average,
                        imdbRating: omdbRatings?.ratings?.imdb?.rating || null,
                        imdbVotes: omdbRatings?.ratings?.imdb?.votes || null,
                        rottenTomatoes: omdbRatings?.ratings?.rottenTomatoes || null,
                        metacritic: omdbRatings?.ratings?.metacritic || null,
                        trailerUrl: trailerUrl,
                        rating: null,
                        timestamp: new Date().toISOString()
                    };

                    console.log('🎉 Successfully found movie:', movieData.title);

                    // Calculate recommendation badge from backend
                    try {
                        const badgeResponse = await fetchWithSession(`${BACKEND_URL}/api/ratings/calculate-badge`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(movieData)
                        });

                        if (badgeResponse.ok) {
                            const badgeData = await badgeResponse.json();

                            // Log the raw response for debugging
                            console.log('📦 Raw Badge Response:', badgeData);

                            movieData.badge = badgeData.badge;
                            movieData.badgeEmoji = badgeData.badgeEmoji;
                            movieData.badgeDescription = badgeData.badgeDescription;
                            movieData.tier = badgeData.tier;

                            // Log detailed calculation
                            console.log('\n🎯 Badge Calculation Details:');
                            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                            console.log('Badge:', badgeData.badge, badgeData.badgeEmoji);
                            console.log('Description:', badgeData.badgeDescription);
                            console.log('Tier:', badgeData.tier, `(${badgeData.totalVotes || 0} votes)`);
                            console.log('');
                            console.log('Base Score (IMDb):', badgeData.baseScore || 'N/A');
                            console.log('Adjustments:');
                            console.log('  Genre:   ', badgeData.adjustments?.genre || 0);
                            console.log('  Director:', badgeData.adjustments?.director || 0);
                            console.log('  Cast:    ', badgeData.adjustments?.cast || 0);
                            console.log('Final Score:', badgeData.adjustedScore || 'N/A');
                            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
                        }
                    } catch (error) {
                        console.warn('Could not calculate badge:', error);
                    }

                    setCurrentMovie(movieData);

                    // Add to history immediately when identified
                    setMovieHistory(prev => ({
                        ...prev,
                        [movie.id]: prev[movie.id] ? { ...prev[movie.id], ...movieData, rating: prev[movie.id].rating } : movieData
                    }));

                    // Save to backend (without rating initially)
                    try {
                        await fetchWithSession(`${BACKEND_URL}/api/ratings`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(movieData)
                        });
                    } catch (error) {
                        console.warn('Could not save movie to backend:', error);
                    }

                    setHasScanned(true);
                    setIsProcessing(false);
                    setSearchMode(false);

                    if (silent) {
                        return true;
                    }
                } catch (error) {
                    console.error('Movie search error:', error);
                    if (silent) {
                        return false;
                    }
                    alert('Search error: ' + error.message + '. Please check your TMDB API key.');
                    setIsProcessing(false);
                }
            };

            const handleRating = (rating) => {
                if (!currentMovie) return;
                setCurrentMovieRating(rating);
                handleMovieRating(currentMovie.id, rating);
                setTimeout(() => {
                    setHasScanned(false);
                    setCurrentMovieRating(null);
                    setCurrentMovie(null);
                }, 1000);
            };

            const handleNotNow = () => {
                setHasScanned(false);
                setCurrentMovieRating(null);
                setCurrentMovie(null);
            };

            // Onboarding handlers
            const handleOnboardingComplete = async () => {
                setHasCompletedOnboarding(true);
                localStorage.setItem('hasCompletedOnboarding', 'true');

                // Reload movie history to update UI
                try {
                    const response = await fetchWithSession(`${BACKEND_URL}/api/ratings`);
                    if (response.ok) {
                        const data = await response.json();
                        const historyObj = {};
                        data.ratings.forEach(movie => {
                            historyObj[movie.movie_id] = {
                                id: movie.movie_id,
                                title: movie.title,
                                year: movie.year,
                                genre: movie.genre,
                                cast: movie.cast,
                                poster: movie.poster,
                                imdbRating: movie.imdb_rating,
                                rottenTomatoes: movie.rotten_tomatoes,
                                metacritic: movie.metacritic,
                                rating: movie.rating,
                                timestamp: movie.timestamp,
                                badge: movie.badge,
                                badgeEmoji: movie.badgeEmoji,
                                badgeDescription: movie.badgeDescription,
                                tier: movie.tier
                            };
                        });
                        setMovieHistory(historyObj);
                        console.log('✅ Reloaded', data.ratings.length, 'movies after onboarding');
                    }
                } catch (error) {
                    console.error('Error reloading movie history:', error);
                }
            };

            const handleOnboardingClose = () => {
                setShowOnboarding(false);
                // Mark as completed even if skipped, so we don't show it again
                setHasCompletedOnboarding(true);
                localStorage.setItem('hasCompletedOnboarding', 'true');
            };

            return (
                <div className="flex items-center justify-center min-h-screen bg-gray-900 md:p-4">
                    <div className="app-container fixed md:relative top-0 left-0 md:top-auto md:left-auto w-full bg-black overflow-hidden md:max-w-sm md:rounded-[3rem] md:shadow-2xl" style={{ height: '100dvh', maxHeight: '100dvh' }}>
                        {/* Notch - only show on desktop mockup */}
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-7 bg-black rounded-b-3xl z-50 hidden md:block"></div>

                        <div className={`relative h-full flex flex-col safe-area-left safe-area-right ${isDarkMode ? 'bg-black' : 'bg-white'}`}>
                            <div className="flex-1 relative overflow-hidden">
                                
                                {activeTab === 'history' && (
                                    <div className={`h-full overflow-y-auto ${isDarkMode ? 'bg-black' : 'bg-gray-50'}`}>
                                        <div className="pt-4 pb-8 px-6">
                                            <h1 className={`text-3xl font-bold text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Your Snap History</h1>
                                        </div>
                                        <div className="px-6 pb-6">
                                            {(() => {
                                                // Calculate tier and progress (aligned with backend weight tiers)
                                                const getTierInfo = (count) => {
                                                    if (count < 5) {
                                                        return {
                                                            name: 'Newcomer',
                                                            emoji: '🎬',
                                                            progress: (count / 5) * 100,
                                                            nextTier: 5,
                                                            gradient: 'from-gray-500 to-gray-600',
                                                            bgGradient: 'from-gray-900/20 to-gray-800/20',
                                                            borderColor: 'border-gray-500/30'
                                                        };
                                                    } else if (count < 15) {
                                                        return {
                                                            name: 'Explorer',
                                                            emoji: '🔍',
                                                            progress: ((count - 5) / 10) * 100,
                                                            nextTier: 15,
                                                            gradient: 'from-green-500 to-green-600',
                                                            bgGradient: 'from-green-900/20 to-green-800/20',
                                                            borderColor: 'border-green-500/30'
                                                        };
                                                    } else if (count < 30) {
                                                        return {
                                                            name: 'Enthusiast',
                                                            emoji: '⭐',
                                                            progress: ((count - 15) / 15) * 100,
                                                            nextTier: 30,
                                                            gradient: 'from-purple-500 to-purple-600',
                                                            bgGradient: 'from-purple-900/20 to-purple-800/20',
                                                            borderColor: 'border-purple-500/30'
                                                        };
                                                    } else if (count < 50) {
                                                        return {
                                                            name: 'Expert',
                                                            emoji: '🎓',
                                                            progress: ((count - 30) / 20) * 100,
                                                            nextTier: 50,
                                                            gradient: 'from-blue-500 to-blue-600',
                                                            bgGradient: 'from-blue-900/20 to-blue-800/20',
                                                            borderColor: 'border-blue-500/30'
                                                        };
                                                    } else {
                                                        return {
                                                            name: 'Master',
                                                            emoji: '👑',
                                                            progress: 100,
                                                            nextTier: null,
                                                            gradient: 'from-yellow-400 via-pink-500 to-purple-600',
                                                            bgGradient: 'from-yellow-900/20 via-pink-900/20 to-purple-900/20',
                                                            borderColor: 'border-yellow-500/30'
                                                        };
                                                    }
                                                };

                                                const tier = getTierInfo(votedCount);

                                                // Always show the tier card for visual consistency
                                                return (
                                                    <>
                                                        <div className={`flex items-center justify-center gap-2 mb-3 p-3 bg-gradient-to-r ${tier.bgGradient} rounded-xl border ${tier.borderColor}`}>
                                                            <div className="text-center w-full">
                                                                <p className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>You are: {tier.emoji} {tier.name}</p>
                                                                <p className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{votedCount} {votedCount === 1 ? 'vote' : 'votes'} logged</p>
                                                            </div>
                                                        </div>
                                                        {tier.nextTier && (
                                                            <>
                                                                <div className={`w-full h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}>
                                                                    <div className={`h-full bg-gradient-to-r ${tier.gradient} rounded-full transition-all duration-300`} style={{ width: tier.progress + '%' }}></div>
                                                                </div>
                                                                <p className={`text-center mt-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                                    {votedCount < 5 ? (
                                                                        <>
                                                                            {tier.nextTier - votedCount} more {tier.nextTier - votedCount === 1 ? 'vote' : 'votes'} to reach 🔍 Explorer tier and unlock <span className="text-purple-400 font-semibold">recommendation badges</span>.
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            {tier.nextTier - votedCount} more {tier.nextTier - votedCount === 1 ? 'vote' : 'votes'} to reach {
                                                                                tier.nextTier === 15 ? '⭐ Enthusiast' :
                                                                                tier.nextTier === 30 ? '🎓 Expert' :
                                                                                tier.nextTier === 50 ? '👑 Master' : 'next'
                                                                            } tier
                                                                        </>
                                                                    )}
                                                                </p>
                                                            </>
                                                        )}
                                                        {!tier.nextTier && (
                                                            <p className={`text-center mt-3 text-sm font-semibold ${isDarkMode ? 'text-yellow-300' : 'text-yellow-600'}`}>
                                                                ✨ Maximum tier achieved! You're a movie expert!
                                                            </p>
                                                        )}
                                                    </>
                                                );
                                            })()}
                                        </div>
                                        <div className="px-4 pb-24">
                                            {Object.keys(movieHistory).length === 0 ? (
                                                <div className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                    <Clock className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                                    <p>No titles yet. Start snapping!</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    {Object.values(movieHistory).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).map((movie) => (
                                                        <div key={movie.id} className="relative overflow-hidden rounded-xl">
                                                            {/* Delete button background */}
                                                            <div className="absolute right-0 top-0 bottom-0 w-24 bg-red-600 flex items-center justify-center rounded-xl">
                                                                <Trash2 className="w-6 h-6 text-white" />
                                                            </div>

                                                            {/* Movie card */}
                                                            <div
                                                                className={`rounded-xl p-3 flex gap-3 relative cursor-pointer transition-all ${isDarkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white border border-gray-200 shadow-md hover:shadow-lg hover:border-gray-300'}`}
                                                                style={{
                                                                    transform: swipedItem === movie.id ? `translateX(-${swipeOffset}px)` : 'translateX(0)',
                                                                    transition: touchStart ? 'none' : 'transform 0.3s ease, box-shadow 0.2s ease, border-color 0.2s ease'
                                                                }}
                                                                onClick={() => setDetailModalMovie(movie)}
                                                                onTouchStart={(e) => handleTouchStart(e, movie.id)}
                                                                onTouchMove={(e) => handleTouchMove(e, movie.id)}
                                                                onTouchEnd={handleTouchEnd}
                                                            >
                                                                {getPosterUrl(movie.poster) ? (
                                                                    <img
                                                                        src={getPosterUrl(movie.poster)}
                                                                        alt={movie.title}
                                                                        className="w-24 h-36 rounded-lg flex-shrink-0 object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className={`w-24 h-36 rounded-lg flex-shrink-0 ${isDarkMode ? 'bg-gradient-to-br from-gray-700 to-gray-900' : 'bg-gradient-to-br from-gray-300 to-gray-400'}`}></div>
                                                                )}
                                                                <div className="flex-1 flex flex-col justify-between">
                                                                    <div>
                                                                        <h3 className={`font-bold text-lg mb-1 line-clamp-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{movie.title}</h3>
                                                                        <p className={`text-sm mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{movie.year} • {movie.genre}</p>
                                                                        {movie.badge && votedCount >= 5 && (
                                                                            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-xs mb-2 ${isDarkMode ? 'bg-purple-900/30 border-purple-500/30' : 'bg-purple-50 border-purple-200'}`}>
                                                                                <span>{movie.badgeEmoji}</span>
                                                                                <span className={`font-semibold ${isDarkMode ? 'text-purple-300' : 'text-purple-700'}`}>{getBadgeDisplayName(movie.badge)}</span>
                                                                            </div>
                                                                        )}
                                                                        <div className="flex items-center gap-3 text-sm mb-2">
                                                                            {movie.imdbRating && (
                                                                                <div className="flex items-center gap-1">
                                                                                    <ImdbLogo />
                                                                                    <span className={`font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{movie.imdbRating}/10</span>
                                                                                </div>
                                                                            )}
                                                                            {movie.rottenTomatoes && (
                                                                                <div className="flex items-center gap-1 text-red-400">
                                                                                    <span>🍅</span>
                                                                                    <span className="font-semibold">{movie.rottenTomatoes}%</span>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex gap-2">
                                                                        <button
                                                                            onClick={(e) => { e.stopPropagation(); handleMovieRating(movie.id, 'up'); }}
                                                                            className={'w-10 h-10 rounded-lg flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-green-500 ' + (movie.rating === 'up' ? 'bg-green-500 shadow-md' : (isDarkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-100 hover:bg-green-50 shadow-sm'))}
                                                                        >
                                                                            <ThumbsUp className={`w-5 h-5 transition-colors ${movie.rating === 'up' ? 'text-white' : (isDarkMode ? 'text-white' : 'text-gray-600 hover:text-green-600')}`} />
                                                                        </button>
                                                                        <button
                                                                            onClick={(e) => { e.stopPropagation(); handleMovieRating(movie.id, 'down'); }}
                                                                            className={'w-10 h-10 rounded-lg flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-red-500 ' + (movie.rating === 'down' ? 'bg-red-500 shadow-md' : (isDarkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-100 hover:bg-red-50 shadow-sm'))}
                                                                        >
                                                                            <ThumbsDown className={`w-5 h-5 transition-colors ${movie.rating === 'down' ? 'text-white' : (isDarkMode ? 'text-white' : 'text-gray-600 hover:text-red-600')}`} />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Delete button overlay (clickable when swiped) */}
                                                            {swipedItem === movie.id && swipeOffset >= 50 && (
                                                                <div
                                                                    className="absolute right-0 top-0 bottom-0 w-24 flex items-center justify-center cursor-pointer"
                                                                    onClick={() => handleDeleteMovie(movie.id)}
                                                                >
                                                                    <Trash2 className="w-6 h-6 text-white" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'snap' && !hasScanned && (
                                    <div className="h-full relative">
                                        {cameraActive ? (
                                            <div className="h-full relative">
                                                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                                                <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 flex gap-4">
                                                    <button onClick={captureFromCamera} className="w-20 h-20 rounded-full bg-white shadow-lg" />
                                                    <button onClick={stopCamera} className="w-20 h-20 rounded-full bg-red-500 shadow-lg flex items-center justify-center">
                                                        <X className="w-8 h-8 text-white" />
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className={`h-full flex flex-col px-6 py-6 overflow-y-auto ${searchMode ? 'pb-96' : ''} ${isDarkMode ? 'bg-gradient-to-b from-gray-900 to-black' : 'bg-gradient-to-b from-gray-50 to-white'}`}>
                                                {/* App Branding */}
                                                <div className="text-center mb-8">
                                                    <div className="flex justify-center mb-4">
                                                        <WatchOrNotIcon size={100} />
                                                    </div>
                                                    <h1 className={`text-4xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>WatchOrNot</h1>
                                                    <p className={`text-lg font-light ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>One Snap. One Answer.</p>
                                                </div>

                                                {/* How It Works Section */}
                                                <div className={`rounded-2xl mb-8 ${isDarkMode ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200 shadow-sm'}`}>
                                                    <button
                                                        onClick={() => setHowItWorksExpanded(!howItWorksExpanded)}
                                                        className="w-full p-6 flex items-center justify-between focus:outline-none"
                                                    >
                                                        <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>How It Works</h2>
                                                        <ChevronRight className={`w-5 h-5 transition-transform ${howItWorksExpanded ? 'rotate-90' : ''} ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                                                    </button>

                                                    {howItWorksExpanded && (
                                                        <div className="px-6 pb-6">
                                                            {/* Step 1 */}
                                                            <div className="flex gap-4 mb-6">
                                                                <div className="flex-shrink-0">
                                                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-blue-600' : 'bg-blue-500'}`}>
                                                                        <Camera className="w-6 h-6 text-white" />
                                                                    </div>
                                                                </div>
                                                                <div className="flex-1">
                                                                    <h3 className={`font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Snap</h3>
                                                                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Point your camera at any movie title on TV or streaming</p>
                                                                </div>
                                                            </div>

                                                            {/* Step 2 */}
                                                            <div className="flex gap-4 mb-6">
                                                                <div className="flex-shrink-0">
                                                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-purple-600' : 'bg-purple-500'}`}>
                                                                        <span className="text-2xl">🤖</span>
                                                                    </div>
                                                                </div>
                                                                <div className="flex-1">
                                                                    <h3 className={`font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Analyze</h3>
                                                                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>AI reads the title and checks it against your taste profile</p>
                                                                </div>
                                                            </div>

                                                            {/* Step 3 */}
                                                            <div className="flex gap-4">
                                                                <div className="flex-shrink-0">
                                                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-green-600' : 'bg-green-500'}`}>
                                                                        <span className="text-2xl">✓</span>
                                                                    </div>
                                                                </div>
                                                                <div className="flex-1">
                                                                    <h3 className={`font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Decide</h3>
                                                                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Get an instant personalized recommendation</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="space-y-3 mb-6">
                                                    <button onClick={() => cameraInputRef.current?.click()} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-xl flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all shadow-lg">
                                                        <Camera className="w-5 h-5" />
                                                        Take Photo
                                                    </button>
                                                    <button onClick={() => fileInputRef.current?.click()} className={`w-full py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50'}`}>
                                                        <Upload className="w-5 h-5" />
                                                        Upload Image
                                                    </button>
                                                    <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileUpload} className="hidden" />
                                                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />

                                                    {/* Manual Search - transforms from button to input */}
                                                    <div
                                                        className={`w-full py-4 px-6 rounded-xl flex items-center gap-2 transition-all duration-300 ease-in-out focus-within:ring-2 focus-within:ring-offset-2 cursor-text relative ${
                                                            searchMode
                                                                ? isDarkMode
                                                                    ? 'bg-gray-700 text-white focus-within:ring-gray-500'
                                                                    : 'bg-white border-2 border-gray-300 text-gray-900 focus-within:ring-gray-400'
                                                                : isDarkMode
                                                                    ? 'bg-gray-800 hover:bg-gray-700 text-white focus-within:ring-gray-500 cursor-pointer'
                                                                    : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 focus-within:ring-gray-400 cursor-pointer'
                                                        }`}
                                                        onClick={(e) => {
                                                            if (!searchMode) {
                                                                setSearchMode(true);
                                                            }
                                                        }}
                                                    >
                                                        <Search className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${searchMode ? 'opacity-60' : ''}`} />

                                                        <input
                                                            ref={searchInputRef}
                                                            type="text"
                                                            value={searchQuery}
                                                            onChange={(e) => setSearchQuery(e.target.value)}
                                                            onKeyPress={(e) => {
                                                                if (e.key === 'Enter' && searchQuery.trim()) {
                                                                    setIsProcessing(true);
                                                                    searchMovie(searchQuery);
                                                                    setSearchMode(false);
                                                                } else if (e.key === 'Escape') {
                                                                    setSearchMode(false);
                                                                    setSearchQuery('');
                                                                }
                                                            }}
                                                            onBlur={() => {
                                                                if (!searchQuery.trim()) {
                                                                    setSearchMode(false);
                                                                }
                                                            }}
                                                            placeholder="Enter movie or TV show name..."
                                                            className={`flex-1 bg-transparent outline-none transition-opacity duration-300 ${
                                                                searchMode
                                                                    ? 'opacity-100'
                                                                    : 'opacity-0 pointer-events-none'
                                                            } ${isDarkMode ? 'text-white placeholder-gray-400' : 'text-gray-900 placeholder-gray-500'}`}
                                                        />

                                                        {!searchMode && (
                                                            <span className="absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300">Manual Search</span>
                                                        )}

                                                        {searchMode && searchQuery.trim() && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setIsProcessing(true);
                                                                    searchMovie(searchQuery);
                                                                    setSearchMode(false);
                                                                }}
                                                                className="text-blue-600 hover:text-blue-700 font-medium transition-all duration-300 flex-shrink-0"
                                                            >
                                                                Go
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                {isProcessing && (
                                                    <div className="text-center">
                                                        <div className={`animate-spin rounded-full h-12 w-12 border-4 border-t-transparent mx-auto mb-3 ${isDarkMode ? 'border-white' : 'border-gray-900'}`}></div>
                                                        <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>Processing...</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'snap' && hasScanned && currentMovie && (
                                    <div className="h-full relative">
                                        <div className={`absolute inset-0 ${isDarkMode ? 'bg-gradient-to-b from-gray-800 via-gray-900 to-black' : 'bg-gradient-to-b from-gray-200 via-gray-300 to-gray-400'}`}>
                                        </div>
                                        <div className="absolute bottom-0 left-0 right-0 px-4 pb-2">
                                            <div className={`rounded-2xl p-5 relative z-10 max-h-[70vh] overflow-y-auto ${isDarkMode ? 'bg-gray-800' : 'bg-white shadow-2xl'}`}>
                                                <div className="flex gap-4 mb-4">
                                                    {getPosterUrl(currentMovie.poster) && (
                                                        <img
                                                            src={getPosterUrl(currentMovie.poster)}
                                                            alt={currentMovie.title}
                                                            className="w-24 h-36 rounded-lg flex-shrink-0 object-cover shadow-lg"
                                                        />
                                                    )}
                                                    <div className="flex-1">
                                                        <h2 className={`text-2xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{currentMovie.title}</h2>
                                                        <button
                                                            onClick={async () => {
                                                                // Remove from history since it's the wrong movie
                                                                const movieId = currentMovie.id;
                                                                setMovieHistory(prev => {
                                                                    const newHistory = { ...prev };
                                                                    delete newHistory[movieId];
                                                                    return newHistory;
                                                                });

                                                                // Delete from backend
                                                                try {
                                                                    await fetchWithSession(`${BACKEND_URL}/api/ratings/${movieId}`, {
                                                                        method: 'DELETE'
                                                                    });
                                                                } catch (error) {
                                                                    console.warn('Could not delete movie from backend:', error);
                                                                }

                                                                setSearchQuery(currentMovie.title);
                                                                setSearchMode(true);
                                                                setHasScanned(false);
                                                                setCurrentMovie(null);
                                                            }}
                                                            className={`text-xs mb-2 underline ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
                                                        >
                                                            Wrong title? Search instead
                                                        </button>
                                                        <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{currentMovie.year} • {currentMovie.genre}</p>
                                                        {currentMovie.director && (
                                                            <p className={`text-xs mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Director:</span> {currentMovie.director}
                                                            </p>
                                                        )}
                                                        <p className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Starring:</span> {currentMovie.cast}
                                                        </p>
                                                        {currentMovie.trailerUrl && (
                                                            <a
                                                                href={currentMovie.trailerUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-1 mt-2 text-blue-400 hover:text-blue-300 text-xs"
                                                            >
                                                                <span>🎬</span> Watch Trailer
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                                {currentMovie.badge ? (
                                                    <div className="mb-4 p-3 bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-xl border border-purple-500/30">
                                                        <div className="flex items-center gap-3 mb-1">
                                                            <span className="text-3xl">{currentMovie.badgeEmoji}</span>
                                                            <div>
                                                                <div className="text-white text-xl font-bold">{getBadgeDisplayName(currentMovie.badge)}</div>
                                                                <div className="text-purple-200 text-sm">{currentMovie.badgeDescription}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : votedCount < 5 ? (
                                                    <div className={`mb-4 p-3 rounded-xl border ${isDarkMode ? 'bg-gradient-to-r from-gray-800/50 to-gray-900/50 border-gray-600/30' : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200'}`}>
                                                        <div className="flex items-center gap-3">
                                                            <div className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>🔒</div>
                                                            <div className="flex-1">
                                                                <div className={`text-sm font-semibold mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>Unlock Recommendations</div>
                                                                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Vote on {remainingNeeded} more {remainingNeeded === 1 ? 'title' : 'titles'} to see personalized recommendations</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : null}
                                                <div className={`flex items-center justify-around mb-6 pb-6 border-b gap-3 ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}>
                                                    {currentMovie.imdbRating && (
                                                        <div className="text-center">
                                                            <div className="text-yellow-400 text-2xl font-bold">{currentMovie.imdbRating}/10</div>
                                                            <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>IMDb</div>
                                                        </div>
                                                    )}
                                                    {currentMovie.rottenTomatoes && (
                                                        <div className="text-center">
                                                            <div className="text-red-500 text-2xl font-bold">{currentMovie.rottenTomatoes}%</div>
                                                            <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Rotten 🍅</div>
                                                        </div>
                                                    )}
                                                    {currentMovie.metacritic && (
                                                        <div className="text-center">
                                                            <div className="text-green-500 text-2xl font-bold">{currentMovie.metacritic}/100</div>
                                                            <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Metacritic</div>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-center mb-4">
                                                    <p className={`text-sm mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>What's your take on this title?</p>
                                                    <p className={`text-sm mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Vote to build your taste profile!</p>
                                                    <button onClick={handleNotNow} className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'}`}>Skip For Now | Vote Later in History</button>
                                                </div>
                                                <div className="flex gap-3">
                                                    <button
                                                        onClick={() => handleRating('up')}
                                                        className={'flex-1 py-4 rounded-xl flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ' + (currentMovieRating === 'up' ? 'bg-green-500 shadow-lg' : (isDarkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-100 hover:bg-green-50 shadow-md'))}
                                                    >
                                                        <ThumbsUp className={`w-8 h-8 transition-colors ${currentMovieRating === 'up' ? 'text-white' : (isDarkMode ? 'text-white' : 'text-gray-600')}`} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleRating('down')}
                                                        className={'flex-1 py-4 rounded-xl flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ' + (currentMovieRating === 'down' ? 'bg-red-500 shadow-lg' : (isDarkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-100 hover:bg-red-50 shadow-md'))}
                                                    >
                                                        <ThumbsDown className={`w-8 h-8 transition-colors ${currentMovieRating === 'down' ? 'text-white' : (isDarkMode ? 'text-white' : 'text-gray-600')}`} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'profile' && (
                                    <div className={`h-full overflow-y-auto px-6 ${isDarkMode ? 'bg-black' : 'bg-gray-50'}`}>
                                        <div className="pt-4 pb-8">
                                            <h1 className={`text-3xl font-bold text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Your Taste Profile</h1>
                                        </div>

                                        <div className="flex flex-col items-center mb-12">
                                            {(() => {
                                                // Calculate tier info (aligned with backend weight tiers)
                                                const getTierInfo = (count) => {
                                                    if (count < 5) {
                                                        return {
                                                            name: 'Newcomer',
                                                            emoji: '🎬',
                                                            progress: (count / 5) * 100,
                                                            nextTier: 5,
                                                            ringColor: '#6b7280', // gray-500
                                                            glowColor: 'rgba(107, 114, 128, 0.3)'
                                                        };
                                                    } else if (count < 15) {
                                                        return {
                                                            name: 'Explorer',
                                                            emoji: '🔍',
                                                            progress: ((count - 5) / 10) * 100,
                                                            nextTier: 15,
                                                            ringColor: '#10b981', // green-500
                                                            glowColor: 'rgba(16, 185, 129, 0.3)'
                                                        };
                                                    } else if (count < 30) {
                                                        return {
                                                            name: 'Enthusiast',
                                                            emoji: '⭐',
                                                            progress: ((count - 15) / 15) * 100,
                                                            nextTier: 30,
                                                            ringColor: '#a855f7', // purple-500
                                                            glowColor: 'rgba(168, 85, 247, 0.3)'
                                                        };
                                                    } else if (count < 50) {
                                                        return {
                                                            name: 'Expert',
                                                            emoji: '🎓',
                                                            progress: ((count - 30) / 20) * 100,
                                                            nextTier: 50,
                                                            ringColor: '#3b82f6', // blue-500
                                                            glowColor: 'rgba(59, 130, 246, 0.3)'
                                                        };
                                                    } else {
                                                        return {
                                                            name: 'Master',
                                                            emoji: '👑',
                                                            progress: 100,
                                                            nextTier: null,
                                                            ringColor: '#eab308', // yellow-500
                                                            glowColor: 'rgba(234, 179, 8, 0.3)'
                                                        };
                                                    }
                                                };

                                                const tier = getTierInfo(votedCount);
                                                const circumference = 2 * Math.PI * 88;
                                                const offset = circumference * (1 - tier.progress / 100);

                                                return (
                                                    <>
                                                        <div className="relative w-48 h-48 mb-6">
                                                            <svg className="w-full h-full transform -rotate-90">
                                                                {/* Background ring */}
                                                                <circle cx="96" cy="96" r="88" stroke={isDarkMode ? '#374151' : '#d1d5db'} strokeWidth="12" fill="none" />
                                                                {/* Progress ring with tier color */}
                                                                <circle
                                                                    cx="96"
                                                                    cy="96"
                                                                    r="88"
                                                                    stroke={tier.ringColor}
                                                                    strokeWidth="12"
                                                                    fill="none"
                                                                    strokeDasharray={circumference}
                                                                    strokeDashoffset={offset}
                                                                    strokeLinecap="round"
                                                                    className="transition-all duration-500"
                                                                    style={{ filter: `drop-shadow(0 0 8px ${tier.glowColor})` }}
                                                                />
                                                            </svg>
                                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                                <span className="text-6xl mb-2">{tier.emoji}</span>
                                                                <span className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{tier.name}</span>
                                                                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{votedCount} {votedCount === 1 ? 'vote' : 'votes'}</span>
                                                            </div>
                                                        </div>
                                                        {tier.nextTier ? (
                                                            <p className={`text-center text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                                {tier.nextTier - votedCount} more {tier.nextTier - votedCount === 1 ? 'vote' : 'votes'} to reach <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{
                                                                    tier.nextTier === 5 ? 'Explorer' :
                                                                    tier.nextTier === 15 ? 'Enthusiast' :
                                                                    tier.nextTier === 30 ? 'Expert' :
                                                                    tier.nextTier === 50 ? 'Master' : 'next'
                                                                }</span> tier{tier.nextTier === 5 ? ' and unlock personalized recommendation badge' : ''}
                                                            </p>
                                                        ) : (
                                                            <p className={`text-center text-sm font-semibold ${isDarkMode ? 'text-yellow-300' : 'text-yellow-600'}`}>
                                                                ✨ Maximum tier achieved! You're a movie expert!
                                                            </p>
                                                        )}

                                                        {/* Recommendation Info */}
                                                        <div className={`mt-6 w-full max-w-md rounded-lg p-4 border ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
                                                            <div className="text-center mb-3">
                                                                <h3 className={`text-sm font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>How Recommendation Badge Works</h3>
                                                                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Based on IMDb score + your genre, director, and cast preferences</p>
                                                            </div>
                                                            <div className={`text-xs space-y-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                                <div className="flex items-center gap-2">
                                                                    <span>🎯</span>
                                                                    <span>Perfect Match - This is right up your alley!</span>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <span>⭐</span>
                                                                    <span>Great Pick - You'll probably enjoy this</span>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <span>👍</span>
                                                                    <span>Worth a Try - Give it a shot</span>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <span>🤷</span>
                                                                    <span>Mixed Feelings - Could go either way</span>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <span>❌</span>
                                                                    <span>Not Your Style - Probably skip this</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </>
                                                );
                                            })()}
                                        </div>
                                        <div className="space-y-3 mb-8">
                                            <button
                                                onClick={async () => {
                                                    if (confirm('Are you sure you want to recreate your taste profile? This will delete all your ratings and restart the onboarding survey.')) {
                                                        // Clear movie history from UI
                                                        setMovieHistory({});

                                                        // Delete all movies from backend
                                                        try {
                                                            const movieIds = Object.keys(movieHistory);
                                                            await Promise.all(
                                                                movieIds.map(id =>
                                                                    fetchWithSession(`${BACKEND_URL}/api/ratings/${id}`, {
                                                                        method: 'DELETE'
                                                                    })
                                                                )
                                                            );
                                                            console.log('✅ All movies deleted from backend');
                                                        } catch (error) {
                                                            console.error('Error deleting history:', error);
                                                            alert('Failed to delete some ratings. Please try again.');
                                                            return; // Don't proceed to onboarding if deletion failed
                                                        }

                                                        // Reset onboarding flag and show onboarding
                                                        localStorage.removeItem('hasCompletedOnboarding');
                                                        setHasCompletedOnboarding(false);
                                                        setOnboardingKey(prev => prev + 1); // Force remount with fresh state
                                                        setShowOnboarding(true);
                                                    }
                                                }}
                                                className={`w-full py-4 px-5 rounded-xl flex items-center gap-3 border transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700 text-white border-gray-700' : 'bg-white hover:bg-purple-50 text-gray-900 border-gray-300 shadow-sm hover:border-purple-200'}`}
                                            >
                                                <Palette className="w-6 h-6 text-purple-500" />
                                                <span className="text-lg">Recreate Taste Profile</span>
                                            </button>
                                        </div>
                                        <div className={`border-t my-6 ${isDarkMode ? 'border-gray-800' : 'border-gray-300'}`}></div>
                                        <div className="pb-24">
                                            <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Settings & Account</h2>
                                            <div className="space-y-1">
                                                <button className={`w-full py-4 px-2 flex items-center justify-between rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isDarkMode ? 'text-white hover:bg-gray-800' : 'text-gray-900 hover:bg-gray-100'}`}>
                                                    <div className="flex items-center gap-3">
                                                        <Hash className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-blue-600'}`} />
                                                        <span className="text-lg">Account</span>
                                                    </div>
                                                    <ChevronRight className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                                                </button>
                                                <button
                                                    onClick={() => setIsDarkMode(!isDarkMode)}
                                                    className={`w-full py-4 px-2 flex items-center justify-between rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isDarkMode ? 'text-white hover:bg-gray-800' : 'text-gray-900 hover:bg-gray-100'}`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        {isDarkMode ? (
                                                            <Moon className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                                                        ) : (
                                                            <Sun className="w-5 h-5 text-yellow-500" />
                                                        )}
                                                        <span className="text-lg">Dark Mode</span>
                                                    </div>
                                                    <div className={`relative w-12 h-6 rounded-full transition-colors ${isDarkMode ? 'bg-blue-600' : 'bg-gray-300'}`}>
                                                        <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${isDarkMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                                    </div>
                                                </button>
                                                <button className={`w-full py-4 px-2 flex items-center justify-between rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isDarkMode ? 'text-white hover:bg-gray-800' : 'text-gray-900 hover:bg-gray-100'}`}>
                                                    <div className="flex items-center gap-3">
                                                        <HelpCircle className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-blue-600'}`} />
                                                        <span className="text-lg">Help and Support</span>
                                                    </div>
                                                    <ChevronRight className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className={`border-t pt-2 safe-area-bottom ${isDarkMode ? 'bg-black border-gray-800' : 'bg-white border-gray-300'}`}>
                                <div className="flex items-center justify-around px-8 safe-area-left safe-area-right">
                                    <button onClick={() => { setActiveTab('history'); setHasScanned(false); stopCamera(); setSwipedItem(null); setSwipeOffset(0); }} className="flex flex-col items-center gap-1 py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg">
                                        <Clock className={'w-6 h-6 ' + (activeTab === 'history' ? (isDarkMode ? 'text-white' : 'text-blue-600') : 'text-gray-500')} />
                                        <span className={'text-xs ' + (activeTab === 'history' ? (isDarkMode ? 'text-white' : 'text-blue-600') : 'text-gray-500')}>History</span>
                                    </button>
                                    <button onClick={() => { setActiveTab('snap'); setHasScanned(false); setSwipedItem(null); setSwipeOffset(0); }} className="flex flex-col items-center gap-1 py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg">
                                        <Camera className={'w-6 h-6 ' + (activeTab === 'snap' ? (isDarkMode ? 'text-white' : 'text-blue-600') : 'text-gray-500')} />
                                        <span className={'text-xs ' + (activeTab === 'snap' ? (isDarkMode ? 'text-white' : 'text-blue-600') : 'text-gray-500')}>Snap</span>
                                    </button>
                                    <button onClick={() => { setActiveTab('profile'); setHasScanned(false); stopCamera(); setSwipedItem(null); setSwipeOffset(0); }} className="flex flex-col items-center gap-1 py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg">
                                        <User className={'w-6 h-6 ' + (activeTab === 'profile' ? (isDarkMode ? 'text-white' : 'text-blue-600') : 'text-gray-500')} />
                                        <span className={'text-xs ' + (activeTab === 'profile' ? (isDarkMode ? 'text-white' : 'text-blue-600') : 'text-gray-500')}>Profile</span>
                                    </button>
                                </div>
                                <div className="flex justify-center mt-2">
                                    <div className={`w-32 h-1 rounded-full ${isDarkMode ? 'bg-white opacity-30' : 'bg-gray-400'}`}></div>
                                </div>
                            </div>
                        </div>

                        {/* Movie Detail Modal */}
                        {detailModalMovie && (
                            <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setDetailModalMovie(null)}>
                                <div className={`rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`} onClick={(e) => e.stopPropagation()}>
                                    {/* Header with close button */}
                                    <div className={`sticky top-0 p-4 border-b flex items-center justify-between ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-300'}`}>
                                        <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Movie Details</h2>
                                        <button onClick={() => setDetailModalMovie(null)} className={`rounded-lg p-1 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}>
                                            <X className="w-6 h-6" />
                                        </button>
                                    </div>

                                    {/* Content */}
                                    <div className="p-6">
                                        {/* Poster and basic info */}
                                        <div className="flex gap-4 mb-6">
                                            {getPosterUrl(detailModalMovie.poster) ? (
                                                <img
                                                    src={getPosterUrl(detailModalMovie.poster)}
                                                    alt={detailModalMovie.title}
                                                    className="w-32 h-48 rounded-lg object-cover shadow-lg"
                                                />
                                            ) : (
                                                <div className={`w-32 h-48 rounded-lg ${isDarkMode ? 'bg-gradient-to-br from-gray-700 to-gray-900' : 'bg-gradient-to-br from-gray-300 to-gray-400'}`}></div>
                                            )}
                                            <div className="flex-1">
                                                <h3 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{detailModalMovie.title}</h3>
                                                <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{detailModalMovie.year} • {detailModalMovie.genre}</p>
                                                {detailModalMovie.director && (
                                                    <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Director:</span> {detailModalMovie.director}
                                                    </p>
                                                )}
                                                {detailModalMovie.cast && (
                                                    <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Cast:</span> {detailModalMovie.cast}
                                                    </p>
                                                )}
                                                {detailModalMovie.trailerUrl && (
                                                    <a
                                                        href={detailModalMovie.trailerUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 mt-1 text-blue-400 hover:text-blue-300 text-sm"
                                                    >
                                                        <span>🎬</span> Watch Trailer
                                                    </a>
                                                )}
                                            </div>
                                        </div>

                                        {/* Recommendation */}
                                        {detailModalMovie.badge ? (
                                            <div className="mb-6">
                                                <div className="bg-purple-900/30 p-3 rounded-lg border border-purple-500/30">
                                                    <div className="text-purple-300 text-xs mb-2">Recommendation</div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-2xl">{detailModalMovie.badgeEmoji}</span>
                                                        <span className="text-white text-lg font-bold">{getBadgeDisplayName(detailModalMovie.badge)}</span>
                                                    </div>
                                                    <div className="text-purple-200 text-sm ml-9">{detailModalMovie.badgeDescription}</div>
                                                </div>
                                            </div>
                                        ) : votedCount < 5 ? (
                                            <div className="mb-6">
                                                <div className={`p-3 rounded-lg border ${isDarkMode ? 'bg-gray-800/50 border-gray-600/30' : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200'}`}>
                                                    <div className="flex items-center gap-3">
                                                        <div className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>🔒</div>
                                                        <div className="flex-1">
                                                            <div className={`text-sm font-semibold mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>Unlock Recommendations</div>
                                                            <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Vote on {remainingNeeded} more {remainingNeeded === 1 ? 'title' : 'titles'} to see personalized recommendations</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : null}

                                        {/* Ratings */}
                                        <div className="mb-6">
                                            <h4 className={`font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Ratings</h4>
                                            <div className="grid grid-cols-2 gap-3">
                                                {detailModalMovie.imdbRating && (
                                                    <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
                                                        <div className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>IMDb</div>
                                                        <div className="text-yellow-400 text-2xl font-bold">{detailModalMovie.imdbRating}/10</div>
                                                    </div>
                                                )}
                                                {detailModalMovie.rottenTomatoes && (
                                                    <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
                                                        <div className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Rotten Tomatoes</div>
                                                        <div className="text-red-500 text-2xl font-bold">{detailModalMovie.rottenTomatoes}%</div>
                                                    </div>
                                                )}
                                                {detailModalMovie.metacritic && (
                                                    <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
                                                        <div className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Metacritic</div>
                                                        <div className="text-green-500 text-2xl font-bold">{detailModalMovie.metacritic}/100</div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Your Vote */}
                                        <div className="mb-6">
                                            <h4 className={`font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Your Vote</h4>
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => handleMovieRating(detailModalMovie.id, 'up')}
                                                    className={'flex-1 py-4 rounded-xl flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ' + (detailModalMovie.rating === 'up' ? 'bg-green-500 shadow-md' : (isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-green-50 shadow-sm'))}
                                                >
                                                    <ThumbsUp className={`w-6 h-6 transition-colors ${detailModalMovie.rating === 'up' ? 'text-white' : (isDarkMode ? 'text-white' : 'text-gray-600')}`} />
                                                </button>
                                                <button
                                                    onClick={() => handleMovieRating(detailModalMovie.id, 'down')}
                                                    className={'flex-1 py-4 rounded-xl flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ' + (detailModalMovie.rating === 'down' ? 'bg-red-500 shadow-md' : (isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-red-50 shadow-sm'))}
                                                >
                                                    <ThumbsDown className={`w-6 h-6 transition-colors ${detailModalMovie.rating === 'down' ? 'text-white' : (isDarkMode ? 'text-white' : 'text-gray-600')}`} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="space-y-3">
                                            <button
                                                onClick={() => {
                                                    if (confirm('Remove this movie from your taste profile?')) {
                                                        handleDeleteMovie(detailModalMovie.id);
                                                        setDetailModalMovie(null);
                                                    }
                                                }}
                                                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                                <span>Remove from History</span>
                                            </button>
                                            <button
                                                onClick={() => setDetailModalMovie(null)}
                                                className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl font-semibold"
                                            >
                                                Close
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Title Correction Modal */}
                        {showCorrectionModal && (
                            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
                                {/* Backdrop */}
                                <div
                                    className="absolute inset-0 bg-black bg-opacity-50"
                                    onClick={() => {
                                        setShowCorrectionModal(false);
                                        setCorrectionSearchQuery('');
                                        setCorrectionSearchResults([]);
                                    }}
                                />

                                {/* Modal Content */}
                                <div className={`relative w-full max-w-2xl max-h-[80vh] overflow-hidden rounded-t-2xl sm:rounded-2xl ${isDarkMode ? 'bg-gray-900' : 'bg-white'} shadow-2xl`}>
                                    <div className="p-6">
                                        {/* Header */}
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                Search for the Correct Title
                                            </h3>
                                            <button
                                                onClick={() => {
                                                    setShowCorrectionModal(false);
                                                    setCorrectionSearchQuery('');
                                                    setCorrectionSearchResults([]);
                                                }}
                                                className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>

                                        {/* Search Input */}
                                        <div className="mb-4">
                                            <input
                                                type="text"
                                                value={correctionSearchQuery}
                                                onChange={(e) => {
                                                    setCorrectionSearchQuery(e.target.value);
                                                    searchCorrectionResults(e.target.value);
                                                }}
                                                placeholder="Type the correct movie or TV show title..."
                                                className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                                    isDarkMode
                                                        ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                                                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                                                }`}
                                                autoFocus
                                            />
                                        </div>

                                        {/* Search Results */}
                                        <div className="overflow-y-auto max-h-[50vh]">
                                            {isSearchingCorrection ? (
                                                <div className="text-center py-8">
                                                    <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                        Searching...
                                                    </div>
                                                </div>
                                            ) : correctionSearchResults.length > 0 ? (
                                                <div className="space-y-2">
                                                    {correctionSearchResults.map((result) => {
                                                        const title = result.title || result.name;
                                                        const year = (result.release_date || result.first_air_date || '').split('-')[0];
                                                        const posterUrl = result.poster_path
                                                            ? `https://image.tmdb.org/t/p/w92${result.poster_path}`
                                                            : null;

                                                        return (
                                                            <button
                                                                key={result.id}
                                                                onClick={() => handleCorrectionSelect(result)}
                                                                className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all ${
                                                                    isDarkMode
                                                                        ? 'hover:bg-gray-800 border border-gray-800'
                                                                        : 'hover:bg-gray-50 border border-gray-200'
                                                                }`}
                                                            >
                                                                {/* Poster */}
                                                                {posterUrl ? (
                                                                    <img
                                                                        src={posterUrl}
                                                                        alt={title}
                                                                        className="w-12 h-18 rounded object-cover flex-shrink-0"
                                                                    />
                                                                ) : (
                                                                    <div className={`w-12 h-18 rounded flex-shrink-0 ${
                                                                        isDarkMode ? 'bg-gray-800' : 'bg-gray-200'
                                                                    }`} />
                                                                )}

                                                                {/* Info */}
                                                                <div className="flex-1 text-left">
                                                                    <div className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                                        {title}
                                                                    </div>
                                                                    <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                                        {year && `${year} • `}
                                                                        {result.media_type === 'movie' ? 'Movie' : 'TV Show'}
                                                                    </div>
                                                                </div>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            ) : correctionSearchQuery.trim().length >= 2 ? (
                                                <div className="text-center py-8">
                                                    <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                        No results found. Try a different search.
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-center py-8">
                                                    <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                        Start typing to search...
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Onboarding Modal */}
                        <OnboardingModal
                            key={onboardingKey}
                            isOpen={showOnboarding}
                            onClose={handleOnboardingClose}
                            onComplete={handleOnboardingComplete}
                            isDarkMode={isDarkMode}
                            backendUrl={BACKEND_URL}
                            fetchWithSession={fetchWithSession}
                        />
                    </div>
                </div>
            );
        };


export default App;
