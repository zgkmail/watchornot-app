import React from 'react';

const OnboardingMovieCard = ({ movie, onVote, isDarkMode }) => {
  const posterUrl = movie.poster
    ? `https://image.tmdb.org/t/p/w500${movie.poster}`
    : null;

  return (
    <div className="flex flex-col items-center">
      {/* Movie Poster */}
      <div className="relative w-full max-w-[180px] mb-3">
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={`${movie.title} poster`}
            className="w-full rounded-lg shadow-lg"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450"><rect width="300" height="450" fill="%23333"/><text x="50%" y="50%" text-anchor="middle" fill="%23999" font-family="Arial" font-size="16">No Poster</text></svg>';
            }}
          />
        ) : (
          <div className={`w-full aspect-[2/3] rounded-lg flex items-center justify-center ${
            isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
          }`}>
            <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>No Poster</p>
          </div>
        )}
      </div>

      {/* Movie Info */}
      <div className="text-center mb-3">
        <h3 className="text-lg font-bold mb-1 leading-tight">{movie.title}</h3>
        <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          {movie.year}
        </p>

        {/* Genres */}
        {movie.genres && movie.genres.length > 0 && (
          <div className="flex flex-wrap justify-center gap-1 mb-2">
            {movie.genres.slice(0, 3).map((genre, index) => (
              <span
                key={index}
                className={`px-2 py-0.5 rounded-full text-xs ${
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

        {/* Director */}
        {movie.director && (
          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <span className="font-normal">Director: </span>
            <span className="font-medium">{movie.director}</span>
          </p>
        )}
      </div>

      {/* Vote Buttons */}
      <div className="flex flex-col gap-2 w-full max-w-[280px]">
        <div className="flex gap-2">
          <button
            onClick={() => onVote('down')}
            className={`flex-1 py-2.5 px-2 rounded-lg font-semibold text-sm transition-all ${
              isDarkMode
                ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border-2 border-red-500/40'
                : 'bg-red-50 hover:bg-red-100 text-red-600 border-2 border-red-200'
            }`}
          >
            <div className="flex flex-col items-center gap-0.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
              </svg>
              <span className="text-xs">Pass</span>
            </div>
          </button>

          <button
            onClick={() => onVote('up')}
            className={`flex-1 py-2.5 px-2 rounded-lg font-semibold text-sm transition-all ${
              isDarkMode
                ? 'bg-green-500/20 hover:bg-green-500/30 text-green-400 border-2 border-green-500/40'
                : 'bg-green-50 hover:bg-green-100 text-green-600 border-2 border-green-200'
            }`}
          >
            <div className="flex flex-col items-center gap-0.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
              </svg>
              <span className="text-xs">Like</span>
            </div>
          </button>
        </div>

        <button
          onClick={() => onVote('skip')}
          className={`w-full py-2 px-2 rounded-lg font-semibold text-xs transition-all ${
            isDarkMode
              ? 'bg-gray-700/50 hover:bg-gray-700 text-gray-300 border-2 border-gray-600'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-2 border-gray-300'
          }`}
        >
          <div className="flex items-center justify-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
            <span>Haven't Seen</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default OnboardingMovieCard;
