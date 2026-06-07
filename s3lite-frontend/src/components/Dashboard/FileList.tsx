import React, { useState } from 'react';
import './CSS/FileList.css';

interface FileHeaderProps {
    onAllVersions: () => void;
    onFilter: (q: string) => void;
    onRefresh: () => void;
}

export const FileList: React.FC<FileHeaderProps> = ({
    onAllVersions,
    onFilter,
    onRefresh,
}) => {
    // TODO: ver si al final usamos esto o no
    const [filterQuery, setFilterQuery] = useState('');
    const [allVersions, setAllVersions] = useState(false);

    const handleFilterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onFilter(filterQuery);
    };

    return (
        <div className="file-header">
            <div className="breadcrumb" id="breadcrumb">
                <span>Home</span>
            </div>
            <div className="filter-row">
                <label className="filter-check">
                    <input type="checkbox" id="allVersionsCheck" onChange={onAllVersions} />
                    All versions
                </label>
                <div className="filter-input-wrap">
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" stroke="#9ba0b0" strokeWidth="1.8" /><line x1="21" y1="21" x2="16.65" y2="16.65" stroke="#9ba0b0" strokeWidth="1.8" /></svg>
                    <input className="filter-input" type="text" placeholder="Filter…" id="localFilter" onChange={handleFilterSubmit} />
                </div>
                <button className="icon-btn" onClick={onRefresh}>
                    <svg width="13" height="13" fill="none" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10" stroke="#5c6072" strokeWidth="1.8" /><polyline points="1 20 1 14 7 14" stroke="#5c6072" strokeWidth="1.8" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" stroke="#5c6072" strokeWidth="1.8" /></svg>
                </button>
            </div>
        </div>

    );
};

export default FileList;