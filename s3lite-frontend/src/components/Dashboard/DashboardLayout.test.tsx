import React from 'react';
import { render, screen } from '@testing-library/react';
import DashboardLayout from './DashboardLayout';

describe('DashboardLayout Component', () => {
  it('renders all provided slots', () => {
    render(
      <DashboardLayout
        sidebar={<div data-testid="sidebar-slot">Sidebar</div>}
        topbar={<div data-testid="topbar-slot">Topbar</div>}
        fileBrowser={<div data-testid="file-browser-slot">File Browser</div>}
        detailPanel={<div data-testid="detail-panel-slot">Detail Panel</div>}
        modals={<div data-testid="modals-slot">Modals</div>}
        toasts={<div data-testid="toasts-slot">Toasts</div>}
      />
    );

    expect(screen.getByTestId('sidebar-slot')).toBeInTheDocument();
    expect(screen.getByTestId('topbar-slot')).toBeInTheDocument();
    expect(screen.getByTestId('file-browser-slot')).toBeInTheDocument();
    expect(screen.getByTestId('detail-panel-slot')).toBeInTheDocument();
    expect(screen.getByTestId('modals-slot')).toBeInTheDocument();
    expect(screen.getByTestId('toasts-slot')).toBeInTheDocument();
  });

  it('renders correctly without optional slots', () => {
    render(
      <DashboardLayout
        sidebar={<div data-testid="sidebar-slot">Sidebar</div>}
        topbar={<div data-testid="topbar-slot">Topbar</div>}
        fileBrowser={<div data-testid="file-browser-slot">File Browser</div>}
      />
    );

    expect(screen.getByTestId('sidebar-slot')).toBeInTheDocument();
    expect(screen.getByTestId('topbar-slot')).toBeInTheDocument();
    expect(screen.getByTestId('file-browser-slot')).toBeInTheDocument();
    expect(screen.queryByTestId('detail-panel-slot')).toBeNull();
  });
});
