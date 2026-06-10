import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient, setAuthToken } from '../../api';
import './CSS/style.css';
import { Eye, EyeClosed } from 'lucide-react';

export const LoginForm: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await apiClient('/auth/login', {
        method: 'POST',
        data: { username, password }
      });

      if (response && response.token) {
        setAuthToken(response.token);
        if (response.username) {
          import('../../api').then(m => m.setUsername(response.username));
        }
        navigate('/home');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page" style={{ backgroundImage: `url("https://i.imgur.com/94XFAfQ.png")`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="lp-container">
        <div className="lp-left-panel">
          <div className="lp-brand-logo">
            <img src="https://i.imgur.com/BIJDQId.png" alt="Hero Illustration" style={{ width: '100%', paddingRight: '100px' }} />
          </div>
        </div>

        <div className="lp-right-panel">
          <div className="lp-card">
            <div className="lp-card-logo">
              <img src="https://i.imgur.com/06lxh6r.png" alt="S3 Lite Logo" style={{ width: '100px' }} />
            </div>

            <h2>Welcome to S3-Lite</h2>
            <p className="lp-subtitle">Please sign-in to your account and start the adventure</p>

            {error && <div className="lp-error" style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

            <form onSubmit={handleLogin}>
              <div className="lp-input-group">
                <label className="lp-label" htmlFor="username">EMAIL OR USERNAME</label>
                <input
                  className="lp-input"
                  type="text"
                  id="username"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="lp-input-group">
                <div className="lp-password-labels">
                  <label className="lp-label" htmlFor="password">PASSWORD</label>
                  <a href="/forgot" className="lp-forgot-link">Forgot Password?</a>
                </div>
                <div className="lp-input-icon-wrapper">
                  <input
                    className="lp-input"
                    type={showPassword ? "text" : "password"}
                    id="password"
                    placeholder="············"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <span
                    className="lp-eye-icon"
                    data-testid="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ cursor: 'pointer' }}
                  >
                    {showPassword ? <EyeClosed size={18} /> : <Eye size={18} />}
                  </span>
                </div>
              </div>

              <div className="lp-checkbox-group">
                <input type="checkbox" id="remember" />
                <label className="lp-checkbox-label" htmlFor="remember">Remember Me</label>
              </div>

              <button type="submit" className="lp-btn-primary" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <p className="lp-register-text">
              New on our platform? <a href="/register">Create an account</a>
            </p>

            <div className="lp-divider">
              <span>or</span>
            </div>

            <div className="lp-social-buttons">
              <button type="button" className="lp-btn-social lp-fb">f</button>
              <button type="button" className="lp-btn-social lp-gp">g+</button>
              <button type="button" className="lp-btn-social lp-tw">t</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
