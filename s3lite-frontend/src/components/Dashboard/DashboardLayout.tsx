import React from 'react';
import './CSS/DashboardLayout.css';

interface DashboardLayoutProps {
  sidebar: React.ReactNode;
  topbar: React.ReactNode;
  fileBrowser: React.ReactNode;
  detailPanel?: React.ReactNode;
  modals?: React.ReactNode;
  toasts?: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  sidebar,
  topbar,
  fileBrowser,
  detailPanel,
  modals,
  toasts
}) => {
  return (
    <div className="shell">
      <div className="app-frame">
        {/* Sidebar */}
        {sidebar}
        
        {/* Main */}
        <div className="main">
          {/* Topbar */}
          {topbar}
          
          {/* Content */}
          <div className="content-area">
            {fileBrowser}
            {detailPanel}
          </div>
        </div>
      </div>
      
      {/* Global Overlays */}
      {modals}
      {toasts}
    </div>
  );
};

export default DashboardLayout;
