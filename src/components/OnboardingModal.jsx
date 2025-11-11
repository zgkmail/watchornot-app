import React, { useState, useEffect, useRef } from 'react';
import OnboardingMovieCard from './OnboardingMovieCard';
import OnboardingProgress from './OnboardingProgress';
import OnboardingComplete from './OnboardingComplete';

const OnboardingModal = ({ isOpen, onClose, onComplete, isDarkMode, backendUrl, fetchWithSession }) => {
  const [step, setStep] = useState('loading'); // 'loading', 'voting', 'complete'
  const [movies, setMovies] = useState([]);
  const [currentMovieIndex, setCurrentMovieIndex] = useState(0);
  const [votes, setVotes] = useState([]);
  const [actualVoteCount, setActualVoteCount] = useState(0); // For display only - DO NOT use for logic
  const [completionData, setCompletionData] = useState(null);
  const [error, setError] = useState(null);

  // Refs to prevent race conditions - update synchronously unlike state
  const isSubmittingRef = useRef(false);
  const actualVoteCountRef = useRef(0); // Source of truth for vote count

  const REQUIRED_VOTES = 5; // Minimum number of up/down votes needed

  // Load onboarding movies when modal opens
  useEffect(() => {
    if (isOpen && step === 'loading') {
      loadOnboardingMovies();
    }
  }, [isOpen, step]);

  const loadOnboardingMovies = async () => {
    try {
      setError(null);
      const response = await fetchWithSession(`${backendUrl}/api/onboarding/movies`);
      const data = await response.json();

      if (response.ok && data.movies) {
        setMovies(data.movies);
        setStep('voting');
      } else {
        throw new Error(data.error || 'Failed to load movies');
      }
    } catch (err) {
      console.error('Error loading onboarding movies:', err);
      setError('Failed to load movies. Please try again.');
    }
  };

  const handleVote = (vote) => {
    // Guard: Prevent any votes from being processed if we're already submitting
    if (isSubmittingRef.current) {
      return;
    }

    // Guard: Don't process more votes if we've already reached the required count
    // This prevents adding votes beyond 5 even if something goes wrong later
    if (vote !== 'skip' && actualVoteCountRef.current >= REQUIRED_VOTES) {
      console.warn(`⚠️ Attempted to vote when already at ${actualVoteCountRef.current} votes`);
      return;
    }

    const currentMovie = movies[currentMovieIndex];
    const voteData = {
      movieId: currentMovie.id,
      title: currentMovie.title,
      year: currentMovie.year,
      genres: currentMovie.genres,
      imdbRating: currentMovie.imdbRating,
      director: currentMovie.director,
      cast: currentMovie.cast,
      poster: currentMovie.poster,
      vote: vote // 'up', 'down', or 'skip'
    };

    const newVotes = [...votes, voteData];
    setVotes(newVotes);

    // Update vote count synchronously using ref (source of truth)
    // Only increment for actual votes (not skips)
    if (vote !== 'skip') {
      actualVoteCountRef.current += 1;
    }

    // Also update state for UI rendering (but don't use this for logic!)
    setActualVoteCount(actualVoteCountRef.current);

    // Check if we just reached the required votes (use ref, not state!)
    if (actualVoteCountRef.current >= REQUIRED_VOTES) {
      // Set ref synchronously BEFORE any async operations to block subsequent clicks
      isSubmittingRef.current = true;
      // Enough votes collected, show loading screen immediately and submit to backend
      setStep('loading');
      submitVotes(newVotes);
      return; // Exit immediately to prevent any further execution
    } else if (currentMovieIndex < movies.length - 1) {
      // Move to next movie
      setCurrentMovieIndex(currentMovieIndex + 1);
    } else {
      // Ran out of movies without getting enough votes
      setError(`You need to vote on at least ${REQUIRED_VOTES} movies (not "Haven't Seen"). Please try again.`);
    }
  };

  const submitVotes = async (votesData) => {
    try {
      setError(null);

      const response = await fetchWithSession(`${backendUrl}/api/onboarding/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ votes: votesData })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Ensure completionData is set even if data is minimal
        setCompletionData(data || { success: true });
        isSubmittingRef.current = false; // Reset ref so complete screen shows
        setStep('complete');
      } else {
        throw new Error(data.error || 'Failed to save votes');
      }
    } catch (err) {
      console.error('Error submitting votes:', err);
      setError('Failed to save your preferences. Please try again.');
      isSubmittingRef.current = false; // Reset ref on error
      setStep('voting');
    }
  };

  const handleSkip = () => {
    onClose();
  };

  const handleComplete = () => {
    onComplete();
    onClose();
  };

  const handleRetry = () => {
    setStep('loading');
    setMovies([]); // Reset movies for consistency
    setVotes([]);
    setCurrentMovieIndex(0);
    setActualVoteCount(0);
    actualVoteCountRef.current = 0; // Reset the ref
    setError(null);
    isSubmittingRef.current = false; // Reset the submission guard
    // Don't call loadOnboardingMovies() - let useEffect handle it
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2">
      <div className={`relative w-full max-w-sm max-h-[95vh] overflow-y-auto rounded-xl shadow-2xl ${
        isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
      }`}>
        {/* Close button */}
        <button
          onClick={handleSkip}
          className="absolute top-2 right-2 z-10 p-1.5 rounded-lg transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
          aria-label="Skip onboarding"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content */}
        <div className="p-4">
          {(step === 'loading' || isSubmittingRef.current) && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-3"></div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {isSubmittingRef.current ? 'Saving your preferences...' : 'Loading movies...'}
              </p>
            </div>
          )}

          {step === 'voting' && !isSubmittingRef.current && movies.length > 0 && (
            <>
              <div className="text-center mb-4">
                <h2 className="text-xl font-bold mb-1 leading-tight">Build Your Taste Profile</h2>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Vote on these movies
                </p>
              </div>

              <OnboardingProgress
                current={actualVoteCount}
                total={REQUIRED_VOTES}
                isDarkMode={isDarkMode}
              />

              <OnboardingMovieCard
                movie={movies[currentMovieIndex]}
                onVote={handleVote}
                isDarkMode={isDarkMode}
              />

              <div className="mt-3 text-center">
                <button
                  onClick={handleSkip}
                  className={`text-xs ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'} transition-colors`}
                >
                  Skip for now
                </button>
              </div>
            </>
          )}

          {step === 'complete' && (
            <OnboardingComplete
              data={completionData || { success: true }}
              onContinue={handleComplete}
              isDarkMode={isDarkMode}
            />
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-500 text-center">{error}</p>
              <button
                onClick={handleRetry}
                className="mt-3 w-full py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;
