import React from 'react';
import './CSS/BucketsTable.css';

interface Bucket {
  id: string;
  name: string;
  createdAt: string;
}

interface BucketsTableProps {
  buckets: Bucket[];
  onBucketClick: (name: string) => void;
}

export const BucketsTable: React.FC<BucketsTableProps> = ({ buckets, onBucketClick }) => {
  return (
    <div className="file-scroll">
      <table className="file-table" id="fileTable">
        <thead>
          <tr>
            <th className="sortable">Name <span className="th-arrow"><svg width="10" height="10" fill="none" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9" stroke="currentColor" strokeWidth="2" /></svg></span></th>
            <th>Owner</th>
            <th className="sortable">Created At <span className="th-arrow"><svg width="10" height="10" fill="none" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9" stroke="currentColor" strokeWidth="2" /></svg></span></th>
            <th></th>
          </tr>
        </thead>
        <tbody id="fileBody">
          {buckets.length === 0 ? (
            <tr>
              <td colSpan={4} className="text-center p-10 text-[var(--text3)] text-[13px]" style={{ textAlign: 'center', padding: '20px', color: '#9ba0b0' }}>
                You don't have any buckets yet. Create one!
              </td>
            </tr>
          ) : (
            buckets.map(b => (
              <tr key={b.id} onClick={() => onBucketClick(b.name)} style={{ cursor: 'pointer' }}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#ff8400" strokeWidth="2">
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                    </svg>
                    {b.name}
                  </div>
                </td>
                <td>Me</td>
                <td>{new Date(b.createdAt).toLocaleDateString()}</td>
                <td></td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default BucketsTable;