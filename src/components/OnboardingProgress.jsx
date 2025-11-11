import React from 'react';

const OnboardingProgress = ({ current, total, isDarkMode }) => {
  const percentage = (current / total) * 100;

  return (
    <div className="mb-4">
      {/* Progress text */}
      <div className="flex justify-between items-center mb-1.5">
        <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Movie {current} of {total}
        </span>
        <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          {Math.round(percentage)}%
        </span>
      </div>

      {/* Progress bar */}
      <div className={`w-full h-1.5 rounded-full overflow-hidden ${
        isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
      }`}>
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Step indicators */}
      <div className="flex justify-between mt-2">
        {Array.from({ length: total }, (_, index) => (
          <div
            key={index}
            className={`w-full h-0.5 mx-0.5 rounded-full transition-all duration-300 ${
              index < current
                ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                : isDarkMode
                ? 'bg-gray-700'
                : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default OnboardingProgress;
