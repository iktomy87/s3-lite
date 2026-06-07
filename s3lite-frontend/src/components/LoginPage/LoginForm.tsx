import React, { useState } from 'react';
import './CSS/style.css';

export const LoginForm: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="login-page">
      <div className="lp-container">
        <div className="lp-left-panel">
          <h1>Impressive<br />React Login Page<br />Template</h1>
          <div className="lp-brand-logo">
            <span className="lp-theme">THEME</span><span className="lp-selection">SELECTION</span>
          </div>
        </div>

        <div className="lp-right-panel">
          <div className="lp-card">
            <div className="lp-card-logo">
              <div className="lp-logo-icon"></div>
              <span className="lp-logo-text">sneat</span>
            </div>

            <h2>Welcome to Sneat! 👋</h2>
            <p className="lp-subtitle">Please sign-in to your account and start the adventure</p>

            <form onSubmit={(e) => e.preventDefault()}>
              <div className="lp-input-group">
                <label className="lp-label" htmlFor="email">EMAIL OR USERNAME</label>
                <input className="lp-input" type="text" id="email" placeholder="Enter your email or username" />
              </div>

              <div className="lp-input-group">
                <div className="lp-password-labels">
                  <label className="lp-label" htmlFor="password">PASSWORD</label>
                  <a href="#" className="lp-forgot-link">Forgot Password?</a>
                </div>
                <div className="lp-input-icon-wrapper">
                  <input
                    className="lp-input"
                    type={showPassword ? "text" : "password"}
                    id="password"
                    placeholder="············"
                  />
                  <span
                    className="lp-eye-icon"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    👁️
                  </span>
                </div>
              </div>

              <div className="lp-checkbox-group">
                <input type="checkbox" id="remember" />
                <label className="lp-checkbox-label" htmlFor="remember">Remember Me</label>
              </div>

              <button type="submit" className="lp-btn-primary">Sign in</button>
            </form>

            <p className="lp-register-text">
              New on our platform? <a href="#">Create an account</a>
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
