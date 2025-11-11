import React, { useState, useEffect } from 'react';
import OnboardingMovieCard from './OnboardingMovieCard';
import OnboardingProgress from './OnboardingProgress';
import OnboardingComplete from './OnboardingComplete';

const OnboardingModal = ({ isOpen, onClose, onComplete, isDarkMode, backendUrl, fetchWithSession }) => {
  const [step, setStep] = useState('loading'); // 'loading', 'voting', 'complete'
  const [movies, setMovies] = useState([]);
  const [currentMovieIndex, setCurrentMovieIndex] = useState(0);
  const [votes, setVotes] = useState([]);
  const [completionData, setCompletionData] = useState(null);
  const [error, setError] = useState(null);

  // Load onboarding movies
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
      vote: vote // 'up' or 'down'
    };

    const newVotes = [...votes, voteData];
    setVotes(newVotes);

    // Move to next movie or complete
    if (currentMovieIndex < movies.length - 1) {
      setCurrentMovieIndex(currentMovieIndex + 1);
    } else {
      // All movies voted, submit to backend
      submitVotes(newVotes);
    }
  };

  const submitVotes = async (votesData) => {
    try {
      setStep('loading');
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
        setCompletionData(data);
        setStep('complete');
      } else {
        throw new Error(data.error || 'Failed to save votes');
      }
    } catch (err) {
      console.error('Error submitting votes:', err);
      setError('Failed to save your preferences. Please try again.');
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
    setVotes([]);
    setCurrentMovieIndex(0);
    setError(null);
    loadOnboardingMovies();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl m-4 ${
        isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
      }`}>
        {/* Close button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 z-10 p-2 rounded-lg transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
          aria-label="Skip onboarding"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content */}
        <div className="p-8">
          {step === 'loading' && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
              <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                Loading movies...
              </p>
            </div>
          )}

          {step === 'voting' && movies.length > 0 && (
            <>
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold mb-2">Build Your Taste Profile</h2>
                <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Vote on these movies to help us understand your preferences
                </p>
              </div>

              <OnboardingProgress
                current={currentMovieIndex + 1}
                total={movies.length}
                isDarkMode={isDarkMode}
              />

              <OnboardingMovieCard
                movie={movies[currentMovieIndex]}
                onVote={handleVote}
                isDarkMode={isDarkMode}
              />

              <div className="mt-6 text-center">
                <button
                  onClick={handleSkip}
                  className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'} transition-colors`}
                >
                  Skip for now
                </button>
              </div>
            </>
          )}

          {step === 'complete' && completionData && (
            <OnboardingComplete
              data={completionData}
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
