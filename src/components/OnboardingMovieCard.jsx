import React from 'react';

const OnboardingMovieCard = ({ movie, onVote, isDarkMode }) => {
  const posterUrl = movie.poster
    ? `https://image.tmdb.org/t/p/w500${movie.poster}`
    : null;

  return (
    <div className="flex flex-col items-center">
      {/* Movie Poster */}
      <div className="relative w-full max-w-md mb-6">
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={`${movie.title} poster`}
            className="w-full rounded-xl shadow-lg"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450"><rect width="300" height="450" fill="%23333"/><text x="50%" y="50%" text-anchor="middle" fill="%23999" font-family="Arial" font-size="16">No Poster</text></svg>';
            }}
          />
        ) : (
          <div className={`w-full aspect-[2/3] rounded-xl flex items-center justify-center ${
            isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
          }`}>
            <p className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>No Poster Available</p>
          </div>
        )}
      </div>

      {/* Movie Info */}
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold mb-2">{movie.title}</h3>
        <p className={`text-lg mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          {movie.year}
        </p>

        {/* Genres */}
        {movie.genres && movie.genres.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-3">
            {movie.genres.map((genre, index) => (
              <span
                key={index}
                className={`px-3 py-1 rounded-full text-sm ${
                  isDarkMode
                    ? 'bg-gray-700 text-gray-300'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {genre}
              </span>
            ))}
          </div>
        )}

        {/* IMDb Rating */}
        {movie.imdbRating && (
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="flex items-center gap-1 px-3 py-1 rounded-lg bg-yellow-500/20">
              <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="font-semibold">{movie.imdbRating.toFixed(1)}</span>
            </div>
          </div>
        )}

        {/* Director */}
        {movie.director && (
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Directed by <span className="font-medium">{movie.director}</span>
          </p>
        )}
      </div>

      {/* Vote Buttons */}
      <div className="flex gap-4 w-full max-w-md">
        <button
          onClick={() => onVote('down')}
          className={`flex-1 py-4 px-6 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 ${
            isDarkMode
              ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border-2 border-red-500/40'
              : 'bg-red-50 hover:bg-red-100 text-red-600 border-2 border-red-200'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
            </svg>
            Not For Me
          </div>
        </button>

        <button
          onClick={() => onVote('up')}
          className={`flex-1 py-4 px-6 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 ${
            isDarkMode
              ? 'bg-green-500/20 hover:bg-green-500/30 text-green-400 border-2 border-green-500/40'
              : 'bg-green-50 hover:bg-green-100 text-green-600 border-2 border-green-200'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
            </svg>
            I Like It
          </div>
        </button>
      </div>
    </div>
  );
};

export default OnboardingMovieCard;
