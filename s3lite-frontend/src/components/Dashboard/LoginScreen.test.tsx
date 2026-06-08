import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LoginScreen } from './LoginScreen';

describe('LoginScreen Component', () => {
  const mockOnLogin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders login form', () => {
    render(<LoginScreen onLogin={mockOnLogin} />);
    expect(screen.getByText('S3-Lite')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByText('Sign in')).toBeInTheDocument();
  });

  it('updates state on input change and calls onLogin', () => {
    render(<LoginScreen onLogin={mockOnLogin} />);
    
    const usernameInput = screen.getByPlaceholderText('username');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    fireEvent.click(screen.getByText('Sign in'));
    expect(mockOnLogin).toHaveBeenCalledWith('testuser', 'password123');
  });

  it('renders error message if provided', () => {
    render(<LoginScreen onLogin={mockOnLogin} error="Invalid credentials" />);
    expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
  });
});
