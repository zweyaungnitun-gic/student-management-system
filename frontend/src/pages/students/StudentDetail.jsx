import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { studentService } from '../../api/studentService';

const StudentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        setLoading(true);
        const data = await studentService.getById(id);
        setStudent(data);
      } catch (error) {
        toast.error('Failed to load student details');
        navigate('/students');
      } finally {
        setLoading(false);
      }
    };
    fetchStudent();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (window.confirm('Are you absolutely sure you want to delete this student?')) {
      try {
        await studentService.delete(id);
        toast.success('Student deleted successfully');
        navigate('/students');
      } catch (error) {
        toast.error('Failed to delete student');
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ENROLLED': return <span className="status-badge status-enrolled"><i className="bi bi-mortarboard-fill me-1"></i>Enrolled</span>;
      case 'ACCEPTED': return <span className="status-badge status-accepted"><i className="bi bi-check-circle-fill me-1"></i>Accepted</span>;
      case 'PENDING': return <span className="status-badge status-pending"><i className="bi bi-clock-fill me-1"></i>Pending</span>;
      case 'REJECTED': return <span className="status-badge status-rejected"><i className="bi bi-x-circle-fill me-1"></i>Rejected</span>;
      default: return <span className="status-badge status-default">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="premium-loader py-5">
        <div className="spinner-border" role="status"></div>
        Loading profile...
      </div>
    );
  }

  if (!student) return null;

  return (
    <div className="fade-in">
      {/* Header Actions */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <button className="btn btn-light shadow-sm" onClick={() => navigate('/students')} style={{fontWeight: 600}}>
          <i className="bi bi-arrow-left me-2"></i>Back to Directory
        </button>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-primary bg-white shadow-sm" onClick={() => navigate(`/students/${id}/edit`)}>
            <i className="bi bi-pencil-square me-2"></i>Edit Student
          </button>
          <button className="btn btn-outline-danger bg-white shadow-sm" onClick={handleDelete}>
            <i className="bi bi-trash-fill me-2"></i>Delete
          </button>
        </div>
      </div>

      {/* Main Profile Header */}
      <div className="glass-card mb-4 d-flex align-items-center gap-4">
        <div className="user-avatar-placeholder" style={{width: 80, height: 80, fontSize: '2rem'}}>
          {student.student_name.charAt(0)}
        </div>
        <div>
          <div className="d-flex align-items-center gap-3 mb-1">
            <h1 className="fw-bold mb-0 text-main" style={{fontFamily: 'Outfit, sans-serif'}}>{student.student_name}</h1>
            {getStatusBadge(student.registration_status)}
          </div>
          <p className="text-muted fw-semibold mb-0" style={{letterSpacing: '0.05em'}}>{student.student_id}</p>
        </div>
      </div>

      <div className="row g-4">
        {/* Personal Details */}
        <div className="col-lg-6">
          <div className="glass-card h-100 p-0 overflow-hidden">
            <div className="section-header-blue">
              <i className="bi bi-person-bounding-box opacity-75"></i>Personal Information
            </div>
            <div className="p-4 pt-2">
              <div className="detail-table-row">
                <span className="detail-label">National ID</span>
                <span className="detail-val">{student.national_id || '—'}</span>
              </div>
              <div className="detail-table-row">
                <span className="detail-label">Date of Birth</span>
                <span className="detail-val">{student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString() : '—'}</span>
              </div>
              <div className="detail-table-row">
                <span className="detail-label">Gender</span>
                <span className="detail-val">{student.gender || '—'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact & Meta */}
        <div className="col-lg-6">
          <div className="glass-card mb-4 p-0 overflow-hidden">
            <div className="section-header-blue">
              <i className="bi bi-telephone opacity-75"></i>Contact & Address
            </div>
            <div className="p-4 pt-2">
              <div className="detail-table-row">
                <span className="detail-label">Email Address</span>
                <span className="detail-val">{student.email || '—'}</span>
              </div>
              <div className="detail-table-row">
                <span className="detail-label">Phone Number</span>
                <span className="detail-val">{student.phone_number || '—'}</span>
              </div>
              <div className="detail-table-row">
                <span className="detail-label">Current Address</span>
                <span className="detail-val">{student.current_living_address || '—'}</span>
              </div>
              <div className="detail-table-row">
                <span className="detail-label">Hometown</span>
                <span className="detail-val">{student.home_town_address || '—'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="col-12">
          <div className="glass-card p-0 overflow-hidden">
            <div className="section-header-blue">
              <i className="bi bi-airplane opacity-75"></i>Additional & Japan Information
            </div>
            <div className="p-4 pt-2 row">
              <div className="col-lg-6">
                <div className="detail-table-row">
                  <span className="detail-label">Name in Japanese</span>
                  <span className="detail-val">{student.additional_info?.name_in_japanese || '—'}</span>
                </div>
                <div className="detail-table-row">
                  <span className="detail-label">Passport Number</span>
                  <span className="detail-val">{student.additional_info?.passport_number || '—'}</span>
                </div>
                <div className="detail-table-row">
                  <span className="detail-label">Father's Name</span>
                  <span className="detail-val">{student.additional_info?.father_name || '—'}</span>
                </div>
              </div>
              <div className="col-lg-6">
                <div className="detail-table-row">
                  <span className="detail-label">Highest JLPT Level</span>
                  <span className="detail-val">{student.additional_info?.passed_highest_jlpt_level || '—'}</span>
                </div>
                <div className="detail-table-row">
                  <span className="detail-label">Desired Job Type</span>
                  <span className="detail-val">{student.additional_info?.desired_job_type || '—'}</span>
                </div>
                <div className="detail-table-row">
                  <span className="detail-label">Viber Contact</span>
                  <span className="detail-val">{student.additional_info?.contact_viber || '—'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetail;
