import React, { useRef, useState } from 'react';
import './CSS/UploadModal.css';
// Imports generic modal styles from BucketModal.css or index
import './CSS/BucketModal.css';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File, key: string) => void;
  bucketLabel?: string;
  error?: string | null;
  progress?: number;
}

export const UploadModal: React.FC<UploadModalProps> = ({ 
  isOpen, onClose, onUpload, bucketLabel, error, progress 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [objectKey, setObjectKey] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  return (
    <div className={`modal-backdrop ${isOpen ? 'show' : ''}`} id="uploadModal">
      <div className="modal" style={{ width: '420px' }}>
        <div className="modal-title">
          Upload object <span className="text-[13px] text-[var(--accent)] font-normal ml-1">{bucketLabel}</span>
        </div>
        {error && <div className="form-error" id="upError">{error}</div>}
        
        <div 
          className={`drop-zone ${selectedFile ? 'has-file' : ''}`} 
          id="dropZone" 
          onClick={() => fileInputRef.current?.click()}
        >
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" className="block mx-auto">
            <polyline points="16 16 12 12 8 16" stroke="#9ba0b0" strokeWidth="1.8" />
            <line x1="12" y1="12" x2="12" y2="21" stroke="#9ba0b0" strokeWidth="1.8" />
            <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" stroke="#9ba0b0" strokeWidth="1.8" />
          </svg>
          <div className="drop-zone-text" id="dropZoneText">
            {selectedFile ? selectedFile.name : 'Click to choose a file'}
          </div>
        </div>
        <input 
          type="file" 
          id="fileInput" 
          className="hidden" 
          ref={fileInputRef}
          onChange={handleFileChange} 
        />
        
        {progress !== undefined && (
          <div id="progressWrap" className="mb-3">
            <div className="progress-bar"><div className="progress-fill" style={{ width: `${progress}%` }}></div></div>
          </div>
        )}
        
        <div className="form-field">
          <label className="form-label">Object key (path)</label>
          <input 
            className="form-input" 
            id="upKey" 
            type="text" 
            placeholder="e.g. builds/2024/artifact.zip" 
            value={objectKey}
            onChange={(e) => setObjectKey(e.target.value)}
          />
        </div>
        
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button 
            className="btn-confirm" 
            id="upBtn" 
            onClick={() => selectedFile && onUpload(selectedFile, objectKey)}
            disabled={!selectedFile}
          >
            Upload
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
