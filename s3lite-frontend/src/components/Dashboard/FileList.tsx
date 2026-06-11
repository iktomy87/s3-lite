import React from 'react';
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
    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        onFilter(val);
        onFilter(val);
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
                    <input className="filter-input" type="text" placeholder="Filter…" id="localFilter" onChange={handleFilterChange} />
                </div>
                <button className="icon-btn" onClick={onRefresh} aria-label="Refresh">
                    <svg width="13" height="13" fill="none" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10" stroke="#5c6072" strokeWidth="1.8" /><polyline points="1 20 1 14 7 14" stroke="#5c6072" strokeWidth="1.8" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" stroke="#5c6072" strokeWidth="1.8" /></svg>
                </button>
            </div>
        </div>

    );
};

export default FileList;