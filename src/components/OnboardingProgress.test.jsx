import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import OnboardingProgress from './OnboardingProgress';

describe('OnboardingProgress', () => {
  test('should render progress text', () => {
    render(<OnboardingProgress current={3} total={5} isDarkMode={false} />);

    expect(screen.getByText('Vote 3 of 5')).toBeInTheDocument();
  });

  test('should render progress percentage', () => {
    render(<OnboardingProgress current={3} total={5} isDarkMode={false} />);

    expect(screen.getByText('60%')).toBeInTheDocument();
  });

  test('should calculate percentage correctly at start', () => {
    render(<OnboardingProgress current={1} total={5} isDarkMode={false} />);

    expect(screen.getByText('20%')).toBeInTheDocument();
  });

  test('should calculate percentage correctly at end', () => {
    render(<OnboardingProgress current={5} total={5} isDarkMode={false} />);

    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  test('should render correct number of step indicators', () => {
    const { container } = render(<OnboardingProgress current={3} total={5} isDarkMode={false} />);

    // Find all step indicator divs (they should be inside a flex container)
    const stepContainer = container.querySelector('.flex.justify-between.mt-2');
    const stepIndicators = stepContainer?.children;

    expect(stepIndicators).toHaveLength(5);
  });

  test('should apply dark mode styles', () => {
    const { container } = render(<OnboardingProgress current={3} total={5} isDarkMode={true} />);

    const progressText = screen.getByText('Vote 3 of 5');
    expect(progressText).toHaveClass('text-gray-300');
  });

  test('should apply light mode styles', () => {
    const { container } = render(<OnboardingProgress current={3} total={5} isDarkMode={false} />);

    const progressText = screen.getByText('Vote 3 of 5');
    expect(progressText).toHaveClass('text-gray-600');
  });

  test('should show progress bar with correct width', () => {
    const { container } = render(<OnboardingProgress current={3} total={5} isDarkMode={false} />);

    const progressBar = container.querySelector('.bg-gradient-to-r.from-blue-500.to-purple-500');
    expect(progressBar).toHaveStyle({ width: '60%' });
  });

  test('should handle 0% progress', () => {
    render(<OnboardingProgress current={0} total={5} isDarkMode={false} />);

    expect(screen.getByText('0%')).toBeInTheDocument();
  });
});
