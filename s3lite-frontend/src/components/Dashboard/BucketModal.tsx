import React from 'react';
import './CSS/BucketModal.css';

interface BucketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
  error?: string | null;
}

export const BucketModal: React.FC<BucketModalProps> = ({ isOpen, onClose, onCreate, error }) => {
  const [bucketName, setBucketName] = React.useState('');

  if (!isOpen) return null;

  return (
    <div className={`modal-backdrop ${isOpen ? 'show' : ''}`} id="createBucketModal">
      <div className="modal" style={{ width: '380px' }}>
        <div className="modal-title">Create new bucket</div>
        {error && <div className="form-error" id="cbError">{error}</div>}
        <div className="form-field">
          <label className="form-label">Bucket name</label>
          <input 
            className="form-input" 
            id="cbName" 
            type="text" 
            placeholder="e.g. ci-artifacts" 
            maxLength={255} 
            value={bucketName}
            onChange={(e) => setBucketName(e.target.value)}
          />
          <span className="form-hint">Globally unique · max 255 characters</span>
        </div>
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-confirm" id="cbBtn" onClick={() => onCreate(bucketName)}>Create</button>
        </div>
      </div>
    </div>
  );
};

export default BucketModal;
