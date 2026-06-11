import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the login page on the root route', () => {
  render(<App />);
  // The Login page should be rendered at the default "/" route
  expect(screen.getByText(/Welcome to S3-Lite/i)).toBeInTheDocument();
});
