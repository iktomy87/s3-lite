import React from 'react';
import './CSS/BucketModal.css';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  targetKey?: string;
  error?: string | null;
}

export const DeleteModal: React.FC<DeleteModalProps> = ({ isOpen, onClose, onConfirm, targetKey, error }) => {
  if (!isOpen) return null;

  return (
    <div className={`modal-backdrop ${isOpen ? 'show' : ''}`} id="deleteModal">
      <div className="modal" style={{ width: '360px' }}>
        <div className="modal-title">Delete object</div>
        <p className="text-[13px] text-[var(--text2)] leading-relaxed mb-3.5">
          This will soft-delete the object and it won't appear in normal listings.
        </p>
        <div className="font-mono text-xs text-[var(--danger)] bg-[#fef2f2] px-3 py-2 rounded-[var(--r)] mb-4 break-all">
          {targetKey || '—'}
        </div>
        {error && <div className="form-error" id="delError">{error}</div>}
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-delete-confirm" id="delBtn" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
