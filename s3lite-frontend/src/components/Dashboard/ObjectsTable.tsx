import React from 'react';
import './CSS/BucketsTable.css'; // Reusing the same styles as buckets table

interface S3Object {
  key: string;
  versionId: number;
  sizeInBytes: number;
  mimeType: string;
  isLatest: boolean;
  deleted: boolean;
  createdAt: string;
}

interface ObjectsTableProps {
  objects: S3Object[];
  onObjectClick: (key: string) => void;
  onObjectDownload: (key: string) => void;
  onObjectDelete: (key: string) => void;
}

const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const ObjectsTable: React.FC<ObjectsTableProps> = ({ objects, onObjectClick, onObjectDownload, onObjectDelete }) => {
  return (
    <div className="file-scroll">
      <table className="file-table" id="fileTable">
        <thead>
          <tr>
            <th className="sortable">Name <span className="th-arrow"><svg width="10" height="10" fill="none" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9" stroke="currentColor" strokeWidth="2" /></svg></span></th>
            <th>Type</th>
            <th>Size</th>
            <th className="sortable">Last Modified <span className="th-arrow"><svg width="10" height="10" fill="none" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9" stroke="currentColor" strokeWidth="2" /></svg></span></th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="fileBody">
          {objects.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center p-10 text-[var(--text3)] text-[13px]" style={{ textAlign: 'center', padding: '20px', color: '#9ba0b0' }}>
                This bucket is empty. Upload something!
              </td>
            </tr>
          ) : (
            objects.map(obj => (
              <tr key={`${obj.key}-${obj.versionId}`} onClick={() => onObjectClick(obj.key)} style={{ cursor: 'pointer' }}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#6b7280" strokeWidth="2">
                      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                      <polyline points="13 2 13 9 20 9" />
                    </svg>
                    {obj.key}
                  </div>
                </td>
                <td>{obj.mimeType}</td>
                <td>{formatBytes(obj.sizeInBytes)}</td>
                <td>{new Date(obj.createdAt).toLocaleString()}</td>
                <td onClick={(e) => e.stopPropagation()}>
                    <button className="icon-btn" onClick={() => onObjectDownload(obj.key)} title="Download">
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    </button>
                    <button className="icon-btn" onClick={() => onObjectDelete(obj.key)} title="Delete" style={{ marginLeft: '8px' }}>
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#e02b2b" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                    </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ObjectsTable;
