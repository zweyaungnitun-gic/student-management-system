import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const StudentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const s = { id, studentId: 'ST-001', studentName: 'John Doe', dateOfBirth: '1995-05-15', gender: 'Male', nationalId: '123456789', phoneNumber: '+81 555-1234', email: 'john.doe@example.com', currentLivingAddress: 'Tokyo, Japan', homeTownAddress: 'Yangon, Myanmar', enrolledDate: '2023-09-01', registrationStatus: 'ENROLLED', religion: 'Buddhism', jlptLevel: 'N5', desiredJob: 'IT Engineer' };

  const Row = ({ label, value }) => (
    <tr>
      <th className="text-muted fw-semibold" style={{ width: '35%', background: '#f8f9fa' }}>{label}</th>
      <td>{value || '—'}</td>
    </tr>
  );

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate('/students')}>
            <i className="bi bi-arrow-left me-1"></i>Back
          </button>
          <div>
            <div className="d-flex align-items-center gap-2">
              <h4 className="fw-bold mb-0">{s.studentName}</h4>
              <span className="badge bg-success">{s.registrationStatus}</span>
            </div>
            <p className="text-muted small mb-0">Student ID: {s.studentId}</p>
          </div>
        </div>
        <button className="btn btn-outline-primary btn-sm" onClick={() => navigate(`/students/${id}/edit`)}>
          <i className="bi bi-pencil-square me-1"></i>Edit
        </button>
      </div>

      <div className="row g-4">
        <div className="col-lg-6">
          <div className="bg-white rounded-3 shadow-sm overflow-hidden h-100">
            <div className="section-header-blue"><i className="bi bi-person-fill me-2"></i>Personal Information</div>
            <table className="table table-bordered mb-0 small">
              <tbody>
                <Row label="Full Name"    value={s.studentName} />
                <Row label="Date of Birth" value={s.dateOfBirth} />
                <Row label="Gender"       value={s.gender} />
                <Row label="National ID"  value={s.nationalId} />
                <Row label="Religion"     value={s.religion} />
              </tbody>
            </table>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="bg-white rounded-3 shadow-sm overflow-hidden mb-4">
            <div className="section-header-blue"><i className="bi bi-telephone-fill me-2"></i>Contact & Address</div>
            <table className="table table-bordered mb-0 small">
              <tbody>
                <Row label="Phone"         value={s.phoneNumber} />
                <Row label="Email"         value={s.email} />
                <Row label="Current Address" value={s.currentLivingAddress} />
                <Row label="Hometown"      value={s.homeTownAddress} />
              </tbody>
            </table>
          </div>
          <div className="bg-white rounded-3 shadow-sm overflow-hidden">
            <div className="section-header-blue"><i className="bi bi-airplane-fill me-2"></i>Japan Information</div>
            <table className="table table-bordered mb-0 small">
              <tbody>
                <Row label="JLPT Level"     value={s.jlptLevel} />
                <Row label="Desired Job"    value={s.desiredJob} />
                <Row label="Enrolled Date"  value={s.enrolledDate} />
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentDetail;
