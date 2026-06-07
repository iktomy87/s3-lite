import React, { useState } from 'react';
import './CSS/style.css';

export const RegisterForm: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="register-page">
      <div className="rp-container">
        <div className="rp-left-panel">
          <h1>Impressive<br />React Register Page<br />Template</h1>
          <div className="rp-brand-logo">
            <span className="rp-theme">THEME</span><span className="rp-selection">SELECTION</span>
          </div>
        </div>

        <div className="rp-right-panel">
          <div className="rp-card">
            <div className="rp-card-logo">
              <div className="rp-logo-icon"></div>
              <span className="rp-logo-text">sneat</span>
            </div>

            <h2>Create an Account! 🚀</h2>
            <p className="rp-subtitle">Fill in the details to create your new account</p>

            <form onSubmit={(e) => e.preventDefault()}>
              <div className="rp-input-group">
                <label className="rp-label" htmlFor="reg-email">EMAIL OR USERNAME</label>
                <input className="rp-input" type="text" id="reg-email" placeholder="Enter your email or username" />
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
                  />
                  <span
                    className="rp-eye-icon"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    👁️
                  </span>
                </div>
              </div>

              <div className="rp-checkbox-group">
                <input type="checkbox" id="reg-terms" />
                <label className="rp-checkbox-label" htmlFor="reg-terms">I agree to the Terms & Privacy</label>
              </div>

              <button type="submit" className="rp-btn-primary">Sign up</button>
            </form>

            <div className="rp-divider">
              <span>or</span>
            </div>

            <div className="rp-social-buttons">
              <button type="button" className="rp-btn-social rp-fb">f</button>
              <button type="button" className="rp-btn-social rp-gp">g+</button>
              <button type="button" className="rp-btn-social rp-tw">t</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
