import React, { useState } from 'react';
import './CSS/style.css';
import { Eye, EyeClosed } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiClient, setAuthToken } from '../../api';

export const RegisterForm: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await apiClient("/auth/register", {
        method: 'POST',
        data: {
          username,
          email,
          password,
          passwordConfirm,
        },
      });

      if (response && response.token) {
        setAuthToken(response.token);
        if (response.username) {
          import('../../api').then(m => m.setUsername(response.username));
        }
        navigate('/home');
      }
    } catch (err: any) {
      if (err.response) {
        setError(err.response.data.message || "Registration failed");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page" style={{ backgroundImage: `url("https://i.imgur.com/94XFAfQ.png")`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="rp-container">
        <div className="rp-left-panel">
          <div className="rp-brand-logo">
            <img src="https://i.imgur.com/BIJDQId.png" alt="Hero Illustration" style={{ width: '100%', paddingRight: '100px' }} />
          </div>
        </div>

        <div className="rp-right-panel">
          <div className="rp-card">
            <div className="rp-card-logo">
              <img src="https://i.imgur.com/06lxh6r.png" alt="S3 Lite Logo" style={{ width: '100px' }} />
            </div>

            <h2>Create an Account!</h2>
            <p className="rp-subtitle">Fill in the details to create your new account</p>

            {error && <div className="rp-error" style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

            <form onSubmit={handleRegister}>
              <div className="rp-input-group">
                <label className="rp-label" htmlFor="reg-username">USERNAME</label>
                <input
                  className="rp-input"
                  type="text"
                  id="reg-username"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="rp-input-group">
                <label className="rp-label" htmlFor="reg-email">EMAIL</label>
                <input
                  className="rp-input"
                  type="text"
                  id="reg-email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="rp-input-group">
                <div className="rp-password-labels">
                  <label className="rp-label" htmlFor="reg-password">PASSWORD</label>
                </div>
                <div className="rp-input-icon-wrapper">
                  <input
                    className="rp-input"
                    type={showPassword ? "text" : "password"}
                    id="reg-password"
                    placeholder="············"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <span
                    className="rp-eye-icon"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeClosed size={18} /> : <Eye size={18} />}
                  </span>
                </div>

                <div className="rp-input-group">
                  <div className="rp-password-labels">
                    <label className="rp-label" htmlFor="reg-password">CONFIRM PASSWORD</label>
                  </div>
                  <div className="rp-input-icon-wrapper">
                    <input
                      className="rp-input"
                      type={showPassword ? "text" : "password"}
                      id="reg-password"
                      placeholder="············"
                      value={passwordConfirm}
                      onChange={(e) => setPasswordConfirm(e.target.value)}
                      required
                    />
                    <span
                      className="rp-eye-icon"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ cursor: 'pointer' }}
                    >
                      {showPassword ? <EyeClosed size={18} /> : <Eye size={18} />}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rp-checkbox-group">
                <input type="checkbox" id="reg-terms" />
                <label className="rp-checkbox-label" htmlFor="reg-terms">I agree to the Terms & Privacy</label>
              </div>

              <button type="submit" className="rp-btn-primary" disabled={loading}>
                {loading ? 'Creating account...' : 'Sign up'}
              </button>
            </form>
            <p className="rp-login-text">
              Already have an account? <a href="/login">Sign in instead</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
