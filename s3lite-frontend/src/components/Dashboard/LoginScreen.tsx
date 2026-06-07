import React, { useState } from 'react';
import './CSS/LoginScreen.css';
import './CSS/BucketModal.css'; // For form-field, form-label, etc.

interface LoginScreenProps {
  onLogin: (user: string, pass: string) => void;
  error?: string | null;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, error }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="login-screen" id="loginScreen">
      <div className="login-card">
        <div className="login-logo-row">
          <div className="login-logo">
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
              <ellipse cx="12" cy="5" rx="9" ry="3" stroke="#fff" strokeWidth="1.8" />
              <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" stroke="#fff" strokeWidth="1.8" />
              <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" stroke="#fff" strokeWidth="1.8" />
            </svg>
          </div>
          <div className="login-title">S3-Lite</div>
          <div className="login-sub">object storage v2.0.0</div>
        </div>
        {error && <div id="loginError" className="form-error">{error}</div>}
        <div>
          <div className="form-field">
            <label className="form-label">Username</label>
            <input 
              className="form-input" 
              id="loginUser" 
              type="text" 
              placeholder="username" 
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="form-field" style={{ marginBottom: 0 }}>
            <label className="form-label">Password</label>
            <input 
              className="form-input" 
              id="loginPass" 
              type="password" 
              placeholder="••••••••" 
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>
        <button 
          className="login-btn" 
          id="loginBtn" 
          onClick={() => onLogin(username, password)}
        >
          Sign in
        </button>
      </div>
    </div>
  );
};

export default LoginScreen;
