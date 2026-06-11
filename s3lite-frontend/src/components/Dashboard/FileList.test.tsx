import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FileList from './FileList';

describe('FileList Component', () => {
  const mockOnAllVersions = jest.fn();
  const mockOnFilter = jest.fn();
  const mockOnRefresh = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders breadcrumb and controls', () => {
    render(
      <FileList onAllVersions={mockOnAllVersions} onFilter={mockOnFilter} onRefresh={mockOnRefresh} />
    );
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('All versions')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Filter…')).toBeInTheDocument();
  });

  it('calls onAllVersions when checkbox is toggled', () => {
    render(
      <FileList onAllVersions={mockOnAllVersions} onFilter={mockOnFilter} onRefresh={mockOnRefresh} />
    );
    const checkbox = screen.getByLabelText('All versions');
    fireEvent.click(checkbox);
    expect(mockOnAllVersions).toHaveBeenCalled();
  });

  it('calls onFilter when filter input changes', () => {
    render(
      <FileList onAllVersions={mockOnAllVersions} onFilter={mockOnFilter} onRefresh={mockOnRefresh} />
    );
    const input = screen.getByPlaceholderText('Filter…');
    fireEvent.change(input, { target: { value: 'test' } });
    
    expect(mockOnFilter).toHaveBeenCalledWith('test');
  });

  it('calls onRefresh when refresh button is clicked', () => {
    render(
      <FileList onAllVersions={mockOnAllVersions} onFilter={mockOnFilter} onRefresh={mockOnRefresh} />
    );
    
    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    fireEvent.click(refreshButton);
    expect(mockOnRefresh).toHaveBeenCalled();
  });
});
