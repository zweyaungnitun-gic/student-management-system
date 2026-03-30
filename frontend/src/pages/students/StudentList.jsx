import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminTable from '../../components/DataTable';

const StudentList = () => {
  const navigate = useNavigate();
  const [students] = useState([
    { id: 1, studentId: 'ST-001', studentName: 'John Doe',       gender: 'Male',   phoneNumber: '09-111-1111', status: '在校', desiredJobType: 'IT Engineer' },
    { id: 2, studentId: 'ST-002', studentName: 'Jane Smith',     gender: 'Female', phoneNumber: '09-222-2222', status: '卒業', desiredJobType: 'Interpreter' },
    { id: 3, studentId: 'ST-003', studentName: 'Robert Johnson', gender: 'Male',   phoneNumber: '09-333-3333', status: '在校', desiredJobType: 'IT Engineer' },
  ]);

  const columns = [
    { header: 'Student ID',  accessor: 'studentId' },
    { header: 'Name',        accessor: 'studentName' },
    { header: 'Gender',      accessor: 'gender' },
    { header: 'Phone',       accessor: 'phoneNumber' },
    { header: 'Job Type',    accessor: 'desiredJobType' },
    { header: 'Status',      accessor: 'status' },
    {
      header: 'Actions', accessor: 'id',
      render: (r) => (
        <div className="d-flex flex-nowrap justify-content-center gap-2">
          <a href="#" className="action-icon-link text-decoration-none text-info" title="Detail"
            onClick={(e) => { e.preventDefault(); navigate(`/students/${r.id}`); }}>
            <i className="bi bi-info-circle"></i>
          </a>
          <a href="#" className="action-icon-link text-decoration-none text-primary" title="Edit"
            onClick={(e) => { e.preventDefault(); navigate(`/students/${r.id}/edit`); }}>
            <i className="bi bi-pencil-square"></i>
          </a>
          <a href="#" className="action-icon-link text-decoration-none text-success" title="Enroll"
            onClick={(e) => { e.preventDefault(); navigate(`/enrollments/new`); }}>
            <i className="bi bi-person-plus-fill"></i>
          </a>
          <a href="#" className="action-icon-link text-decoration-none text-success" title="Report"
            onClick={(e) => { e.preventDefault(); navigate(`/reports`); }}>
            <i className="bi bi-bar-chart-fill"></i>
          </a>
          <a href="#" className="action-icon-link text-decoration-none text-danger" title="Delete"
            onClick={(e) => { e.preventDefault(); if (window.confirm('Delete this student?')) {} }}>
            <i className="bi bi-trash-fill"></i>
          </a>
        </div>
      )
    },
  ];

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="fw-bold mb-1">Student Management</h4>
          <p className="text-muted small mb-0">Manage and view all registered students.</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => navigate('/students/new')}>
          <i className="bi bi-person-plus me-1"></i>Add Student
        </button>
      </div>
      <AdminTable
        title="生徒情報管理システム"
        columns={columns}
        data={students}
        onRowClick={(r) => navigate(`/students/${r.id}`)}
        searchPlaceholder="Search by name or ID..."
      />
    </>
  );
};

export default StudentList;
