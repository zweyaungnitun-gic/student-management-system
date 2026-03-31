import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Check, X, User, Phone, MapPin, FileText, Calendar, Heart, Home, Info, Mail, Globe, Briefcase, BookOpen, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { registrationService } from '../../api/registrationService';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const RegistrationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [registration, setRegistration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const fetchRegistration = async () => {
    try {
      setLoading(true);
      const data = await registrationService.getById(id);
      setRegistration(data);
    } catch (error) {
      console.error('Error fetching registration:', error);
      toast.error('Failed to load application details');
      navigate('/registrations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistration();
  }, [id]);

  const handleDecision = async (decision) => {
    try {
      setProcessing(true);
      if (decision === 'ACCEPTED') {
        await registrationService.accept(id);
        toast.success('Application approved! Student has been registered.');
      } else {
        await registrationService.reject(id);
        toast.success('Application rejected.');
      }
      fetchRegistration();
    } catch (error) {
      console.error(`Error ${decision.toLowerCase()}ing registration:`, error);
      toast.error('Action failed');
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '—';
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (e) {
      return '—';
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'PENDING':
        return { class: 'warning', icon: Clock, label: 'Pending Review' };
      case 'ACCEPTED':
        return { class: 'success', icon: CheckCircle, label: 'Approved' };
      case 'REJECTED':
        return { class: 'danger', icon: XCircle, label: 'Rejected' };
      default:
        return { class: 'secondary', icon: AlertCircle, label: status || 'Unknown' };
    }
  };

  const InfoRow = ({ icon: Icon, label, value }) => (
    <div className="info-row">
      <div className="info-icon-wrapper">
        <Icon size={16} />
      </div>
      <div className="info-content-wrapper">
        <div className="info-label">{label}</div>
        <div className="info-value">{value || '—'}</div>
      </div>
    </div>
  );

  const Section = ({ title, icon: Icon, children }) => (
    <div className="detail-section">
      <div className="section-header">
        <Icon size={20} />
        <h3>{title}</h3>
      </div>
      <div className="section-content">
        {children}
      </div>
    </div>
  );

  const YesNo = ({ value, label }) => (
    <div className="yesno-item">
      <span className="yesno-label">{label}</span>
      {value ? (
        <span className="yesno-value yes"><Check size={14} /> Yes</span>
      ) : (
        <span className="yesno-value no"><X size={14} /> No</span>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading application details...</p>
        </div>
      </div>
    );
  }

  if (!registration) {
    return (
      <div className="not-found">
        <div className="not-found-icon">📋</div>
        <h2>Application Not Found</h2>
        <p>The registration application you're looking for doesn't exist.</p>
        <button className="btn-primary" onClick={() => navigate('/registrations')}>
          Back to Registrations
        </button>
      </div>
    );
  }

  const status = registration.registration_status || 'PENDING';
  const statusConfig = getStatusConfig(status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="registration-detail-module">
      {/* Header Actions */}
      <div className="detail-actions">
        <button className="action-back" onClick={() => navigate('/registrations')}>
          <ChevronLeft size={18} />
          <span>Back to Registrations</span>
        </button>
        
        {status === 'PENDING' && (
          <div className="action-buttons-group">
            <button 
              onClick={() => handleDecision('REJECTED')} 
              disabled={processing}
              className="btn-reject"
            >
              <X size={18} />
              <span>Reject Application</span>
            </button>
            <button 
              onClick={() => handleDecision('ACCEPTED')} 
              disabled={processing}
              className="btn-approve"
            >
              <Check size={18} />
              <span>Approve Application</span>
            </button>
          </div>
        )}
      </div>

      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-avatar">
          <div className="avatar-large">
            {(registration.english_name || 'A').charAt(0).toUpperCase()}
          </div>
          <div className={`status-badge ${statusConfig.class}`}>
            <StatusIcon size={12} />
            <span>{statusConfig.label}</span>
          </div>
        </div>
        <div className="profile-info">
          <h1 className="profile-name">{registration.english_name}</h1>
          <div className="profile-badge">{registration.registration_code}</div>
          <div className="profile-meta">
            <div className="meta-item">
              <Calendar size={14} />
              <span>Submitted: {formatDate(registration.submitted_at)}</span>
            </div>
            {registration.decided_at && (
              <div className="meta-item">
                <Clock size={14} />
                <span>Decided: {formatDate(registration.decided_at)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="details-grid">
        {/* Personal Information */}
        <Section title="Personal Information" icon={User}>
          <InfoRow icon={User} label="Full Name" value={registration.english_name} />
          <InfoRow icon={Globe} label="Name in Japanese" value={registration.katakana_name} />
          <InfoRow icon={Calendar} label="Date of Birth" value={formatDate(registration.date_of_birth)} />
          <InfoRow icon={User} label="Gender" value={registration.gender} />
          <InfoRow icon={FileText} label="National ID" value={registration.national_id_number} />
          <InfoRow icon={FileText} label="Passport Number" value={registration.passport_number} />
          <InfoRow icon={Heart} label="Religion" value={registration.religion || '—'} />
        </Section>

        {/* Contact Information */}
        <Section title="Contact Information" icon={Phone}>
          <InfoRow icon={Phone} label="Primary Phone" value={registration.phone_number} />
          <InfoRow icon={Phone} label="Guardian Phone" value={registration.guardian_phone_number} />
          <InfoRow icon={User} label="Father's Name" value={registration.father_name} />
          <InfoRow icon={MapPin} label="Current Address" value={registration.current_address} />
          <InfoRow icon={MapPin} label="Hometown Address" value={registration.hometown_address} />
        </Section>

        {/* Japanese Study Information */}
        <Section title="Japanese Study Information" icon={BookOpen}>
          <InfoRow icon={BookOpen} label="JLPT Level" value={registration.jlpt_level || 'Not specified'} />
          <InfoRow icon={Briefcase} label="Desired Occupation" value={registration.desired_occupation || 'Not specified'} />
          {registration.other_occupation && (
            <InfoRow icon={Briefcase} label="Other Occupation" value={registration.other_occupation} />
          )}
          <div className="yesno-group">
            <YesNo label="Japan Travel Experience" value={registration.japan_travel_experience} />
            <YesNo label="COE Application Experience" value={registration.coe_application_experience} />
          </div>
        </Section>

        {/* Lifestyle Preferences */}
        <Section title="Lifestyle Preferences" icon={Heart}>
          <div className="yesno-group">
            <YesNo label="Smoking" value={registration.smoking} />
            <YesNo label="Alcohol" value={registration.alcohol} />
            <YesNo label="Tattoo" value={registration.tattoo} />
            <YesNo label="Want Dormitory" value={registration.want_dorm} />
          </div>
          <InfoRow icon={Calendar} label="Tuition Payment Date" value={formatDate(registration.tuition_payment_date)} />
        </Section>

        {/* Additional Notes */}
        <Section title="Additional Notes" icon={Info}>
          <div className="notes-content">
            {registration.other_memo ? (
              <p>{registration.other_memo}</p>
            ) : (
              <p className="no-notes">No additional notes provided.</p>
            )}
          </div>
        </Section>
      </div>

      <style>{`
        .registration-detail-module {
          padding: 1.5rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 400px;
        }

        .loading-spinner {
          text-align: center;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e2e8f0;
          border-top-color: #0f6cbd;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .not-found {
          text-align: center;
          padding: 4rem 2rem;
          background: white;
          border-radius: 24px;
        }

        .not-found-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .not-found h2 {
          font-size: 1.5rem;
          margin: 0 0 0.5rem 0;
          color: #1e293b;
        }

        .not-found p {
          color: #64748b;
          margin-bottom: 1.5rem;
        }

        .btn-primary {
          padding: 0.75rem 1.5rem;
          background: #0f6cbd;
          color: white;
          border: none;
          border-radius: 12px;
          cursor: pointer;
        }

        .detail-actions {
          display: flex;
          justify-content: space-between;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .action-back {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          cursor: pointer;
          font-size: 0.85rem;
          transition: all 0.2s;
        }

        .action-back:hover {
          background: #f8fafc;
          border-color: #0f6cbd;
        }

        .action-buttons-group {
          display: flex;
          gap: 0.75rem;
        }

        .btn-approve, .btn-reject {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 10px;
          cursor: pointer;
          font-size: 0.85rem;
          font-weight: 500;
          transition: all 0.2s;
          border: none;
        }

        .btn-approve {
          background: #10b981;
          color: white;
        }

        .btn-approve:hover:not(:disabled) {
          background: #059669;
        }

        .btn-reject {
          background: #dc2626;
          color: white;
        }

        .btn-reject:hover:not(:disabled) {
          background: #b91c1c;
        }

        .btn-approve:disabled, .btn-reject:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .profile-header {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-radius: 24px;
          padding: 2rem;
          display: flex;
          gap: 2rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }

        .profile-avatar {
          position: relative;
        }

        .avatar-large {
          width: 100px;
          height: 100px;
          background: linear-gradient(135deg, #0f6cbd 0%, #1e88e5 100%);
          border-radius: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          font-weight: 700;
          color: white;
        }

        .status-badge {
          position: absolute;
          bottom: -10px;
          left: 50%;
          transform: translateX(-50%);
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 500;
          white-space: nowrap;
        }

        .status-badge.warning {
          background: #fff3e0;
          color: #ed6c02;
        }

        .status-badge.success {
          background: #e8f5e9;
          color: #2e7d32;
        }

        .status-badge.danger {
          background: #ffebee;
          color: #c62828;
        }

        .status-badge.secondary {
          background: #e2e8f0;
          color: #475569;
        }

        .profile-info {
          flex: 1;
        }

        .profile-name {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0 0 0.5rem 0;
          color: #0f172a;
        }

        .profile-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          background: #e2e8f0;
          border-radius: 20px;
          font-size: 0.7rem;
          font-family: monospace;
          color: #475569;
          margin-bottom: 1rem;
        }

        .profile-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
          color: #64748b;
        }

        .details-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 1.5rem;
        }

        .detail-section {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid #eef2ff;
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.25rem;
          background: #f8fafc;
          border-bottom: 1px solid #eef2ff;
        }

        .section-header h3 {
          font-size: 0.9rem;
          font-weight: 600;
          margin: 0;
          color: #1e293b;
        }

        .section-header svg {
          color: #0f6cbd;
        }

        .section-content {
          padding: 1.25rem;
        }

        .info-row {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 0.5rem 0;
          border-bottom: 1px solid #f8fafc;
        }

        .info-row:last-child {
          border-bottom: none;
        }

        .info-icon-wrapper {
          width: 28px;
          height: 28px;
          background: #f1f5f9;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
        }

        .info-content-wrapper {
          flex: 1;
        }

        .info-label {
          font-size: 0.65rem;
          text-transform: uppercase;
          font-weight: 600;
          color: #94a3b8;
          letter-spacing: 0.5px;
        }

        .info-value {
          font-size: 0.85rem;
          color: #1e293b;
          margin-top: 0.125rem;
        }

        .yesno-group {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 0.75rem;
        }

        .yesno-item {
          flex: 1;
          min-width: 120px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 0;
          border-bottom: 1px solid #f8fafc;
        }

        .yesno-label {
          font-size: 0.75rem;
          color: #64748b;
        }

        .yesno-value {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .yesno-value.yes {
          color: #10b981;
        }

        .yesno-value.no {
          color: #dc2626;
        }

        .notes-content {
          background: #f8fafc;
          border-radius: 12px;
          padding: 1rem;
        }

        .notes-content p {
          margin: 0;
          font-size: 0.85rem;
          color: #475569;
          line-height: 1.5;
        }

        .no-notes {
          color: #94a3b8;
          font-style: italic;
        }

        @media (max-width: 768px) {
          .registration-detail-module {
            padding: 1rem;
          }
          
          .profile-header {
            flex-direction: column;
            text-align: center;
          }
          
          .profile-meta {
            justify-content: center;
          }
          
          .details-grid {
            grid-template-columns: 1fr;
          }
          
          .detail-actions {
            flex-direction: column;
          }
          
          .action-buttons-group {
            width: 100%;
          }
          
          .btn-approve, .btn-reject {
            flex: 1;
            justify-content: center;
          }
          
          .yesno-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.25rem;
          }
        }
      `}</style>
    </div>
  );
};

export default RegistrationDetail;