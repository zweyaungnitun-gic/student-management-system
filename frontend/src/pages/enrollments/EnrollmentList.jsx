import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../components/DataTable';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const statusBadge = (status) => {
  const map = { enrolled: 'badge-success', pending: 'badge-warning', completed: 'badge-primary', dropped: 'badge-danger', failed: 'badge-secondary' };
  return <span className={`badge ${map[status] || 'badge-secondary'}`}>{status}</span>;
};

const EnrollmentList = () => {
  const navigate = useNavigate();
  const [rows] = useState([
    { id: 1, student: 'John Doe',      studentId: 'ST-001', course: 'Japanese N5', semester: '2024-S1', status: 'enrolled',  initiatedBy: 'admin' },
    { id: 2, student: 'Jane Smith',    studentId: 'ST-002', course: 'Japanese N4', semester: '2024-S1', status: 'pending',   initiatedBy: 'student' },
    { id: 3, student: 'Robert Johnson',studentId: 'ST-003', course: 'Japanese N5', semester: '2024-S1', status: 'completed', initiatedBy: 'admin' },
    { id: 4, student: 'Maria Garcia',  studentId: 'ST-004', course: 'Tech Japanese',semester: '2024-S1', status: 'dropped',  initiatedBy: 'student' },
  ]);
  const columns = [
    { header: '#',        accessor: 'id' },
    { header: 'Student',  accessor: 'student' },
    { header: 'Student ID',accessor: 'studentId' },
    { header: 'Course',   accessor: 'course' },
    { header: 'Semester', accessor: 'semester' },
    { header: 'By',       accessor: 'initiatedBy' },
    { header: 'Status',   accessor: 'status', render: (r) => statusBadge(r.status) },
    { header: 'Actions',  accessor: 'id', render: (r) => (
        <div style={{ display:'flex', gap:'0.25rem', justifyContent:'center' }}>
          <button className="action-icon update" onClick={(e)=>{ e.stopPropagation(); navigate(`/enrollments/${r.id}`); }}><Pencil size={13}/> Edit</button>
          <button className="action-icon delete" onClick={(e)=>{ e.stopPropagation(); }}><Trash2 size={13}/> Delete</button>
        </div>
      )
    },
  ];
  return (
    <div>
      <div className="page-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
        <div>
          <h1 className="page-title">Enrollments</h1>
          <p className="page-subtitle">Track student course enrollments.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/enrollments/new')}><Plus size={16}/> New Enrollment</button>
      </div>
      <DataTable columns={columns} data={rows} title="Enrollments" searchPlaceholder="Search enrollments..." />
    </div>
  );
};
export default EnrollmentList;
