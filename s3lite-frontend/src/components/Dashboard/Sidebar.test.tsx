import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Sidebar } from './Sidebar';

describe('Sidebar Component', () => {
  const mockOnExploreBucket = jest.fn();
  const mockOnLogout = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders default user information and storage', () => {
    render(<Sidebar />);
    expect(screen.getByText('Usuario')).toBeInTheDocument();
    expect(screen.getByText('U')).toBeInTheDocument();
    expect(screen.getByText('0 GB used from 256 GB')).toBeInTheDocument();
  });

  it('renders provided user information and storage', () => {
    render(<Sidebar userName="Alice" storageUsedGB={50} storageTotalGB={100} />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('50 GB used from 100 GB')).toBeInTheDocument();
  });

  it('changes active tab when clicked', () => {
    render(<Sidebar />);
    
    const recentTab = screen.getByRole('button', { name: /recent/i });
    fireEvent.click(recentTab);
    expect(recentTab).toHaveClass('active');
    
    const allFilesTab = screen.getByRole('button', { name: /all files/i });
    expect(allFilesTab).not.toHaveClass('active');
  });

  it('submits bucket form with query', () => {
    render(<Sidebar onExploreBucket={mockOnExploreBucket} />);
    
    const input = screen.getByPlaceholderText('Bucket name…');
    fireEvent.change(input, { target: { value: 'my-new-bucket' } });
    
    const submitBtn = screen.getByRole('button', { name: /explore bucket/i });
    fireEvent.click(submitBtn);
    
    expect(mockOnExploreBucket).toHaveBeenCalledWith('my-new-bucket');
  });

  it('calls onLogout when logout button is clicked', () => {
    render(<Sidebar onLogout={mockOnLogout} />);
    
    const logoutBtn = screen.getByTitle('Sign out');
    fireEvent.click(logoutBtn);
    
    expect(mockOnLogout).toHaveBeenCalled();
  });
});
