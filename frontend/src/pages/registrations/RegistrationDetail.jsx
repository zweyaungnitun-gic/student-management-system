import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Check, X, User, Phone, MapPin, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

const RegistrationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('PENDING');

  const registration = {
    registrationCode: 'REG-2024-001', englishName: 'Aung Ko Ko', katakanaName: 'アウン コ コ',
    dateOfBirth: '1998-05-22', gender: 'Male', phoneNumber: '09-977-123456',
    currentAddress: 'No. 15, U Wisara Road, Kamayut, Yangon',
    hometownAddress: 'No. 5, Main Road, Bago City',
    nationalIdNumber: '12/LAKANA(N)001234', passportNumber: 'MA123456',
    jlptLevel: 'N5', desiredOccupation: 'Manufacturing',
    japanTravelExperience: false, coeApplicationExperience: false,
    religion: 'Buddhism', smoking: false, alcohol: false, tattoo: false,
    wantDorm: true, submittedAt: '2024-01-15',
    otherMemo: 'Student is very eager to work in Japan and has been preparing for 6 months.'
  };

  const handleDecision = (decision) => {
    setStatus(decision);
    toast.success(`Registration ${decision.toLowerCase()} successfully!`);
  };

  const InfoRow = ({ icon, label, value }) => (
    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'flex-start' }}>
      <div style={{ color: 'var(--text-muted)', paddingTop: '2px' }}>{icon}</div>
      <div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
        <div style={{ color: 'var(--text-primary)', fontWeight: '500', marginTop: '2px' }}>{value ?? 'N/A'}</div>
      </div>
    </div>
  );

  const Section = ({ title, children }) => (
    <div style={{ backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', padding: '1.5rem', marginBottom: '1.5rem' }}>
      <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-subtle)' }}>{title}</h3>
      {children}
    </div>
  );

  const YesNo = ({ value }) => (
    <span style={{ color: value ? 'var(--accent-success)' : 'var(--accent-danger)', fontWeight: '600' }}>
      {value ? 'Yes' : 'No'}
    </span>
  );

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={() => navigate('/registrations')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface)', color: 'var(--text-secondary)' }}>
            <ChevronLeft size={20} />
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <h1 style={{ fontSize: '1.875rem', margin: 0 }}>{registration.englishName}</h1>
              <span style={{
                padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: '600',
                color: status === 'PENDING' ? 'var(--accent-warning)' : status === 'ACCEPTED' ? 'var(--accent-success)' : 'var(--accent-danger)',
                backgroundColor: status === 'PENDING' ? 'rgba(245,158,11,0.15)' : status === 'ACCEPTED' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'
              }}>{status}</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0' }}>Code: {registration.registrationCode} · Submitted: {registration.submittedAt}</p>
          </div>
        </div>
        {status === 'PENDING' && (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={() => handleDecision('REJECTED')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem', backgroundColor: 'rgba(239,68,68,0.1)', color: 'var(--accent-danger)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-md)', fontWeight: '500' }}>
              <X size={16} /> Reject
            </button>
            <button onClick={() => handleDecision('ACCEPTED')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem', backgroundColor: 'var(--accent-success)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: '500' }}>
              <Check size={16} /> Accept
            </button>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1.5rem' }}>
        <div>
          <Section title="Personal Information">
            <InfoRow icon={<User size={16} />} label="Katakana Name" value={registration.katakanaName} />
            <InfoRow icon={<User size={16} />} label="Date of Birth" value={registration.dateOfBirth} />
            <InfoRow icon={<User size={16} />} label="Gender" value={registration.gender} />
            <InfoRow icon={<Phone size={16} />} label="Phone Number" value={registration.phoneNumber} />
            <InfoRow icon={<FileText size={16} />} label="National ID" value={registration.nationalIdNumber} />
            <InfoRow icon={<FileText size={16} />} label="Passport Number" value={registration.passportNumber} />
          </Section>
          <Section title="Japan-Related">
            <InfoRow icon={<FileText size={16} />} label="JLPT Level" value={registration.jlptLevel} />
            <InfoRow icon={<FileText size={16} />} label="Desired Occupation" value={registration.desiredOccupation} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
              <div><div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>JAPAN TRAVEL</div><YesNo value={registration.japanTravelExperience} /></div>
              <div><div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>COE APPLICATION</div><YesNo value={registration.coeApplicationExperience} /></div>
            </div>
          </Section>
        </div>

        <div>
          <Section title="Addresses">
            <InfoRow icon={<MapPin size={16} />} label="Current Address" value={registration.currentAddress} />
            <InfoRow icon={<MapPin size={16} />} label="Hometown Address" value={registration.hometownAddress} />
          </Section>
          <Section title="Lifestyle">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem' }}>
              <div><div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>RELIGION</div><div style={{ fontWeight: '500' }}>{registration.religion}</div></div>
              <div><div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>SMOKING</div><YesNo value={registration.smoking} /></div>
              <div><div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>ALCOHOL</div><YesNo value={registration.alcohol} /></div>
              <div><div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>TATTOO</div><YesNo value={registration.tattoo} /></div>
            </div>
            <div style={{ marginTop: '1rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>DORMITORY PREFERENCE</div>
              <YesNo value={registration.wantDorm} />
            </div>
          </Section>
          <Section title="Admin Memo">
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', margin: 0 }}>{registration.otherMemo}</p>
          </Section>
        </div>
      </div>
    </div>
  );
};

export default RegistrationDetail;
