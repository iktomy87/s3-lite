import React, { useState } from 'react';
import './CSS/Topbar.css';

type BarOptions = 'files' | 'activities';

interface TopBarProps {
  onFiles: () => void;
  onActivities: () => void;
  onSearch: (q: string) => void;
  onRefresh: () => void;
  onUpload: () => void;
  onCreateBucket: () => void;
  showUpload?: boolean;
}

export const Topbar: React.FC<TopBarProps> = ({
  onFiles,
  onActivities,
  onSearch,
  onRefresh,
  onUpload,
  onCreateBucket,
  showUpload = false,
}) => {
  // TODO: ver donde usar las tabs?
  const [activeTab, setActiveTab] = useState<BarOptions>('files');
  const [searchQuery, setSearchQuery] = useState('');



  return (
    <header className="topbar">
      <div className="topbar-tabs">
        <button
          className={`tab-btn ${activeTab === 'files' ? 'active' : ''}`}
          onClick={() => { setActiveTab('files'); onFiles(); }}
        >
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
            <path d="M5 19a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="1.6" />
            <path d="M3 17l3-7h16l-3 7H3z" stroke="currentColor" strokeWidth="1.6" />
          </svg>
          Files
        </button>
        <button
          className={`tab-btn ${activeTab === 'activities' ? 'active' : ''}`}
          onClick={() => { setActiveTab('activities'); onActivities(); }}
        >
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.6" />
            <polyline points="12 6 12 12 16 14" stroke="currentColor" strokeWidth="1.6" />
          </svg>
          Activity
        </button>
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      <div className="search-wrap">
        <svg width="13" height="13" fill="none" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8" stroke="#9ba0b0" strokeWidth="1.8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="#9ba0b0" strokeWidth="1.8" />
        </svg>
        <input
          type="text"
          placeholder="Search anything…"
          id="globalSearch"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSearch(searchQuery)}
        />
      </div>

      <button className="icon-btn" onClick={onRefresh} title="Refresh">
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
          <polyline points="23 4 23 10 17 10" stroke="#5c6072" strokeWidth="1.8" />
          <polyline points="1 20 1 14 7 14" stroke="#5c6072" strokeWidth="1.8" />
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" stroke="#5c6072" strokeWidth="1.8" />
        </svg>
      </button>

      <button className="btn-upload" id="uploadBtn" style={{ display: showUpload ? 'flex' : 'none' }} onClick={onUpload}>
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
          <polyline points="16 16 12 12 8 16" stroke="currentColor" strokeWidth="1.8" />
          <line x1="12" y1="12" x2="12" y2="21" stroke="currentColor" strokeWidth="1.8" />
          <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" stroke="currentColor" strokeWidth="1.8" />
        </svg>
        Upload
      </button>

      <button className="btn-primary" onClick={onCreateBucket}>
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
          <line x1="12" y1="5" x2="12" y2="19" stroke="#fff" strokeWidth="2" />
          <line x1="5" y1="12" x2="19" y2="12" stroke="#fff" strokeWidth="2" />
        </svg>
        Add New
      </button>
    </header>
  );
};


export default Topbar;
