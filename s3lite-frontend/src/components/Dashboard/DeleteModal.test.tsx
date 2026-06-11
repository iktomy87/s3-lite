import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DeleteModal from './DeleteModal';

describe('DeleteModal Component', () => {
  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not render when isOpen is false', () => {
    render(
      <DeleteModal isOpen={false} onClose={mockOnClose} onConfirm={mockOnConfirm} />
    );
    expect(screen.queryByText('Delete object')).toBeNull();
  });

  it('renders correctly when isOpen is true', () => {
    render(
      <DeleteModal isOpen={true} onClose={mockOnClose} onConfirm={mockOnConfirm} targetKey="test-file.txt" />
    );
    expect(screen.getByText('Delete object')).toBeInTheDocument();
    expect(screen.getByText('test-file.txt')).toBeInTheDocument();
  });

  it('renders dash if targetKey is not provided', () => {
    render(
      <DeleteModal isOpen={true} onClose={mockOnClose} onConfirm={mockOnConfirm} />
    );
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('renders error message if provided', () => {
    render(
      <DeleteModal isOpen={true} onClose={mockOnClose} onConfirm={mockOnConfirm} error="Failed to delete" />
    );
    expect(screen.getByText('Failed to delete')).toBeInTheDocument();
  });

  it('calls onClose when Cancel is clicked', () => {
    render(
      <DeleteModal isOpen={true} onClose={mockOnClose} onConfirm={mockOnConfirm} />
    );
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onConfirm when Delete is clicked', () => {
    render(
      <DeleteModal isOpen={true} onClose={mockOnClose} onConfirm={mockOnConfirm} />
    );
    fireEvent.click(screen.getByText('Delete'));
    expect(mockOnConfirm).toHaveBeenCalled();
  });
});
