import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import BucketModal from './BucketModal';

describe('BucketModal Component', () => {
  const mockOnClose = jest.fn();
  const mockOnCreate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('does not render initially when isOpen is false', () => {
    render(
      <BucketModal isOpen={false} onClose={mockOnClose} onCreate={mockOnCreate} />
    );
    expect(screen.queryByText('Create new bucket')).toBeNull();
  });

  it('renders correctly when isOpen is true', () => {
    render(
      <BucketModal isOpen={true} onClose={mockOnClose} onCreate={mockOnCreate} />
    );
    
    act(() => {
      jest.runAllTimers();
    });

    expect(screen.getByText('Create new bucket')).toBeInTheDocument();
  });

  it('calls onCreate with input value', () => {
    render(
      <BucketModal isOpen={true} onClose={mockOnClose} onCreate={mockOnCreate} />
    );
    
    act(() => {
      jest.runAllTimers();
    });

    const input = screen.getByPlaceholderText('e.g. ci-artifacts');
    fireEvent.change(input, { target: { value: 'my-bucket' } });
    
    fireEvent.click(screen.getByText('Create'));
    expect(mockOnCreate).toHaveBeenCalledWith('my-bucket');
  });

  it('calls onCreate on Enter key', () => {
    render(
      <BucketModal isOpen={true} onClose={mockOnClose} onCreate={mockOnCreate} />
    );
    
    act(() => {
      jest.runAllTimers();
    });

    const input = screen.getByPlaceholderText('e.g. ci-artifacts');
    fireEvent.change(input, { target: { value: 'my-bucket' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    
    expect(mockOnCreate).toHaveBeenCalledWith('my-bucket');
  });

  it('renders error message if provided', () => {
    render(
      <BucketModal isOpen={true} onClose={mockOnClose} onCreate={mockOnCreate} error="Bucket exists" />
    );
    
    act(() => {
      jest.runAllTimers();
    });

    expect(screen.getByText('Bucket exists')).toBeInTheDocument();
  });
});
