import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import OnboardingModal from './OnboardingModal';

// Mock child components
vi.mock('./OnboardingMovieCard', () => ({
  default: ({ movie, onVote }) => (
    <div data-testid="movie-card">
      <h3>{movie.title}</h3>
      <button onClick={() => onVote('up')}>Like</button>
      <button onClick={() => onVote('down')}>Dislike</button>
    </div>
  )
}));

vi.mock('./OnboardingProgress', () => ({
  default: ({ current, total }) => (
    <div data-testid="progress">Progress: {current}/{total}</div>
  )
}));

vi.mock('./OnboardingComplete', () => ({
  default: ({ data, onContinue }) => (
    <div data-testid="complete">
      <h2>Complete: {data.tier}</h2>
      <button onClick={onContinue}>Continue</button>
    </div>
  )
}));

describe('OnboardingModal', () => {
  const mockFetchWithSession = vi.fn();
  const mockOnClose = vi.fn();
  const mockOnComplete = vi.fn();

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onComplete: mockOnComplete,
    isDarkMode: false,
    backendUrl: 'http://localhost:3001',
    fetchWithSession: mockFetchWithSession
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should not render when isOpen is false', () => {
    const { container } = render(
      <OnboardingModal {...defaultProps} isOpen={false} />
    );
    expect(container.firstChild).toBeNull();
  });

  test('should show loading state initially', () => {
    render(<OnboardingModal {...defaultProps} />);
    expect(screen.getByText('Loading movies...')).toBeInTheDocument();
  });

  test('should load movies on mount', async () => {
    const mockMovies = [
      { id: '1', title: 'Movie 1', year: 2020, genres: ['Action'], imdbRating: 8.0 },
      { id: '2', title: 'Movie 2', year: 2021, genres: ['Drama'], imdbRating: 7.5 },
      { id: '3', title: 'Movie 3', year: 2022, genres: ['Comedy'], imdbRating: 7.0 },
      { id: '4', title: 'Movie 4', year: 2023, genres: ['Thriller'], imdbRating: 8.5 },
      { id: '5', title: 'Movie 5', year: 2024, genres: ['Sci-Fi'], imdbRating: 9.0 }
    ];

    mockFetchWithSession.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ movies: mockMovies })
    });

    render(<OnboardingModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Build Your Taste Profile')).toBeInTheDocument();
    });

    expect(mockFetchWithSession).toHaveBeenCalledWith(
      'http://localhost:3001/api/onboarding/movies'
    );
  });

  test('should show voting interface after loading movies', async () => {
    const mockMovies = [
      { id: '1', title: 'Test Movie', year: 2020, genres: ['Action'], imdbRating: 8.0 }
    ];

    mockFetchWithSession.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ movies: mockMovies })
    });

    render(<OnboardingModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId('movie-card')).toBeInTheDocument();
    });

    expect(screen.getByText('Test Movie')).toBeInTheDocument();
    expect(screen.getByTestId('progress')).toBeInTheDocument();
  });

  test('should handle close button click', () => {
    render(<OnboardingModal {...defaultProps} />);

    const closeButton = screen.getByLabelText('Skip onboarding');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  test('should handle skip button click', async () => {
    const mockMovies = [
      { id: '1', title: 'Test Movie', year: 2020, genres: ['Action'], imdbRating: 8.0 }
    ];

    mockFetchWithSession.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ movies: mockMovies })
    });

    render(<OnboardingModal {...defaultProps} />);

    // Wait for movies to load and skip button to appear
    await waitFor(() => {
      expect(screen.getByText('Skip for now')).toBeInTheDocument();
    });

    const skipButton = screen.getByText('Skip for now');
    fireEvent.click(skipButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  test('should advance to next movie after voting', async () => {
    const mockMovies = [
      { id: '1', title: 'Movie 1', year: 2020, genres: ['Action'], imdbRating: 8.0 },
      { id: '2', title: 'Movie 2', year: 2021, genres: ['Drama'], imdbRating: 7.5 }
    ];

    mockFetchWithSession.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ movies: mockMovies })
    });

    render(<OnboardingModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Movie 1')).toBeInTheDocument();
    });

    // Vote on first movie
    const likeButton = screen.getByText('Like');
    fireEvent.click(likeButton);

    // Should show second movie
    await waitFor(() => {
      expect(screen.getByText('Movie 2')).toBeInTheDocument();
    });
  });

  test('should submit votes after rating all movies', async () => {
    const mockMovies = [
      { id: '1', title: 'Movie 1', year: 2020, genres: ['Action'], imdbRating: 8.0, director: 'Test', cast: 'Test', poster: '/test.jpg' }
    ];

    const mockCompletionData = {
      success: true,
      tier: 'Newcomer',
      totalVotes: 1,
      topGenres: [{ genre: 'Action', count: 1 }]
    };

    mockFetchWithSession
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ movies: mockMovies })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockCompletionData
      });

    render(<OnboardingModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Movie 1')).toBeInTheDocument();
    });

    // Vote on last movie
    const likeButton = screen.getByText('Like');
    fireEvent.click(likeButton);

    // Should submit votes and show completion screen
    await waitFor(() => {
      expect(screen.getByTestId('complete')).toBeInTheDocument();
    });

    expect(mockFetchWithSession).toHaveBeenCalledWith(
      'http://localhost:3001/api/onboarding/complete',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('Movie 1')
      })
    );
  });

  test('should handle completion and call onComplete', async () => {
    const mockMovies = [
      { id: '1', title: 'Movie 1', year: 2020, genres: ['Action'], imdbRating: 8.0, director: 'Test', cast: 'Test', poster: '/test.jpg' }
    ];

    const mockCompletionData = {
      success: true,
      tier: 'Newcomer',
      totalVotes: 1,
      topGenres: []
    };

    mockFetchWithSession
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ movies: mockMovies })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockCompletionData
      });

    render(<OnboardingModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Movie 1')).toBeInTheDocument();
    });

    // Vote and complete
    const likeButton = screen.getByText('Like');
    fireEvent.click(likeButton);

    await waitFor(() => {
      expect(screen.getByTestId('complete')).toBeInTheDocument();
    });

    // Click continue
    const continueButton = screen.getByText('Continue');
    fireEvent.click(continueButton);

    expect(mockOnComplete).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('should handle API error when loading movies', async () => {
    mockFetchWithSession.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Failed to load' })
    });

    render(<OnboardingModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load movies. Please try again.')).toBeInTheDocument();
    });

    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  test('should handle network error when loading movies', async () => {
    mockFetchWithSession.mockRejectedValueOnce(new Error('Network error'));

    render(<OnboardingModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load movies. Please try again.')).toBeInTheDocument();
    });
  });

  test('should handle retry after error', async () => {
    const mockMovies = [
      { id: '1', title: 'Movie 1', year: 2020, genres: ['Action'], imdbRating: 8.0 }
    ];

    // First call fails, second succeeds
    mockFetchWithSession
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Failed' })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ movies: mockMovies })
      });

    render(<OnboardingModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    const retryButton = screen.getByText('Try Again');
    fireEvent.click(retryButton);

    await waitFor(() => {
      expect(screen.getByText('Build Your Taste Profile')).toBeInTheDocument();
    });
  });

  test('should work in dark mode', async () => {
    const mockMovies = [
      { id: '1', title: 'Movie 1', year: 2020, genres: ['Action'], imdbRating: 8.0 }
    ];

    mockFetchWithSession.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ movies: mockMovies })
    });

    const { container } = render(<OnboardingModal {...defaultProps} isDarkMode={true} />);

    await waitFor(() => {
      expect(screen.getByText('Build Your Taste Profile')).toBeInTheDocument();
    });

    // Check for dark mode classes
    const modalContent = container.querySelector('.bg-gray-800');
    expect(modalContent).toBeInTheDocument();
  });
});
