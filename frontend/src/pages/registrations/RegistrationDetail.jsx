import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Check, X, User, Phone, MapPin, FileText, Calendar, Heart, Home, Info } from 'lucide-react';
import { registrationService } from '../../api/registrationService';
import toast from 'react-hot-toast';

const RegistrationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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
      toast.error('申請内容の取得に失敗しました');
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
        toast.success('申請を承認しました。生徒として登録されました。');
      } else {
        await registrationService.reject(id);
        toast.success('申請を却下しました。');
      }
      fetchRegistration();
    } catch (error) {
      console.error(`Error ${decision.toLowerCase()}ing registration:`, error);
      toast.error('処理に失敗しました');
    } finally {
      setProcessing(false);
    }
  };

  const InfoRow = ({ icon, label, value }) => (
    <div className="d-flex gap-3 mb-3 align-items-start">
      <div className="text-muted mt-1">{icon}</div>
      <div>
        <div className="small text-uppercase fw-bold text-muted spacing-wide" style={{ fontSize: '0.7rem' }}>{label}</div>
        <div className="text-primary fw-medium">{value || '—'}</div>
      </div>
    </div>
  );

  const Section = ({ title, children, icon }) => (
    <div className="glass-card mb-4 p-4">
      <div className="d-flex align-items-center gap-2 mb-4 pb-2 border-bottom border-subtle">
        {icon}
        <h3 className="h6 mb-0 text-uppercase fw-bold">{title}</h3>
      </div>
      {children}
    </div>
  );

  const YesNo = ({ value }) => (
    <span className={`fw-bold ${value ? 'text-success' : 'text-danger'}`}>
      {value ? (
        <span className="d-flex align-items-center gap-1"><Check size={14}/> YES</span>
      ) : (
        <span className="d-flex align-items-center gap-1"><X size={14}/> NO</span>
      )}
    </span>
  );

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-2 text-muted">読み込み中...</p>
      </div>
    );
  }

  if (!registration) {
    return (
      <div className="text-center py-5">
        <p className="text-danger">登録申請が見つかりませんでした。</p>
        <button onClick={() => navigate('/registrations')} className="btn btn-outline-primary">一覧に戻る</button>
      </div>
    );
  }

  const status = registration.status?.toUpperCase() || 'PENDING';

  return (
    <div className="fade-in">
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
        <div className="d-flex align-items-center gap-3">
          <button onClick={() => navigate('/registrations')} className="btn btn-outline-secondary btn-icon">
            <ChevronLeft size={20} />
          </button>
          <div>
            <div className="d-flex align-items-center gap-3">
              <h1 className="h3 mb-0">{registration.english_name}</h1>
              <span className={`badge ${
                status === 'PENDING' ? 'bg-warning' : 
                status === 'ACCEPTED' ? 'bg-success' : 'bg-danger'
              }`}>
                {status}
              </span>
            </div>
            <p className="text-muted mb-0">Code: {registration.registration_code} · Submitted: {new Date(registration.submitted_at).toLocaleDateString()}</p>
          </div>
        </div>
        
        {status === 'PENDING' && (
          <div className="d-flex gap-2">
            <button 
              onClick={() => handleDecision('REJECTED')} 
              disabled={processing}
              className="btn btn-outline-danger d-flex align-items-center gap-2"
            >
              <X size={18} /> Reject
            </button>
            <button 
              onClick={() => handleDecision('ACCEPTED')} 
              disabled={processing}
              className="btn btn-success d-flex align-items-center gap-2"
            >
              <Check size={18} /> Accept Application
            </button>
          </div>
        )}
      </div>

      <div className="row">
        <div className="col-lg-4">
          <Section title="Personal Information" icon={<User size={18} className="text-primary"/>}>
            <InfoRow icon={<User size={16} />} label="Katakana Name" value={registration.katakana_name} />
            <InfoRow icon={<Calendar size={16} />} label="Date of Birth" value={registration.date_of_birth} />
            <InfoRow icon={<User size={16} />} label="Gender" value={registration.gender} />
            <InfoRow icon={<Phone size={16} />} label="Phone Number" value={registration.phone_number} />
            <InfoRow icon={<FileText size={16} />} label="National ID" value={registration.national_id_number} />
            <InfoRow icon={<FileText size={16} />} label="Passport No." value={registration.passport_number} />
          </Section>

          <Section title="Japan Travel & COE" icon={<Plane size={18} className="text-primary"/>}>
            <InfoRow icon={<FileText size={16} />} label="JLPT Level" value={registration.jlpt_level} />
            <InfoRow icon={<FileText size={16} />} label="Desired Job" value={registration.desired_occupation} />
            <div className="row mt-2 g-3">
              <div className="col-6">
                <div className="small text-muted mb-1 text-uppercase">Japan Travel</div>
                <YesNo value={registration.japan_travel_experience} />
              </div>
              <div className="col-6">
                <div className="small text-muted mb-1 text-uppercase">COE Exp.</div>
                <YesNo value={registration.coe_application_experience} />
              </div>
            </div>
          </Section>
        </div>

        <div className="col-lg-8">
          <div className="row">
            <div className="col-md-12">
              <Section title="Addresses" icon={<MapPin size={18} className="text-primary"/>}>
                <div className="row">
                  <div className="col-md-6 border-end border-subtle">
                    <InfoRow icon={<Home size={16} />} label="Current Address" value={registration.current_address} />
                  </div>
                  <div className="col-md-6 ps-md-4">
                    <InfoRow icon={<MapPin size={16} />} label="Hometown Address" value={registration.hometown_address} />
                  </div>
                </div>
              </Section>
            </div>
            
            <div className="col-md-12">
              <Section title="Lifestyle & Preferences" icon={<Heart size={18} className="text-primary"/>}>
                <div className="row g-4">
                  <div className="col-sm-3">
                    <div className="small text-muted mb-1 text-uppercase">Religion</div>
                    <div className="fw-medium">{registration.religion || '—'}</div>
                  </div>
                  <div className="col-sm-3">
                    <div className="small text-muted mb-1 text-uppercase">Smoking</div>
                    <YesNo value={registration.smoking} />
                  </div>
                  <div className="col-sm-3">
                    <div className="small text-muted mb-1 text-uppercase">Alcohol</div>
                    <YesNo value={registration.alcohol} />
                  </div>
                  <div className="col-sm-3">
                    <div className="small text-muted mb-1 text-uppercase">Tattoo</div>
                    <YesNo value={registration.tattoo} />
                  </div>
                  <div className="col-12 border-top border-subtle pt-3">
                    <div className="small text-muted mb-1 text-uppercase">Dormitory Preference</div>
                    <YesNo value={registration.want_dorm} />
                  </div>
                </div>
              </Section>
            </div>

            <div className="col-md-12">
              <Section title="Additional Notes" icon={<Info size={18} className="text-primary"/>}>
                <p className="text-muted mb-0 bg-light p-3 rounded" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                  {registration.other_memo || 'No additional notes provided.'}
                </p>
              </Section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Internal icon for Plane since plane icon was used but not imported
const Plane = ({ size, className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"></path>
  </svg>
);

export default RegistrationDetail;
