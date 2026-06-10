import React, { useState } from 'react';
import './CSS/Sidebar.css';

type NavTab = 'all' | 'recent' | 'fav' | 'shared' | 'tags';

interface SidebarProps {
  userName?: string;
  storageUsedGB?: number;
  storageTotalGB?: number;
  onExploreBucket?: (bucketName: string) => void;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  userName = 'Usuario',
  storageUsedGB = 0,
  storageTotalGB = 256,
  onExploreBucket,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<NavTab>('all');
  const [bucketQuery, setBucketQuery] = useState('');

  const storagePercentage = Math.min((storageUsedGB / storageTotalGB) * 100, 100);
  const userInitial = userName.charAt(0).toUpperCase();

  const handleBucketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onExploreBucket && bucketQuery.trim() !== '') {
      onExploreBucket(bucketQuery);
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div>
          <div className="logo-name">
            <img src="https://i.imgur.com/06lxh6r.png" alt="S3 Lite Logo" style={{ width: '100px' }} />
          </div>
        </div>
      </div>

      <form className="bucket-form" onSubmit={handleBucketSubmit}>
        <input
          id="bucketInput"
          type="text"
          placeholder="Bucket name…"
          value={bucketQuery}
          onChange={(e) => setBucketQuery(e.target.value)}
        />
        <button type="submit" aria-label="Explore bucket">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
            <polyline points="9 18 15 12 9 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </form>

      <nav className="nav">
        <button className={`nav-item ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
          <span className="nav-icon">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
              <path d="M5 19a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="1.6" />
              <path d="M3 17l3-7h16l-3 7H3z" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          </span>
          All Files
          <span className="nav-arrow">
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24">
              <polyline points="6 9 12 15 18 9" stroke="currentColor" strokeWidth="1.8" />
            </svg>
          </span>
        </button>

        <button className={`nav-item ${activeTab === 'recent' ? 'active' : ''}`} onClick={() => setActiveTab('recent')}>
          <span className="nav-icon">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.6" />
              <polyline points="12 6 12 12 16 14" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          </span>
          Recent
        </button>

        <button className={`nav-item ${activeTab === 'fav' ? 'active' : ''}`} onClick={() => setActiveTab('fav')}>
          <span className="nav-icon">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          </span>
          Favorites
        </button>

        <button className={`nav-item ${activeTab === 'shared' ? 'active' : ''}`} onClick={() => setActiveTab('shared')}>
          <span className="nav-icon">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
              <circle cx="18" cy="5" r="3" stroke="currentColor" strokeWidth="1.6" />
              <circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
              <circle cx="18" cy="19" r="3" stroke="currentColor" strokeWidth="1.6" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" stroke="currentColor" strokeWidth="1.6" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          </span>
          Shared
        </button>

        <button className={`nav-item ${activeTab === 'tags' ? 'active' : ''}`} onClick={() => setActiveTab('tags')}>
          <span className="nav-icon">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" stroke="currentColor" strokeWidth="1.6" />
              <circle cx="7" cy="7" r="1" fill="currentColor" />
            </svg>
          </span>
          Tags
        </button>
      </nav>

      <div className="sidebar-footer">
        <button className="footer-link">
          <svg width="15" height="15" fill="none" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="3" stroke="#9ba0b0" strokeWidth="1.6" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="#9ba0b0" strokeWidth="1.6" />
          </svg>
          Settings
        </button>

        <button className="footer-link">
          <svg width="15" height="15" fill="none" viewBox="0 0 24 24">
            <polyline points="3 6 5 6 21 6" stroke="#9ba0b0" strokeWidth="1.6" />
            <path d="M19 6l-1 14H6L5 6" stroke="#9ba0b0" strokeWidth="1.6" />
            <path d="M9 6V4h6v2" stroke="#9ba0b0" strokeWidth="1.6" />
          </svg>
          Deleted Files
        </button>

        <div className="storage-widget">
          <div className="storage-header">
            <span className="storage-label">Storage</span>
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24">
              <polyline points="9 18 15 12 9 6" stroke="#9ba0b0" strokeWidth="1.8" />
            </svg>
          </div>
          <div className="storage-bar">
            <div
              className="storage-fill"
              id="storageBar"
              style={{ width: `${storagePercentage}%` }}
            ></div>
          </div>
          <div className="storage-sub" id="storageSub">
            {storageUsedGB} GB used from {storageTotalGB} GB
          </div>
        </div>

        <div className="user-row">
          <div className="user-avatar" id="userAvatar">{userInitial}</div>
          <div className="user-name" id="userName">{userName}</div>
          <button className="logout-btn" onClick={onLogout} title="Sign out">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18" stroke="#9ba0b0" strokeWidth="1.6" />
              <line x1="6" y1="6" x2="18" y2="18" stroke="#9ba0b0" strokeWidth="1.6" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
};