import React, { useState } from 'react';

type DetailPanelOptions = 'activity' | 'comments' | 'versions';

interface DetailPanelProps {
  activeTab: DetailPanelOptions;
  onTabChange: (tab: DetailPanelOptions) => void;
  onClose: () => void;
}

export const DetailPanel: React.FC<DetailPanelProps> = ({
  activeTab,
  onTabChange,
  onClose,
}) => {
  // TODO: revisar si no hay que declarar algunas variables antes 

  return (
    <aside className="detail-panel" id="detailPanel">
      <div className="dp-header">
        <div className="dp-top">
          <div className="dp-file-icon" id="dpIcon">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" stroke="#4169e1" strokeWidth="1.6" /><polyline points="13 2 13 9 20 9" stroke="#4169e1" strokeWidth="1.6" /></svg>
          </div>
          <button className="dp-close" onClick={onClose}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18" stroke="#9ba0b0" strokeWidth="1.8" /><line x1="6" y1="6" x2="18" y2="18" stroke="#9ba0b0" strokeWidth="1.8" /></svg>
          </button>
        </div>
        <div className="dp-name" id="dpName">—</div>
        <div className="dp-meta" id="dpMeta">—</div>
      </div>
      <div className="dp-section">
        <div className="dp-row"><span className="dp-label">Tags</span><span className="dp-link">Edit</span></div>
        <div className="dp-tags"><span className="dp-tag">Work</span><span className="dp-tag">Source</span></div>
      </div>
      <div className="dp-section">
        <div className="dp-row"><span className="dp-label">Sharing</span><span className="dp-link">Manage</span></div>
        <div className="avatar-stack">
          <div className="av-circle bg-blue-600">A</div>
          <div className="av-circle bg-amber-500">B</div>
          <div className="av-circle bg-emerald-500">C</div>
          <div className="av-circle av-extra">+3</div>
        </div>
      </div>
      <div className="dp-tabs">
        <button className={`dp-tab ${activeTab === 'activity' ? 'active' : ''}`} onClick={() => onTabChange('activity')}>Activity</button>
        <button className={`dp-tab ${activeTab === 'comments' ? 'active' : ''}`} onClick={() => onTabChange('comments')}>Comments</button>
        <button className={`dp-tab ${activeTab === 'versions' ? 'active' : ''}`} onClick={() => onTabChange('versions')}>Versions</button>
      </div>
      <div className="dp-body" id="dpBody">
        <div className="activity-group-title">Yesterday</div>
        <div className="activity-item">
          <div className="activity-dot"></div>
          <div>
            <div className="activity-text">You uploaded this object</div>
            <div className="activity-sub">Version <span id="dpVersion">1</span></div>
          </div>
        </div>
        <div className="activity-item">
          <div className="activity-dot"></div>
          <div>
            <div className="activity-text">Object created</div>
            <div className="activity-sub" id="dpMimeType">application/octet-stream</div>
          </div>
        </div>
      </div>
      <div className="dp-footer">
        <button className="btn-primary" onClick={() => console.log('downloadSelected')}>
          <svg width="13" height="13" fill="none" viewBox="0 0 24 24"><polyline points="8 17 12 21 16 17" stroke="#fff" strokeWidth="1.8" /><line x1="12" y1="12" x2="12" y2="21" stroke="#fff" strokeWidth="1.8" /><path d="M20.88 18.09A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.29" stroke="#fff" strokeWidth="1.8" /></svg>
          Download
        </button>
        <button className="btn-danger" onClick={() => console.log('deleteSelected')} title="Delete">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="1.7" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" stroke="currentColor" strokeWidth="1.7" /><path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="1.7" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" stroke="currentColor" strokeWidth="1.7" /></svg>
        </button>
      </div>
    </aside>
  );
};

export default DetailPanel;