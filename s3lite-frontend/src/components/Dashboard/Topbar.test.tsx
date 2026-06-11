import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Topbar } from './Topbar';

describe('Topbar Component', () => {
  const mockOnFiles = jest.fn();
  const mockOnActivities = jest.fn();
  const mockOnSearch = jest.fn();
  const mockOnRefresh = jest.fn();
  const mockOnUpload = jest.fn();
  const mockOnCreateBucket = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders buttons and search input', () => {
    render(
      <Topbar
        onFiles={mockOnFiles}
        onActivities={mockOnActivities}
        onSearch={mockOnSearch}
        onRefresh={mockOnRefresh}
        onUpload={mockOnUpload}
        onCreateBucket={mockOnCreateBucket}
      />
    );
    expect(screen.getByText('Files')).toBeInTheDocument();
    expect(screen.getByText('Activity')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search anything…')).toBeInTheDocument();
    expect(screen.getByText('Add New')).toBeInTheDocument();
  });

  it('calls tab callbacks and sets active tab', () => {
    render(
      <Topbar
        onFiles={mockOnFiles}
        onActivities={mockOnActivities}
        onSearch={mockOnSearch}
        onRefresh={mockOnRefresh}
        onUpload={mockOnUpload}
        onCreateBucket={mockOnCreateBucket}
      />
    );
    
    const activityTab = screen.getByRole('button', { name: /activity/i });
    fireEvent.click(activityTab);
    expect(mockOnActivities).toHaveBeenCalled();
    expect(activityTab).toHaveClass('active');
    
    const filesTab = screen.getByRole('button', { name: /files/i });
    fireEvent.click(filesTab);
    expect(mockOnFiles).toHaveBeenCalled();
    expect(filesTab).toHaveClass('active');
  });

  it('calls onSearch when enter is pressed', () => {
    render(
      <Topbar
        onFiles={mockOnFiles}
        onActivities={mockOnActivities}
        onSearch={mockOnSearch}
        onRefresh={mockOnRefresh}
        onUpload={mockOnUpload}
        onCreateBucket={mockOnCreateBucket}
      />
    );
    
    const searchInput = screen.getByPlaceholderText('Search anything…');
    fireEvent.change(searchInput, { target: { value: 'test-query' } });
    fireEvent.keyDown(searchInput, { key: 'Enter', code: 'Enter' });
    
    expect(mockOnSearch).toHaveBeenCalledWith('test-query');
  });

  it('shows upload button when showUpload is true and calls onUpload', () => {
    render(
      <Topbar
        onFiles={mockOnFiles}
        onActivities={mockOnActivities}
        onSearch={mockOnSearch}
        onRefresh={mockOnRefresh}
        onUpload={mockOnUpload}
        onCreateBucket={mockOnCreateBucket}
        showUpload={true}
      />
    );
    
    const uploadBtn = screen.getByText('Upload');
    expect(uploadBtn).toBeVisible();
    
    fireEvent.click(uploadBtn);
    expect(mockOnUpload).toHaveBeenCalled();
  });
  
  it('calls onCreateBucket and onRefresh when clicked', () => {
    render(
      <Topbar
        onFiles={mockOnFiles}
        onActivities={mockOnActivities}
        onSearch={mockOnSearch}
        onRefresh={mockOnRefresh}
        onUpload={mockOnUpload}
        onCreateBucket={mockOnCreateBucket}
      />
    );
    
    fireEvent.click(screen.getByText('Add New'));
    expect(mockOnCreateBucket).toHaveBeenCalled();
    
    const refreshBtn = screen.getByTitle('Refresh');
    fireEvent.click(refreshBtn);
    expect(mockOnRefresh).toHaveBeenCalled();
  });
});
