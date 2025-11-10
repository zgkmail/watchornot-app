# Contributing to WatchOrNot

Thank you for your interest in contributing to WatchOrNot! This document provides guidelines and instructions for contributing.

## Code of Conduct

This project adheres to a Code of Conduct that all contributors are expected to follow. Please read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before contributing.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce** the issue
- **Expected vs actual behavior**
- **Screenshots** if applicable
- **Environment details** (OS, browser, Node version)
- **Error messages** or logs

### Suggesting Enhancements

Enhancement suggestions are welcome! Please:

- Use a clear and descriptive title
- Provide detailed description of the proposed feature
- Explain why this enhancement would be useful
- Include mockups or examples if applicable

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Make your changes** following the code style guidelines
3. **Add tests** if applicable
4. **Update documentation** as needed
5. **Ensure tests pass**: `npm test`
6. **Create a pull request** with a clear description

## Development Setup

1. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/watchornot-app.git
   cd watchornot-app
   ```

2. Install dependencies:
   ```bash
   npm install
   cd backend && npm install && cd ..
   ```

3. Set up environment variables:
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your API keys
   ```

4. Start development servers:
   ```bash
   # Terminal 1 - Backend
   cd backend && npm run dev

   # Terminal 2 - Frontend
   npm run dev
   ```

## Code Style Guidelines

### JavaScript/React

- Use **ES6+ syntax**
- Use **functional components** with hooks
- Follow **existing code patterns**
- Add **JSDoc comments** for complex functions
- Use **meaningful variable names**

### Backend

- Use **async/await** for asynchronous code
- Add **error handling** with try-catch
- Use **prepared statements** for database queries
- Log important events with appropriate log levels

### Git Commit Messages

- Use present tense ("Add feature" not "Added feature")
- Use imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit first line to 72 characters
- Reference issues and pull requests

Examples:
```
Add image upload feature
Fix CORS error in production
Update README with new deployment instructions
Refactor database connection handling
```

## Testing

- Write tests for new features
- Ensure existing tests pass
- Aim for good code coverage
- Test edge cases and error conditions

```bash
cd backend
npm run test        # Run all tests
npm run test:core   # Run core tests only
npm run test:coverage # Generate coverage report
```

## Documentation

- Update README.md if adding features
- Add JSDoc comments for public APIs
- Update relevant markdown files
- Include code examples where helpful

## Project Structure

```
watchornot-app/
├── backend/              # Express.js backend
│   ├── db/              # Database layer
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions
│   └── __tests__/       # Backend tests
├── src/                 # React frontend
│   ├── components/      # React components
│   ├── utils/           # Frontend utilities
│   └── App.jsx          # Main app component
└── public/              # Static assets
```

## Pull Request Process

1. Update documentation for any changed functionality
2. Add tests for new features
3. Ensure all tests pass
4. Update CHANGELOG.md with your changes
5. Request review from maintainers
6. Address review comments
7. Squash commits if requested

## Questions?

Feel free to open an issue for:
- Questions about the codebase
- How to contribute
- Clarification on guidelines
- Feature discussions

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Recognition

Contributors will be recognized in:
- CHANGELOG.md for their specific contributions
- GitHub contributors page
- Special mentions for significant contributions

Thank you for contributing to WatchOrNot! 🎬
