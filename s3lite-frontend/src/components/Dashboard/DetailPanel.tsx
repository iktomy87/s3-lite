

<aside class="detail-panel" id="detailPanel">
  <div class="dp-header">
    <div class="dp-top">
      <div class="dp-file-icon" id="dpIcon">
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" stroke="#4169e1" stroke-width="1.6" /><polyline points="13 2 13 9 20 9" stroke="#4169e1" stroke-width="1.6" /></svg>
      </div>
      <button class="dp-close" onclick="closeDetail()">
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18" stroke="#9ba0b0" stroke-width="1.8" /><line x1="6" y1="6" x2="18" y2="18" stroke="#9ba0b0" stroke-width="1.8" /></svg>
      </button>
    </div>
    <div class="dp-name" id="dpName">—</div>
    <div class="dp-meta" id="dpMeta">—</div>
  </div>
  <div class="dp-section">
    <div class="dp-row"><span class="dp-label">Tags</span><span class="dp-link">Edit</span></div>
    <div class="dp-tags"><span class="dp-tag">Work</span><span class="dp-tag">Source</span></div>
  </div>
  <div class="dp-section">
    <div class="dp-row"><span class="dp-label">Sharing</span><span class="dp-link">Manage</span></div>
    <div class="avatar-stack">
      <div class="av-circle" style="background:#4169e1;">A</div>
      <div class="av-circle" style="background:#f59e0b;">B</div>
      <div class="av-circle" style="background:#10b981;">C</div>
      <div class="av-circle av-extra">+3</div>
    </div>
  </div>
  <div class="dp-tabs">
    <button class="dp-tab active" onclick="setDpTab(this,'activity')">Activity</button>
    <button class="dp-tab" onclick="setDpTab(this,'comments')">Comments</button>
    <button class="dp-tab" onclick="setDpTab(this,'versions')">Versions</button>
  </div>
  <div class="dp-body" id="dpBody">
    <div class="activity-group-title">Yesterday</div>
    <div class="activity-item">
      <div class="activity-dot"></div>
      <div>
        <div class="activity-text">You uploaded this object</div>
        <div class="activity-sub">Version <span id="dpVersion">1</span></div>
      </div>
    </div>
    <div class="activity-item">
      <div class="activity-dot"></div>
      <div>
        <div class="activity-text">Object created</div>
        <div class="activity-sub" id="dpMimeType">application/octet-stream</div>
      </div>
    </div>
  </div>
  <div class="dp-footer">
    <button class="btn-primary" onclick="downloadSelected()">
      <svg width="13" height="13" fill="none" viewBox="0 0 24 24"><polyline points="8 17 12 21 16 17" stroke="#fff" stroke-width="1.8" /><line x1="12" y1="12" x2="12" y2="21" stroke="#fff" stroke-width="1.8" /><path d="M20.88 18.09A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.29" stroke="#fff" stroke-width="1.8" /></svg>
      Download
    </button>
    <button class="btn-danger" onclick="deleteSelected()" title="Delete">
      <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6" stroke="currentColor" stroke-width="1.7" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" stroke="currentColor" stroke-width="1.7" /><path d="M10 11v6M14 11v6" stroke="currentColor" stroke-width="1.7" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" stroke="currentColor" stroke-width="1.7" /></svg>
    </button>
  </div>
</aside>
      </div >
    </div >< !-- /main -->
  </div >< !-- /app-frame -->
</div >< !-- /shell -->