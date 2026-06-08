import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import BucketsTable from '../components/Dashboard/BucketsTable';

describe('BucketsTable Component', () => {
  const mockBuckets = [
    { id: '1', name: 'bucket-1', createdAt: '2023-01-01T00:00:00.000Z' },
    { id: '2', name: 'bucket-2', createdAt: '2023-01-02T00:00:00.000Z' },
  ];
  const mockOnBucketClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders empty state when no buckets are provided', () => {
    render(<BucketsTable buckets={[]} onBucketClick={mockOnBucketClick} />);
    expect(screen.getByText("You don't have any buckets yet. Create one!")).toBeInTheDocument();
  });

  test('renders list of buckets correctly', () => {
    render(<BucketsTable buckets={mockBuckets} onBucketClick={mockOnBucketClick} />);
    expect(screen.getByText('bucket-1')).toBeInTheDocument();
    expect(screen.getByText('bucket-2')).toBeInTheDocument();
    expect(screen.getAllByText('Me')).toHaveLength(2);
    expect(screen.getByText(new Date('2023-01-01T00:00:00.000Z').toLocaleDateString())).toBeInTheDocument();
  });

  test('calls onBucketClick when a bucket row is clicked', () => {
    render(<BucketsTable buckets={mockBuckets} onBucketClick={mockOnBucketClick} />);
    const bucketRow = screen.getByText('bucket-1').closest('tr');
    fireEvent.click(bucketRow!);
    expect(mockOnBucketClick).toHaveBeenCalledWith('bucket-1');
  });
});
