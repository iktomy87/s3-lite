import React from 'react';
import { render, screen } from '@testing-library/react';
import ToastContainer from './ToastContainer';

describe('ToastContainer Component', () => {
  it('renders a list of toasts', () => {
    const toasts = [
      { id: '1', message: 'Success message', type: 'success' as const },
      { id: '2', message: 'Error message', type: 'error' as const },
      { id: '3', message: 'Info message' }
    ];

    render(<ToastContainer toasts={toasts} />);
    
    expect(screen.getByText('Success message')).toBeInTheDocument();
    expect(screen.getByText('Error message')).toBeInTheDocument();
    expect(screen.getByText('Info message')).toBeInTheDocument();
  });

  it('applies error class to error toasts', () => {
    const toasts = [
      { id: '1', message: 'Error message', type: 'error' as const },
    ];

    render(<ToastContainer toasts={toasts} />);
    
    const errorToast = screen.getByText('Error message');
    expect(errorToast).toHaveClass('error');
  });

  it('renders nothing inside container when toasts array is empty', () => {
    render(<ToastContainer toasts={[]} />);
    const toastContainer = screen.getByTestId('toast-container');
    expect(toastContainer).toBeEmptyDOMElement();
  });
});
