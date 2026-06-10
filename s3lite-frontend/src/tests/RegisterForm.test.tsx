import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RegisterForm from '../components/RegisterPage/RegisterForm';
import { apiClient, setAuthToken } from '../api';

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

describe('RegisterForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders registration form inputs', () => {
    render(
      <MemoryRouter>
        <RegisterForm />
      </MemoryRouter>
    );
    expect(screen.getByLabelText(/USERNAME/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/EMAIL/i)).toBeInTheDocument();
    
    const passwordInputs = screen.getAllByPlaceholderText('············');
    expect(passwordInputs).toHaveLength(2);
    
    expect(screen.getByRole('button', { name: /Sign up/i })).toBeInTheDocument();
  });

  test('handles successful registration', async () => {
    (apiClient as jest.Mock).mockResolvedValueOnce({ token: 'fake-token', username: 'newuser' });

    render(
      <MemoryRouter>
        <RegisterForm />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/USERNAME/i), { target: { value: 'newuser' } });
    fireEvent.change(screen.getByLabelText(/EMAIL/i), { target: { value: 'test@example.com' } });
    
    const passwordInputs = screen.getAllByPlaceholderText('············');
    fireEvent.change(passwordInputs[0], { target: { value: 'password123' } });
    fireEvent.change(passwordInputs[1], { target: { value: 'password123' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Sign up/i }));

    await waitFor(() => {
      expect(apiClient).toHaveBeenCalledWith('/auth/register', {
        method: 'POST',
        data: { 
            username: 'newuser', 
            email: 'test@example.com', 
            password: 'password123', 
            passwordConfirm: 'password123' 
        },
      });
    });
    expect(setAuthToken).toHaveBeenCalledWith('fake-token');
    expect(mockNavigate).toHaveBeenCalledWith('/home');
  });

  test('handles registration failure', async () => {
    (apiClient as jest.Mock).mockRejectedValueOnce({ 
        response: { data: { message: 'Username already exists' } } 
    });

    render(
      <MemoryRouter>
        <RegisterForm />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/USERNAME/i), { target: { value: 'existinguser' } });
    fireEvent.change(screen.getByLabelText(/EMAIL/i), { target: { value: 'test@test.com' } });
    const passwordInputs1 = screen.getAllByPlaceholderText('············');
    fireEvent.change(passwordInputs1[0], { target: { value: 'password123' } });
    fireEvent.change(passwordInputs1[1], { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /Sign up/i }));

    await waitFor(() => {
      expect(screen.getByText('Username already exists')).toBeInTheDocument();
    });
  });

  test('handles generic registration failure', async () => {
    (apiClient as jest.Mock).mockRejectedValueOnce(new Error('Network Error'));

    render(
      <MemoryRouter>
        <RegisterForm />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/USERNAME/i), { target: { value: 'newuser' } });
    fireEvent.change(screen.getByLabelText(/EMAIL/i), { target: { value: 'test@test.com' } });
    const passwordInputs2 = screen.getAllByPlaceholderText('············');
    fireEvent.change(passwordInputs2[0], { target: { value: 'password123' } });
    fireEvent.change(passwordInputs2[1], { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /Sign up/i }));

    await waitFor(() => {
      expect(screen.getByText('Something went wrong. Please try again.')).toBeInTheDocument();
    });
  });
});
