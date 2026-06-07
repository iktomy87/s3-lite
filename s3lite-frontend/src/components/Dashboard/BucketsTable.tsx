import React from 'react';
import './CSS/BucketsTable.css';

export const BucketsTable: React.FC = () => {
  return (
    <div className="file-scroll">
      <table className="file-table" id="fileTable">
        <thead>
          <tr>
            <th className="sortable">Name <span className="th-arrow"><svg width="10" height="10" fill="none" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9" stroke="currentColor" strokeWidth="2" /></svg></span></th>
            <th>Sharing</th>
            <th className="sortable">Size <span className="th-arrow"><svg width="10" height="10" fill="none" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9" stroke="currentColor" strokeWidth="2" /></svg></span></th>
            <th className="sortable">Modified <span className="th-arrow"><svg width="10" height="10" fill="none" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9" stroke="currentColor" strokeWidth="2" /></svg></span></th>
            <th></th>
          </tr>
        </thead>
        <tbody id="fileBody">
          <tr>
            <td colSpan={5} className="text-center p-10 text-[var(--text3)] text-[13px]">
              Enter a bucket name in the sidebar to explore
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default BucketsTable;