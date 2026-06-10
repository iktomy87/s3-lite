import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DetailPanel } from './DetailPanel';

describe('DetailPanel Component', () => {
  const mockOnTabChange = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with given tab', () => {
    render(
      <DetailPanel activeTab="activity" onTabChange={mockOnTabChange} onClose={mockOnClose} />
    );
    
    expect(screen.getByText('Activity')).toBeInTheDocument();
    expect(screen.getByText('Comments')).toBeInTheDocument();
    expect(screen.getByText('Versions')).toBeInTheDocument();
    
    const activityTab = screen.getByText('Activity');
    expect(activityTab).toHaveClass('active');
  });

  it('calls onTabChange when a tab is clicked', () => {
    render(
      <DetailPanel activeTab="activity" onTabChange={mockOnTabChange} onClose={mockOnClose} />
    );
    
    fireEvent.click(screen.getByText('Comments'));
    expect(mockOnTabChange).toHaveBeenCalledWith('comments');
    
    fireEvent.click(screen.getByText('Versions'));
    expect(mockOnTabChange).toHaveBeenCalledWith('versions');
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <DetailPanel activeTab="activity" onTabChange={mockOnTabChange} onClose={mockOnClose} />
    );
    
    const closeBtn = screen.getByRole('button', { name: /close panel/i });
    fireEvent.click(closeBtn);
    expect(mockOnClose).toHaveBeenCalled();
  });
});
