import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LoginForm from '../components/LoginPage/LoginForm';
import { apiClient, setAuthToken } from '../api';

// Mock the API and routing
jest.mock('../api', () => ({
  apiClient: jest.fn(),
  setAuthToken: jest.fn(),
  setUsername: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  MemoryRouter: ({ children }: any) => <div>{children}</div>,
  useNavigate: () => mockNavigate,
}), { virtual: true });

describe('LoginForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders login form inputs', () => {
    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    );
    expect(screen.getByLabelText(/EMAIL OR USERNAME/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/PASSWORD/i, { selector: 'input' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign in/i })).toBeInTheDocument();
  });

  test('handles successful login', async () => {
    (apiClient as jest.Mock).mockResolvedValueOnce({ token: 'fake-token', username: 'testuser' });

    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/EMAIL OR USERNAME/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/PASSWORD/i, { selector: 'input' }), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /Sign in/i }));

    await waitFor(() => {
      expect(apiClient).toHaveBeenCalledWith('/auth/login', {
        method: 'POST',
        data: { username: 'testuser', password: 'password123' },
      });
      expect(setAuthToken).toHaveBeenCalledWith('fake-token');
      expect(mockNavigate).toHaveBeenCalledWith('/home');
    });
  });

  test('handles login failure', async () => {
    (apiClient as jest.Mock).mockRejectedValueOnce({ message: 'Invalid credentials' });

    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/EMAIL OR USERNAME/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/PASSWORD/i, { selector: 'input' }), { target: { value: 'wrongpassword' } });
    fireEvent.click(screen.getByRole('button', { name: /Sign in/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  test('toggles password visibility', () => {
    const { container } = render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    );
    const passwordInput = screen.getByLabelText(/PASSWORD/i, { selector: 'input' });
    expect(passwordInput).toHaveAttribute('type', 'password');

    const eyeIcon = container.querySelector('.lp-eye-icon');
    if (eyeIcon) {
      fireEvent.click(eyeIcon);
      expect(passwordInput).toHaveAttribute('type', 'text');
    }
  });
});
