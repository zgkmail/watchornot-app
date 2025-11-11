import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import OnboardingMovieCard from './OnboardingMovieCard';

describe('OnboardingMovieCard', () => {
  const mockMovie = {
    id: '1',
    title: 'Test Movie',
    year: 2020,
    genres: ['Action', 'Drama'],
    imdbRating: 8.5,
    director: 'Test Director',
    cast: 'Actor 1, Actor 2',
    poster: '/test-poster.jpg'
  };

  test('should render movie information', () => {
    const mockOnVote = vi.fn();
    render(<OnboardingMovieCard movie={mockMovie} onVote={mockOnVote} isDarkMode={false} />);

    expect(screen.getByText('Test Movie')).toBeInTheDocument();
    expect(screen.getByText('2020')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
    expect(screen.getByText('Drama')).toBeInTheDocument();
    expect(screen.getByText('8.5')).toBeInTheDocument();
    expect(screen.getByText(/Test Director/)).toBeInTheDocument();
  });

  test('should render movie poster', () => {
    const mockOnVote = vi.fn();
    render(<OnboardingMovieCard movie={mockMovie} onVote={mockOnVote} isDarkMode={false} />);

    const poster = screen.getByAltText('Test Movie poster');
    expect(poster).toBeInTheDocument();
    expect(poster.src).toContain('https://image.tmdb.org/t/p/w500/test-poster.jpg');
  });

  test('should show placeholder when no poster', () => {
    const movieWithoutPoster = { ...mockMovie, poster: null };
    const mockOnVote = vi.fn();
    render(<OnboardingMovieCard movie={movieWithoutPoster} onVote={mockOnVote} isDarkMode={false} />);

    expect(screen.getByText('No Poster Available')).toBeInTheDocument();
  });

  test('should call onVote with "up" when like button clicked', () => {
    const mockOnVote = vi.fn();
    render(<OnboardingMovieCard movie={mockMovie} onVote={mockOnVote} isDarkMode={false} />);

    const likeButton = screen.getByText('I Like It');
    fireEvent.click(likeButton);

    expect(mockOnVote).toHaveBeenCalledWith('up');
  });

  test('should call onVote with "down" when dislike button clicked', () => {
    const mockOnVote = vi.fn();
    render(<OnboardingMovieCard movie={mockMovie} onVote={mockOnVote} isDarkMode={false} />);

    const dislikeButton = screen.getByText('Not For Me');
    fireEvent.click(dislikeButton);

    expect(mockOnVote).toHaveBeenCalledWith('down');
  });

  test('should apply dark mode styles', () => {
    const mockOnVote = vi.fn();
    const { container } = render(<OnboardingMovieCard movie={mockMovie} onVote={mockOnVote} isDarkMode={true} />);

    // Check for dark mode classes (e.g., text-gray-300 for subtitle)
    const yearText = screen.getByText('2020');
    expect(yearText).toHaveClass('text-gray-300');
  });

  test('should apply light mode styles', () => {
    const mockOnVote = vi.fn();
    const { container } = render(<OnboardingMovieCard movie={mockMovie} onVote={mockOnVote} isDarkMode={false} />);

    // Check for light mode classes
    const yearText = screen.getByText('2020');
    expect(yearText).toHaveClass('text-gray-600');
  });

  test('should handle missing director gracefully', () => {
    const movieWithoutDirector = { ...mockMovie, director: null };
    const mockOnVote = vi.fn();
    render(<OnboardingMovieCard movie={movieWithoutDirector} onVote={mockOnVote} isDarkMode={false} />);

    expect(screen.queryByText(/Directed by/)).not.toBeInTheDocument();
  });

  test('should handle missing IMDb rating gracefully', () => {
    const movieWithoutRating = { ...mockMovie, imdbRating: null };
    const mockOnVote = vi.fn();
    render(<OnboardingMovieCard movie={movieWithoutRating} onVote={mockOnVote} isDarkMode={false} />);

    expect(screen.queryByText('8.5')).not.toBeInTheDocument();
  });

  test('should handle empty genres array', () => {
    const movieWithoutGenres = { ...mockMovie, genres: [] };
    const mockOnVote = vi.fn();
    render(<OnboardingMovieCard movie={movieWithoutGenres} onVote={mockOnVote} isDarkMode={false} />);

    expect(screen.queryByText('Action')).not.toBeInTheDocument();
  });
});
