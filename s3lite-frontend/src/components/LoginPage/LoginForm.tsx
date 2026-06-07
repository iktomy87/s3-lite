import React, { useState } from 'react';
import './CSS/style.css';

export const LoginForm: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="container">
      <div className="left-panel">
        <h1>Impressive<br />React Login Page<br />Template</h1>
        <div className="brand-logo-bottom">
          <span className="theme">THEME</span><span className="selection">SELECTION</span>
        </div>
      </div>

      <div className="right-panel">
        <div className="login-card">
          <div className="card-logo">
            <div className="logo-icon"></div>
            <span className="logo-text">sneat</span>
          </div>

          <h2>Welcome to Sneat! 👋</h2>
          <p className="subtitle">Please sign-in to your account and start the adventure</p>

          <form onSubmit={(e) => e.preventDefault()}>
            <div className="input-group">
              <label htmlFor="email">EMAIL OR USERNAME</label>
              <input type="text" id="email" placeholder="Enter your email or username" />
            </div>

            <div className="input-group">
              <div className="password-labels">
                <label htmlFor="password">PASSWORD</label>
                <a href="#" className="forgot-link">Forgot Password?</a>
              </div>
              <div className="input-icon-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="············"
                />
                <span
                  className="eye-icon"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ cursor: 'pointer' }}
                >
                  👁️
                </span>
              </div>
            </div>

            <div className="checkbox-group">
              <input type="checkbox" id="remember" />
              <label htmlFor="remember">Remember Me</label>
            </div>

            <button type="submit" className="btn-primary">Sign in</button>
          </form>

          <p className="register-text">
            New on our platform? <a href="#">Create an account</a>
          </p>

          <div className="divider">
            <span>or</span>
          </div>

          <div className="social-buttons">
            <button type="button" className="btn-social fb">f</button>
            <button type="button" className="btn-social gp">g+</button>
            <button type="button" className="btn-social tw">t</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
