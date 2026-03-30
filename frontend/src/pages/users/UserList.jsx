import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../components/DataTable';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const UserList = () => {
  const navigate = useNavigate();
  const [users] = useState([
    { id: 1, userId: 'USR-001', username: 'admin_gicm',    email: 'admin@gicm.edu',         role: 'ADMIN', schoolName: 'GICM',              createdAt: '2023-01-01' },
    { id: 2, userId: 'USR-002', username: 'guest_yamada',  email: 'yamada@school.ac.jp',    role: 'GUEST', schoolName: 'Yamada High School', createdAt: '2024-01-15' },
    { id: 3, userId: 'USR-003', username: 'guest_tanaka',  email: 'tanaka@partner.jp',      role: 'GUEST', schoolName: 'Tanaka College',     createdAt: '2024-02-10' },
  ]);
  const columns = [
    { header: '#',        accessor: 'id' },
    { header: 'User ID',  accessor: 'userId' },
    { header: 'Username', accessor: 'username' },
    { header: 'Email',    accessor: 'email' },
    { header: 'Role',     accessor: 'role', render: (r) => <span className={`badge ${r.role === 'ADMIN' ? 'badge-primary' : 'badge-warning'}`}>{r.role}</span> },
    { header: 'School',   accessor: 'schoolName' },
    { header: 'Created',  accessor: 'createdAt' },
    { header: 'Actions',  accessor: 'id', render: (r) => (
        <div style={{ display:'flex', gap:'0.25rem', justifyContent:'center' }}>
          <button className="action-icon update" onClick={(e)=>{ e.stopPropagation(); navigate(`/users/${r.id}/edit`); }}><Pencil size={13}/> Edit</button>
          <button className="action-icon delete" onClick={(e)=>{ e.stopPropagation(); }}><Trash2 size={13}/> Delete</button>
        </div>
      )
    },
  ];
  return (
    <div>
      <div className="page-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Manage admin and guest system accounts.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/users/new')}><Plus size={16}/> Add User</button>
      </div>
      <DataTable columns={columns} data={users} title="Users" searchPlaceholder="Search users..." />
    </div>
  );
};
export default UserList;
