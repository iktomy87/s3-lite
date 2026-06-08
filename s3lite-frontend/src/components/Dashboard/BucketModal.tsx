import React, { useEffect, useState } from 'react';
import './CSS/BucketModal.css';

interface BucketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
  error?: string | null;
}

export const BucketModal: React.FC<BucketModalProps> = ({ isOpen, onClose, onCreate, error }) => {
  const [bucketName, setBucketName] = React.useState('');
  // 'visible' tracks whether we're mounted; 'show' drives the CSS transition
  const [mounted, setMounted] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      // One tick later so CSS transition fires after mount
      requestAnimationFrame(() => setShow(true));
    } else {
      setShow(false);
      // Wait for the transition to finish before unmounting (matches CSS 0.22s)
      const timer = setTimeout(() => setMounted(false), 220);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!mounted) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className={`modal-backdrop ${show ? 'show' : ''}`}
      id="createBucketModal"
      onClick={handleBackdropClick}
    >
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
            onKeyDown={(e) => e.key === 'Enter' && onCreate(bucketName)}
            autoFocus
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
