import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

// Simple smoke test to verify testing infrastructure
describe('Testing Infrastructure', () => {
  it('should render a simple component', () => {
    const TestComponent = () => <div>Hello Test</div>
    render(<TestComponent />)
    expect(screen.getByText('Hello Test')).toBeInTheDocument()
  })

  it('should have jest-dom matchers available', () => {
    const element = document.createElement('div')
    element.textContent = 'Test'
    expect(element).toHaveTextContent('Test')
  })

  it('should have localStorage mocked', () => {
    localStorage.setItem('test', 'value')
    expect(localStorage.setItem).toHaveBeenCalledWith('test', 'value')
  })
})
