import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Plus,
  Link,
  Copy,
  Trash2,
  RefreshCw,
  Power,
  PowerOff,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  ExternalLink,
  MoreHorizontal,
  ChevronDown,
  Filter,
  Eye,
  UserCheck,
  QrCode
} from 'lucide-react';
import { registrationLinkService } from '../../api/registrationLinkService';
import toast from 'react-hot-toast';

const RegistrationLinkManager = () => {
  const { t } = useTranslation();
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newLinkName, setNewLinkName] = useState('');
  const [newLinkExpiry, setNewLinkExpiry] = useState('');
  const [newLinkMaxUses, setNewLinkMaxUses] = useState('');
  const [registrations, setRegistrations] = useState([]);
  const [activeTab, setActiveTab] = useState('links'); // 'links' or 'registrations'
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchLinks();
    fetchRegistrations();
  }, []);

  const fetchLinks = async () => {
    try {
      const response = await registrationLinkService.getMyLinks();
      setLinks(response.data);
    } catch (error) {
      console.error('Error fetching links:', error);
      toast.error('Failed to load registration links');
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrations = async (status = '') => {
    try {
      const response = await registrationLinkService.getAllRegistrations(status);
      setRegistrations(response.data);
    } catch (error) {
      console.error('Error fetching registrations:', error);
    }
  };

  const handleCreateLink = async () => {
    try {
      const data = {
        link_name: newLinkName || null,
        expires_at: newLinkExpiry ? new Date(newLinkExpiry).toISOString() : null,
        max_uses: newLinkMaxUses ? parseInt(newLinkMaxUses) : null
      };
      
      await registrationLinkService.createLink(data);
      toast.success('Registration link created successfully');
      setShowCreateModal(false);
      setNewLinkName('');
      setNewLinkExpiry('');
      setNewLinkMaxUses('');
      fetchLinks();
    } catch (error) {
      console.error('Error creating link:', error);
      toast.error('Failed to create registration link');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Link copied to clipboard');
  };

  const toggleLinkStatus = async (id, currentStatus) => {
    try {
      await registrationLinkService.updateLink(id, { is_active: !currentStatus });
      toast.success(`Link ${currentStatus ? 'deactivated' : 'activated'}`);
      fetchLinks();
    } catch (error) {
      toast.error('Failed to update link status');
    }
  };

  const deleteLink = async (id) => {
    if (window.confirm('Are you sure you want to delete this link?')) {
      try {
        await registrationLinkService.deleteLink(id);
        toast.success('Link deleted successfully');
        fetchLinks();
      } catch (error) {
        toast.error('Failed to delete link');
      }
    }
  };

  const regenerateLink = async (id) => {
    if (window.confirm('This will generate a new URL. The old link will no longer work. Continue?')) {
      try {
        await registrationLinkService.regenerateToken(id);
        toast.success('Link regenerated successfully');
        fetchLinks();
      } catch (error) {
        toast.error('Failed to regenerate link');
      }
    }
  };

  const viewRegistrationDetail = async (id) => {
    try {
      const response = await registrationLinkService.getRegistrationDetail(id);
      setSelectedRegistration(response.data);
      setShowDetailModal(true);
    } catch (error) {
      toast.error('Failed to load registration details');
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await registrationLinkService.updateRegistrationStatus(id, { status });
      toast.success(`Registration ${status.toLowerCase()}`);
      fetchRegistrations(statusFilter);
      if (showDetailModal) {
        setShowDetailModal(false);
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleConvertToStudent = async (id) => {
    try {
      const response = await registrationLinkService.convertToStudent(id);
      toast.success(`Converted to student: ${response.data.student_code}`);
      fetchRegistrations(statusFilter);
      if (showDetailModal) {
        setShowDetailModal(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to convert to student');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadge = (status) => {
    const badges = {
      'PENDING': { class: 'bg-warning', icon: <Clock size={14} /> },
      'APPROVED': { class: 'bg-success', icon: <CheckCircle size={14} /> },
      'REJECTED': { class: 'bg-danger', icon: <XCircle size={14} /> }
    };
    const badge = badges[status] || { class: 'bg-secondary', icon: null };
    return (
      <span className={`badge ${badge.class} d-flex align-items-center gap-1`}>
        {badge.icon}
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border text-primary"></div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="page-header mb-4">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div>
            <h1 className="mb-1" style={{ color: '#0a58a0', fontWeight: 600, fontSize: '1.8rem' }}>
              Student Registration Links
            </h1>
            <p className="text-muted mb-0">Create unique links for students to self-register</p>
          </div>
          
          <div className="d-flex gap-2">
            <div className="btn-group">
              <button 
                className={`btn ${activeTab === 'links' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setActiveTab('links')}
              >
                <Link size={16} className="me-2" />
                Links ({links.length})
              </button>
              <button 
                className={`btn ${activeTab === 'registrations' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setActiveTab('registrations')}
              >
                <Users size={16} className="me-2" />
                Registrations ({registrations.length})
              </button>
            </div>
            
            {activeTab === 'links' && (
              <button
                className="btn btn-primary d-flex align-items-center gap-2"
                onClick={() => setShowCreateModal(true)}
              >
                <Plus size={20} />
                Create Link
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Links Tab */}
      {activeTab === 'links' && (
        <div className="card shadow-sm border-0" style={{ borderRadius: '12px' }}>
          <div className="card-body p-0">
            {links.length === 0 ? (
              <div className="text-center py-5">
                <Link size={64} className="text-muted mb-3 opacity-25" />
                <h5 className="text-muted">No registration links yet</h5>
                <p className="text-muted">Create your first link to share with prospective students</p>
                <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                  <Plus size={16} className="me-2" />
                  Create Link
                </button>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-4 py-3">Link Name</th>
                      <th className="py-3">URL</th>
                      <th className="py-3 text-center">Uses</th>
                      <th className="py-3">Status</th>
                      <th className="py-3">Expires</th>
                      <th className="py-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {links.map((link) => (
                      <tr key={link.id}>
                        <td className="ps-4 py-3">
                          <div className="fw-semibold">{link.link_name || 'Untitled Link'}</div>
                          <small className="text-muted">
                            Created {formatDate(link.created_at)}
                          </small>
                        </td>
                        <td className="py-3">
                          <div className="d-flex align-items-center gap-2">
                            <code className="bg-light px-2 py-1 rounded text-truncate" style={{ maxWidth: '250px' }}>
                              {link.full_url}
                            </code>
                            <button 
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => copyToClipboard(link.full_url)}
                              title="Copy link"
                            >
                              <Copy size={14} />
                            </button>
                            <a 
                              href={link.full_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-sm btn-outline-secondary"
                              title="Open link"
                            >
                              <ExternalLink size={14} />
                            </a>
                          </div>
                        </td>
                        <td className="py-3 text-center">
                          <span className="badge bg-info">
                            {link.use_count} / {link.max_uses || '∞'}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className={`badge ${link.is_active ? 'bg-success' : 'bg-secondary'}`}>
                            {link.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-3">
                          {link.expires_at ? (
                            new Date(link.expires_at) < new Date() ? (
                              <span className="text-danger">
                                <Clock size={14} className="me-1" />
                                Expired
                              </span>
                            ) : (
                              formatDate(link.expires_at)
                            )
                          ) : (
                            <span className="text-muted">Never</span>
                          )}
                        </td>
                        <td className="py-3 text-center">
                          <div className="btn-group">
                            <button
                              className={`btn btn-sm ${link.is_active ? 'btn-outline-warning' : 'btn-outline-success'}`}
                              onClick={() => toggleLinkStatus(link.id, link.is_active)}
                              title={link.is_active ? 'Deactivate' : 'Activate'}
                            >
                              {link.is_active ? <PowerOff size={14} /> : <Power size={14} />}
                            </button>
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => regenerateLink(link.id)}
                              title="Regenerate token"
                            >
                              <RefreshCw size={14} />
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => deleteLink(link.id)}
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Registrations Tab */}
      {activeTab === 'registrations' && (
        <div className="card shadow-sm border-0" style={{ borderRadius: '12px' }}>
          <div className="card-header bg-white border-bottom-0 pt-4 pb-3 px-4">
            <div className="d-flex align-items-center justify-content-between">
              <h5 className="mb-0 fw-semibold">Student Registrations</h5>
              <div className="d-flex gap-2">
                <select 
                  className="form-select form-select-sm" 
                  style={{ width: '150px' }}
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    fetchRegistrations(e.target.value);
                  }}
                >
                  <option value="">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
            </div>
          </div>
          <div className="card-body p-0">
            {registrations.length === 0 ? (
              <div className="text-center py-5">
                <Users size={64} className="text-muted mb-3 opacity-25" />
                <h5 className="text-muted">No registrations yet</h5>
                <p className="text-muted">Students will appear here when they use your registration link</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-4 py-3">Student</th>
                      <th className="py-3">Contact</th>
                      <th className="py-3">JLPT Level</th>
                      <th className="py-3">Status</th>
                      <th className="py-3">Submitted</th>
                      <th className="py-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.map((reg) => (
                      <tr key={reg.id}>
                        <td className="ps-4 py-3">
                          <div className="d-flex align-items-center gap-3">
                            <div 
                              className="rounded-circle d-flex align-items-center justify-content-center"
                              style={{ 
                                width: '40px', 
                                height: '40px', 
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                fontWeight: 'bold'
                              }}
                            >
                              {reg.student_name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="fw-semibold">{reg.student_name}</div>
                              <small className="text-muted">via: {reg.link_name || 'Direct'}</small>
                            </div>
                          </div>
                        </td>
                        <td className="py-3">
                          <div>{reg.email}</div>
                          <small className="text-muted">{reg.phone_number || 'No phone'}</small>
                        </td>
                        <td className="py-3">
                          <span className="badge bg-info bg-opacity-10 text-info">
                            {reg.current_japan_level || 'Not specified'}
                          </span>
                        </td>
                        <td className="py-3">{getStatusBadge(reg.status)}</td>
                        <td className="py-3">
                          {formatDate(reg.submitted_at)}
                        </td>
                        <td className="py-3 text-center">
                          <div className="btn-group">
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => viewRegistrationDetail(reg.id)}
                              title="View details"
                            >
                              <Eye size={14} />
                            </button>
                            {reg.status === 'PENDING' && (
                              <>
                                <button
                                  className="btn btn-sm btn-outline-success"
                                  onClick={() => handleStatusUpdate(reg.id, 'APPROVED')}
                                  title="Approve"
                                >
                                  <CheckCircle size={14} />
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleStatusUpdate(reg.id, 'REJECTED')}
                                  title="Reject"
                                >
                                  <XCircle size={14} />
                                </button>
                              </>
                            )}
                            {reg.status === 'APPROVED' && (
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => handleConvertToStudent(reg.id)}
                                title="Convert to Student"
                              >
                                <UserCheck size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Link Modal */}
      {showCreateModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Create Registration Link</h5>
                <button type="button" className="btn-close" onClick={() => setShowCreateModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Link Name (Optional)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g., 2024 Spring Intake"
                    value={newLinkName}
                    onChange={(e) => setNewLinkName(e.target.value)}
                  />
                  <small className="text-muted">Help you identify this link later</small>
                </div>
                <div className="mb-3">
                  <label className="form-label">Expiration Date (Optional)</label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    value={newLinkExpiry}
                    onChange={(e) => setNewLinkExpiry(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Maximum Uses (Optional)</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Unlimited"
                    value={newLinkMaxUses}
                    onChange={(e) => setNewLinkMaxUses(e.target.value)}
                    min="1"
                  />
                  <small className="text-muted">Leave empty for unlimited uses</small>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleCreateLink}>
                  Create Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Registration Detail Modal */}
      {showDetailModal && selectedRegistration && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Registration Details</h5>
                <button type="button" className="btn-close" onClick={() => setShowDetailModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  {/* Personal Info */}
                  <div className="col-md-6">
                    <h6 className="fw-semibold mb-3">Personal Information</h6>
                    <div className="mb-2"><strong>Name:</strong> {selectedRegistration.student_name}</div>
                    <div className="mb-2"><strong>Email:</strong> {selectedRegistration.email}</div>
                    <div className="mb-2"><strong>Phone:</strong> {selectedRegistration.phone_number || '-'}</div>
                    <div className="mb-2"><strong>National ID:</strong> {selectedRegistration.national_id}</div>
                    <div className="mb-2"><strong>Date of Birth:</strong> {formatDate(selectedRegistration.date_of_birth)}</div>
                    <div className="mb-2"><strong>Gender:</strong> {selectedRegistration.gender || '-'}</div>
                  </div>
                  
                  {/* Japanese Info */}
                  <div className="col-md-6">
                    <h6 className="fw-semibold mb-3">Japanese Information</h6>
                    <div className="mb-2"><strong>Name in Japanese:</strong> {selectedRegistration.name_in_japanese || '-'}</div>
                    <div className="mb-2"><strong>Passport:</strong> {selectedRegistration.passport_number || '-'}</div>
                    <div className="mb-2"><strong>Current JLPT Level:</strong> {selectedRegistration.current_japan_level || '-'}</div>
                    <div className="mb-2"><strong>Passed JLPT:</strong> {selectedRegistration.passed_highest_jlpt_level || '-'}</div>
                    <div className="mb-2"><strong>Japan Travel:</strong> {selectedRegistration.japan_travel_experience ? 'Yes' : 'No'}</div>
                    <div className="mb-2"><strong>COE Experience:</strong> {selectedRegistration.coe_application_experience ? 'Yes' : 'No'}</div>
                  </div>
                  
                  {/* Address */}
                  <div className="col-12">
                    <h6 className="fw-semibold mb-3">Address Information</h6>
                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-2"><strong>Current Address:</strong></div>
                        <p className="text-muted">{selectedRegistration.current_living_address || '-'}</p>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-2"><strong>Home Town:</strong></div>
                        <p className="text-muted">{selectedRegistration.home_town_address || '-'}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Preferences */}
                  <div className="col-12">
                    <h6 className="fw-semibold mb-3">Preferences</h6>
                    <div className="row">
                      <div className="col-md-3"><strong>Smoking:</strong> {selectedRegistration.is_smoking ? 'Yes' : 'No'}</div>
                      <div className="col-md-3"><strong>Alcohol:</strong> {selectedRegistration.is_alcohol_drink ? 'Yes' : 'No'}</div>
                      <div className="col-md-3"><strong>Tattoo:</strong> {selectedRegistration.have_tatto ? 'Yes' : 'No'}</div>
                      <div className="col-md-3"><strong>Hostel:</strong> {selectedRegistration.hostel_preference ? 'Yes' : 'No'}</div>
                    </div>
                  </div>
                  
                  {/* Status */}
                  <div className="col-12">
                    <div className="alert alert-info">
                      <strong>Status:</strong> {getStatusBadge(selectedRegistration.status)}
                      <br />
                      <strong>Submitted:</strong> {formatDate(selectedRegistration.submitted_at)}
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowDetailModal(false)}>
                  Close
                </button>
                {selectedRegistration.status === 'PENDING' && (
                  <>
                    <button 
                      className="btn btn-success" 
                      onClick={() => handleStatusUpdate(selectedRegistration.id, 'APPROVED')}
                    >
                      <CheckCircle size={16} className="me-2" />
                      Approve
                    </button>
                    <button 
                      className="btn btn-danger" 
                      onClick={() => handleStatusUpdate(selectedRegistration.id, 'REJECTED')}
                    >
                      <XCircle size={16} className="me-2" />
                      Reject
                    </button>
                  </>
                )}
                {selectedRegistration.status === 'APPROVED' && (
                  <button 
                    className="btn btn-primary" 
                    onClick={() => handleConvertToStudent(selectedRegistration.id)}
                  >
                    <UserCheck size={16} className="me-2" />
                    Convert to Student
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistrationLinkManager;
