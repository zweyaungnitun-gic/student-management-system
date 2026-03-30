import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../components/DataTable';
import { Eye } from 'lucide-react';

const RegistrationList = () => {
  const navigate = useNavigate();
  const [rows] = useState([
    { id: 1, registrationCode: 'REG-2024-001', englishName: 'Aung Ko Ko',  nationalIdNumber: '12/LAKANA(N)001234', submittedAt: '2024-01-15', status: 'PENDING',   gender: 'Male' },
    { id: 2, registrationCode: 'REG-2024-002', englishName: 'Ma Thandar',  nationalIdNumber: '12/LAKANA(N)005678', submittedAt: '2024-01-20', status: 'ACCEPTED',  gender: 'Female' },
    { id: 3, registrationCode: 'REG-2024-003', englishName: 'Kyaw Zin',    nationalIdNumber: '12/LAKANA(N)009012', submittedAt: '2024-01-22', status: 'REJECTED',  gender: 'Male' },
    { id: 4, registrationCode: 'REG-2024-004', englishName: 'Su Su Yi',    nationalIdNumber: '12/LAKANA(N)003456', submittedAt: '2024-02-01', status: 'PENDING',   gender: 'Female' },
  ]);
  const statusMap = { PENDING: 'badge-warning', ACCEPTED: 'badge-success', REJECTED: 'badge-danger' };
  const columns = [
    { header: '#',          accessor: 'id' },
    { header: 'Reg. Code',  accessor: 'registrationCode' },
    { header: 'Full Name',  accessor: 'englishName' },
    { header: 'National ID',accessor: 'nationalIdNumber' },
    { header: 'Gender',     accessor: 'gender' },
    { header: 'Submitted',  accessor: 'submittedAt' },
    { header: 'Status',     accessor: 'status', render: (r) => <span className={`badge ${statusMap[r.status]}`}>{r.status}</span> },
    { header: 'Action',     accessor: 'id', render: (r) => (
        <button className="action-icon detail" onClick={(e)=>{ e.stopPropagation(); navigate(`/registrations/${r.id}`); }}><Eye size={13}/> Review</button>
      )
    },
  ];
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Registrations</h1>
        <p className="page-subtitle">Review and process incoming student registration applications.</p>
      </div>
      <DataTable columns={columns} data={rows} title="Registration Applications" onRowClick={(r)=>navigate(`/registrations/${r.id}`)} searchPlaceholder="Search by name or code..." />
    </div>
  );
};
export default RegistrationList;
