import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, Home, FileText, Mail } from 'lucide-react';

const RegistrationSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { registrationCode, email } = location.state || {};

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="container" style={{ maxWidth: '600px' }}>
        <div className="card shadow-lg border-0" style={{ borderRadius: '16px' }}>
          <div className="card-body p-5 text-center">
            {/* Success Icon */}
            <div 
              className="rounded-circle mx-auto mb-4 d-flex align-items-center justify-content-center"
              style={{ 
                width: '100px', 
                height: '100px', 
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
              }}
            >
              <CheckCircle size={48} className="text-white" />
            </div>

            {/* Title */}
            <h2 className="fw-bold mb-3">Registration Submitted!</h2>
            
            {/* Message */}
            <p className="text-muted mb-4">
              Thank you for your registration. Your application has been received and is now under review.
            </p>

            {/* Registration Details */}
            {registrationCode && (
              <div className="bg-light rounded-3 p-4 mb-4">
                <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
                  <FileText size={20} className="text-primary" />
                  <span className="fw-semibold">Registration Code</span>
                </div>
                <code className="d-block bg-white rounded-2 p-2 fs-5 fw-bold text-primary">
                  {registrationCode}
                </code>
                <small className="text-muted">Please save this code for your reference</small>
              </div>
            )}

            {/* Email Notification */}
            {email && (
              <div className="d-flex align-items-center justify-content-center gap-2 text-muted mb-4">
                <Mail size={18} />
                <span>Confirmation sent to: <strong>{email}</strong></span>
              </div>
            )}

            {/* What Happens Next */}
            <div className="text-start bg-info bg-opacity-10 rounded-3 p-4 mb-4">
              <h6 className="fw-semibold mb-3">What happens next?</h6>
              <ul className="list-unstyled mb-0">
                <li className="d-flex align-items-start gap-2 mb-2">
                  <span className="badge bg-primary rounded-pill">1</span>
                  <span>Our team will review your application within 3-5 business days</span>
                </li>
                <li className="d-flex align-items-start gap-2 mb-2">
                  <span className="badge bg-primary rounded-pill">2</span>
                  <span>You will receive an email notification once a decision is made</span>
                </li>
                <li className="d-flex align-items-start gap-2">
                  <span className="badge bg-primary rounded-pill">3</span>
                  <span>If approved, you will receive further instructions for enrollment</span>
                </li>
              </ul>
            </div>

            {/* Back to Home Button */}
            <button
              onClick={() => navigate('/login')}
              className="btn btn-primary btn-lg d-flex align-items-center justify-content-center gap-2 w-100"
            >
              <Home size={20} />
              Back to Home
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-muted mt-4" style={{ fontSize: '13px' }}>
          © 2025 Global Innovation Consulting Inc. All Rights Reserved.
        </p>
      </div>
    </div>
  );
};

export default RegistrationSuccess;
