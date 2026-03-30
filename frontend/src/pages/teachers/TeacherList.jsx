import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../components/DataTable';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const TeacherList = () => {
  const navigate = useNavigate();
  const [teachers] = useState([
    { id: 1, teacherCode: 'TCH001', name: 'Yamamoto Keiko', email: 'keiko@gicm.edu', department: 'Japanese Language', isActive: true },
    { id: 2, teacherCode: 'TCH002', name: 'Tanaka Hiroshi',  email: 'hiroshi@gicm.edu', department: 'Technical Skills', isActive: true },
    { id: 3, teacherCode: 'TCH003', name: 'Suzuki Aiko',    email: 'aiko@gicm.edu',    department: 'Japanese Culture', isActive: false },
  ]);

  const columns = [
    { header: '#',         accessor: 'id' },
    { header: 'Code',      accessor: 'teacherCode' },
    { header: 'Name',      accessor: 'name' },
    { header: 'Email',     accessor: 'email' },
    { header: 'Dept.',     accessor: 'department' },
    { header: 'Status',    accessor: 'isActive', render: (r) => <span className={`badge ${r.isActive ? 'badge-success' : 'badge-secondary'}`}>{r.isActive ? 'Active' : 'Inactive'}</span> },
    { header: 'Actions',   accessor: 'id', render: (r) => (
        <div style={{ display:'flex', gap:'0.25rem', justifyContent:'center' }}>
          <button className="action-icon update" onClick={(e)=>{ e.stopPropagation(); navigate(`/teachers/${r.id}`); }}><Pencil size={13}/> Edit</button>
          <button className="action-icon delete" onClick={(e)=>{ e.stopPropagation(); }}><Trash2 size={13}/> Delete</button>
        </div>
      )
    },
  ];

  return (
    <div>
      <div className="page-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
        <div>
          <h1 className="page-title">Teachers</h1>
          <p className="page-subtitle">View and manage teaching staff.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/teachers/new')}><Plus size={16}/> Add Teacher</button>
      </div>
      <DataTable columns={columns} data={teachers} title="Teachers" searchPlaceholder="Search teachers..." />
    </div>
  );
};
export default TeacherList;
