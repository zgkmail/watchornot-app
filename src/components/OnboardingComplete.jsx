import React from 'react';

const OnboardingComplete = ({ data, onContinue, isDarkMode }) => {
  const { tier, totalVotes, topGenres } = data;

  // Tier display configuration
  const tierConfig = {
    'Newcomer': {
      icon: '🎬',
      color: 'from-gray-400 to-gray-600',
      bgColor: isDarkMode ? 'bg-gray-500/20' : 'bg-gray-100',
      borderColor: 'border-gray-500/40'
    },
    'Explorer': {
      icon: '🌟',
      color: 'from-blue-400 to-blue-600',
      bgColor: isDarkMode ? 'bg-blue-500/20' : 'bg-blue-100',
      borderColor: 'border-blue-500/40'
    },
    'Enthusiast': {
      icon: '🎯',
      color: 'from-purple-400 to-purple-600',
      bgColor: isDarkMode ? 'bg-purple-500/20' : 'bg-purple-100',
      borderColor: 'border-purple-500/40'
    },
    'Expert': {
      icon: '💎',
      color: 'from-yellow-400 to-yellow-600',
      bgColor: isDarkMode ? 'bg-yellow-500/20' : 'bg-yellow-100',
      borderColor: 'border-yellow-500/40'
    },
    'Master': {
      icon: '👑',
      color: 'from-red-400 to-red-600',
      bgColor: isDarkMode ? 'bg-red-500/20' : 'bg-red-100',
      borderColor: 'border-red-500/40'
    }
  };

  const config = tierConfig[tier] || tierConfig['Newcomer'];

  return (
    <div className="text-center py-4">
      {/* Success Animation */}
      <div className="mb-3">
        <div className="relative inline-block">
          <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${config.color} flex items-center justify-center text-4xl animate-bounce-slow`}>
            {config.icon}
          </div>
          <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${config.color} opacity-20 animate-ping`}></div>
        </div>
      </div>

      {/* Congratulations */}
      <h2 className="text-2xl font-bold mb-2">
        Congratulations!
      </h2>

      <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
        Taste profile created
      </p>

      {/* Tier Badge */}
      <div className={`inline-block px-4 py-2 rounded-lg border-2 ${config.bgColor} ${config.borderColor} mb-4`}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{config.icon}</span>
          <div className="text-left">
            <p className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              You've reached
            </p>
            <p className={`text-lg font-bold bg-gradient-to-r ${config.color} bg-clip-text text-transparent`}>
              {tier} Tier
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className={`grid grid-cols-1 gap-3 mb-4 max-w-md mx-auto`}>
        {/* Total Votes */}
        <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Movies Rated
          </p>
          <p className="text-2xl font-bold">{totalVotes}</p>
        </div>

        {/* Top Genres */}
        {topGenres && topGenres.length > 0 && (
          <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
            <p className={`text-xs mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Your Favorite Genres
            </p>
            <div className="flex flex-wrap justify-center gap-1.5">
              {topGenres.map((genreData, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${
                    isDarkMode
                      ? 'bg-gray-600 text-gray-200'
                      : 'bg-white text-gray-700'
                  }`}
                >
                  <span className="font-semibold text-sm">{genreData.genre}</span>
                  <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    ({genreData.count})
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Next Steps */}
      <div className={`p-3 rounded-lg mb-4 ${isDarkMode ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
        <p className={`text-xs ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
          We'll use your preferences to give you personalized recommendations!
        </p>
      </div>

      {/* Continue Button */}
      <button
        onClick={onContinue}
        className={`w-full max-w-md py-3 px-4 rounded-lg font-semibold text-sm transition-all bg-gradient-to-r ${config.color} text-white shadow-lg`}
      >
        Start Exploring Movies
      </button>

      {/* Tier Progression Info */}
      <div className={`mt-3 text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
        <p className="text-[10px]">Keep rating movies to unlock higher tiers!</p>
        <p className="mt-0.5 text-[10px]">
          Next: {tier === 'Newcomer' && 'Explorer (5 votes)'}
          {tier === 'Explorer' && 'Enthusiast (15 votes)'}
          {tier === 'Enthusiast' && 'Expert (30 votes)'}
          {tier === 'Expert' && 'Master (50 votes)'}
          {tier === 'Master' && "You're at the top! 🎉"}
        </p>
      </div>
    </div>
  );
};

export default OnboardingComplete;
