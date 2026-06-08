import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import UploadModal from './UploadModal';

describe('UploadModal Component', () => {
  const mockOnClose = jest.fn();
  const mockOnUpload = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <UploadModal isOpen={false} onClose={mockOnClose} onUpload={mockOnUpload} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders correctly when isOpen is true', () => {
    render(
      <UploadModal isOpen={true} onClose={mockOnClose} onUpload={mockOnUpload} bucketLabel="test-bucket" />
    );
    expect(screen.getByText('Upload object')).toBeInTheDocument();
    expect(screen.getByText('test-bucket')).toBeInTheDocument();
  });

  it('calls onClose when Cancel is clicked', () => {
    render(
      <UploadModal isOpen={true} onClose={mockOnClose} onUpload={mockOnUpload} />
    );
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('disables Upload button initially', () => {
    render(
      <UploadModal isOpen={true} onClose={mockOnClose} onUpload={mockOnUpload} />
    );
    expect(screen.getByText('Upload')).toBeDisabled();
  });

  it('calls onUpload when file and key are provided', () => {
    const { container } = render(
      <UploadModal isOpen={true} onClose={mockOnClose} onUpload={mockOnUpload} />
    );
    
    // Simulate file selection
    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    const fileInput = container.querySelector('#fileInput') as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    expect(screen.getByText('hello.png')).toBeInTheDocument();
    
    // Simulate key input
    const keyInput = screen.getByPlaceholderText('e.g. builds/2024/artifact.zip');
    fireEvent.change(keyInput, { target: { value: 'custom/key/hello.png' } });
    
    const uploadButton = screen.getByText('Upload');
    expect(uploadButton).not.toBeDisabled();
    
    fireEvent.click(uploadButton);
    expect(mockOnUpload).toHaveBeenCalledWith(file, 'custom/key/hello.png');
  });

  it('renders progress bar if progress is provided', () => {
    const { container } = render(
      <UploadModal isOpen={true} onClose={mockOnClose} onUpload={mockOnUpload} progress={50} />
    );
    
    const progressBar = container.querySelector('.progress-fill');
    expect(progressBar).toHaveStyle('width: 50%');
  });

  it('renders error message if provided', () => {
    render(
      <UploadModal isOpen={true} onClose={mockOnClose} onUpload={mockOnUpload} error="Upload failed" />
    );
    expect(screen.getByText('Upload failed')).toBeInTheDocument();
  });
});
