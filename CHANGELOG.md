# Changelog

All notable changes to the WatchOrNot project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Error boundary for graceful error handling
- Safe localStorage wrapper with quota handling
- Service worker for PWA offline support
- API response caching to reduce external API calls
- Logging utility with environment-based log levels
- Configuration file for backend URL management
- Comprehensive deployment guide
- SQL injection prevention with input sanitization
- Graceful shutdown handling for server and database
- Environment variable validation on startup
- Request timeouts for all external API calls

### Changed
- Reduced JSON body limit from 10MB to 2MB for security
- Improved CORS validation with better logging
- Enhanced error handling in database operations
- Updated media type validation in TMDB routes
- Consolidated deployment documentation

### Fixed
- Critical server shutdown bug (app.close -> server.close)
- Memory leak in database cleanup interval
- Missing error handling in database operations
- Hardcoded backend URL in production builds

### Security
- Added input sanitization for LIKE queries
- Improved CORS origin validation
- Added API key validation warnings
- Reduced request body size limit

## [1.0.0] - 2024-11-09

### Added
- Initial release
- Movie/TV show image recognition using Claude Vision API
- TMDB integration for movie database
- OMDB integration for ratings (IMDb, Rotten Tomatoes, Metacritic)
- User taste profile based on ratings
- Personalized recommendation badges
- SQLite database for user data and ratings
- Session-based authentication
- Rate limiting for API protection
- PWA manifest for installable app
- Responsive mobile-first design
- Dark mode support

[Unreleased]: https://github.com/zgkmail/watchornot-app/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/zgkmail/watchornot-app/releases/tag/v1.0.0
