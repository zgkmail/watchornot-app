import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import OnboardingComplete from './OnboardingComplete';

describe('OnboardingComplete', () => {
  const mockOnContinue = vi.fn();

  test('should render congratulations message', () => {
    const data = {
      tier: 'Explorer',
      totalVotes: 5,
      topGenres: [
        { genre: 'Action', count: 2 },
        { genre: 'Drama', count: 1 }
      ]
    };

    render(<OnboardingComplete data={data} onContinue={mockOnContinue} isDarkMode={false} />);

    expect(screen.getByText('Congratulations!')).toBeInTheDocument();
    expect(screen.getByText('Your taste profile has been created')).toBeInTheDocument();
  });

  test('should display tier information', () => {
    const data = {
      tier: 'Explorer',
      totalVotes: 5,
      topGenres: []
    };

    render(<OnboardingComplete data={data} onContinue={mockOnContinue} isDarkMode={false} />);

    expect(screen.getByText("You've reached")).toBeInTheDocument();
    expect(screen.getByText('Explorer Tier')).toBeInTheDocument();
  });

  test('should display total votes', () => {
    const data = {
      tier: 'Explorer',
      totalVotes: 5,
      topGenres: []
    };

    render(<OnboardingComplete data={data} onContinue={mockOnContinue} isDarkMode={false} />);

    expect(screen.getByText('Movies Rated')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  test('should display top genres', () => {
    const data = {
      tier: 'Explorer',
      totalVotes: 5,
      topGenres: [
        { genre: 'Action', count: 3 },
        { genre: 'Drama', count: 2 }
      ]
    };

    render(<OnboardingComplete data={data} onContinue={mockOnContinue} isDarkMode={false} />);

    expect(screen.getByText('Your Favorite Genres')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
    expect(screen.getByText('(3)')).toBeInTheDocument();
    expect(screen.getByText('Drama')).toBeInTheDocument();
    expect(screen.getByText('(2)')).toBeInTheDocument();
  });

  test('should handle empty top genres', () => {
    const data = {
      tier: 'Newcomer',
      totalVotes: 3,
      topGenres: []
    };

    render(<OnboardingComplete data={data} onContinue={mockOnContinue} isDarkMode={false} />);

    expect(screen.queryByText('Your Favorite Genres')).not.toBeInTheDocument();
  });

  test('should call onContinue when continue button clicked', () => {
    const data = {
      tier: 'Explorer',
      totalVotes: 5,
      topGenres: []
    };

    render(<OnboardingComplete data={data} onContinue={mockOnContinue} isDarkMode={false} />);

    const continueButton = screen.getByText('Start Exploring Movies');
    fireEvent.click(continueButton);

    expect(mockOnContinue).toHaveBeenCalled();
  });

  test('should show correct tier icon for Explorer', () => {
    const data = {
      tier: 'Explorer',
      totalVotes: 5,
      topGenres: []
    };

    render(<OnboardingComplete data={data} onContinue={mockOnContinue} isDarkMode={false} />);

    // Explorer tier uses 🌟 emoji
    expect(screen.getAllByText('🌟')).toHaveLength(2); // Icon appears twice (in badge and completion)
  });

  test('should show correct tier icon for Newcomer', () => {
    const data = {
      tier: 'Newcomer',
      totalVotes: 3,
      topGenres: []
    };

    render(<OnboardingComplete data={data} onContinue={mockOnContinue} isDarkMode={false} />);

    // Newcomer tier uses 🎬 emoji
    expect(screen.getAllByText('🎬')).toHaveLength(2);
  });

  test('should show correct tier icon for Enthusiast', () => {
    const data = {
      tier: 'Enthusiast',
      totalVotes: 15,
      topGenres: []
    };

    render(<OnboardingComplete data={data} onContinue={mockOnContinue} isDarkMode={false} />);

    // Enthusiast tier uses 🎯 emoji
    expect(screen.getAllByText('🎯')).toHaveLength(2);
  });

  test('should show correct tier icon for Expert', () => {
    const data = {
      tier: 'Expert',
      totalVotes: 30,
      topGenres: []
    };

    render(<OnboardingComplete data={data} onContinue={mockOnContinue} isDarkMode={false} />);

    // Expert tier uses 💎 emoji
    expect(screen.getAllByText('💎')).toHaveLength(2);
  });

  test('should show correct tier icon for Master', () => {
    const data = {
      tier: 'Master',
      totalVotes: 50,
      topGenres: []
    };

    render(<OnboardingComplete data={data} onContinue={mockOnContinue} isDarkMode={false} />);

    // Master tier uses 👑 emoji
    expect(screen.getAllByText('👑')).toHaveLength(2);
  });

  test('should show correct next tier message for Newcomer', () => {
    const data = {
      tier: 'Newcomer',
      totalVotes: 3,
      topGenres: []
    };

    render(<OnboardingComplete data={data} onContinue={mockOnContinue} isDarkMode={false} />);

    expect(screen.getByText(/Next tier: Explorer \(5 votes\)/)).toBeInTheDocument();
  });

  test('should show correct next tier message for Explorer', () => {
    const data = {
      tier: 'Explorer',
      totalVotes: 5,
      topGenres: []
    };

    render(<OnboardingComplete data={data} onContinue={mockOnContinue} isDarkMode={false} />);

    expect(screen.getByText(/Next tier: Enthusiast \(15 votes\)/)).toBeInTheDocument();
  });

  test('should show correct message for Master tier', () => {
    const data = {
      tier: 'Master',
      totalVotes: 50,
      topGenres: []
    };

    render(<OnboardingComplete data={data} onContinue={mockOnContinue} isDarkMode={false} />);

    expect(screen.getByText(/You're at the top!/)).toBeInTheDocument();
  });

  test('should apply dark mode styles', () => {
    const data = {
      tier: 'Explorer',
      totalVotes: 5,
      topGenres: []
    };

    const { container } = render(<OnboardingComplete data={data} onContinue={mockOnContinue} isDarkMode={true} />);

    // Check for dark mode background
    const statsCard = container.querySelector('.bg-gray-700\\/50');
    expect(statsCard).toBeInTheDocument();
  });

  test('should apply light mode styles', () => {
    const data = {
      tier: 'Explorer',
      totalVotes: 5,
      topGenres: []
    };

    const { container } = render(<OnboardingComplete data={data} onContinue={mockOnContinue} isDarkMode={false} />);

    // Check for light mode background
    const statsCard = container.querySelector('.bg-gray-100');
    expect(statsCard).toBeInTheDocument();
  });

  test('should show personalization message', () => {
    const data = {
      tier: 'Explorer',
      totalVotes: 5,
      topGenres: []
    };

    render(<OnboardingComplete data={data} onContinue={mockOnContinue} isDarkMode={false} />);

    expect(screen.getByText("We'll use your preferences to give you personalized movie recommendations!")).toBeInTheDocument();
  });
});
