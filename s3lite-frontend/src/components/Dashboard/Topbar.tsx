import React, { useState } from 'react';

type BarOptions = 'files' | 'activities';

interface TopBarProps {
  onFiles: () => void;
  onActivities: () => void;
  onSearch: (q: string) => void;
  onRefresh: () => void;
  onUpload: () => void;
  onCreateBucket: () => void;
}

export const Topbar: React.FC<TopBarProps> = ({
  // TODO: ver donde se llama onFiles y onActivities
  onFiles,
  onActivities,
  onSearch,
  onRefresh,
  onUpload,
  onCreateBucket,

}) => {
  // TODO: ver donde usar las tabs?
  const [activeTab, setActiveTab] = useState<BarOptions>('files');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <header className="topbar">
      <div className="topbar-tabs">
        <button className="tab-btn active">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M5 19a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v1" stroke="currentColor" stroke-width="1.6" /><path d="M3 17l3-7h16l-3 7H3z" stroke="currentColor" stroke-width="1.6" /></svg>
          Files
        </button>
        <button className="tab-btn">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.6" /><polyline points="12 6 12 12 16 14" stroke="currentColor" stroke-width="1.6" /></svg>
          Activity
        </button>
      </div>
      <div className="search-wrap">
        <svg width="13" height="13" fill="none" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" stroke="#9ba0b0" stroke-width="1.8" /><line x1="21" y1="21" x2="16.65" y2="16.65" stroke="#9ba0b0" stroke-width="1.8" /></svg>
        <input type="text" placeholder="Search anything…" id="globalSearch" onChange={handleSearchSubmit} />
      </div>
      <button className="icon-btn" onClick={onRefresh} title="Refresh">
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10" stroke="#5c6072" stroke-width="1.8" /><polyline points="1 20 1 14 7 14" stroke="#5c6072" stroke-width="1.8" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" stroke="#5c6072" stroke-width="1.8" /></svg>
      </button>
      <button className="btn-upload" id="uploadBtn" style={{ display: 'none' }} onClick={onUpload}>
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><polyline points="16 16 12 12 8 16" stroke="currentColor" stroke-width="1.8" /><line x1="12" y1="12" x2="12" y2="21" stroke="currentColor" stroke-width="1.8" /><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" stroke="currentColor" stroke-width="1.8" /></svg>
        Upload
      </button>
      <button className="btn-primary" onClick={onCreateBucket}>
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19" stroke="#fff" stroke-width="2" /><line x1="5" y1="12" x2="19" y2="12" stroke="#fff" stroke-width="2" /></svg>
        Add New
      </button>
    </header>
  );
};



