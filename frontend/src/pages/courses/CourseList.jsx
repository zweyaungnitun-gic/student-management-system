import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../components/DataTable';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const CourseList = () => {
  const navigate = useNavigate();
  const [courses] = useState([
    { id: 1, courseCode: 'JPN-N5', courseName: 'Japanese N5', creditHours: 4, teacher: 'Yamamoto Keiko', isActive: true },
    { id: 2, courseCode: 'JPN-N4', courseName: 'Japanese N4', creditHours: 4, teacher: 'Tanaka Hiroshi',  isActive: true },
    { id: 3, courseCode: 'JPN-N3', courseName: 'Japanese N3', creditHours: 4, teacher: 'Suzuki Aiko',    isActive: true },
    { id: 4, courseCode: 'TECH-01',courseName: 'Technical Japanese', creditHours: 2, teacher: 'Tanaka Hiroshi', isActive: false },
  ]);
  const columns = [
    { header: '#',    accessor: 'id' },
    { header: 'Code', accessor: 'courseCode' },
    { header: 'Course Name', accessor: 'courseName' },
    { header: 'Credits', accessor: 'creditHours' },
    { header: 'Teacher', accessor: 'teacher' },
    { header: 'Status', accessor: 'isActive', render: (r) => <span className={`badge ${r.isActive ? 'badge-success' : 'badge-secondary'}`}>{r.isActive ? 'Active' : 'Inactive'}</span> },
    { header: 'Actions', accessor: 'id', render: (r) => (
        <div style={{ display:'flex', gap:'0.25rem', justifyContent:'center' }}>
          <button className="action-icon update" onClick={(e)=>{ e.stopPropagation(); navigate(`/courses/${r.id}`); }}><Pencil size={13}/> Edit</button>
          <button className="action-icon delete" onClick={(e)=>{ e.stopPropagation(); }}><Trash2 size={13}/> Delete</button>
        </div>
      )
    },
  ];
  return (
    <div>
      <div className="page-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
        <div>
          <h1 className="page-title">Courses</h1>
          <p className="page-subtitle">Manage available courses and assigned teachers.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/courses/new')}><Plus size={16}/> Add Course</button>
      </div>
      <DataTable columns={columns} data={courses} title="Courses" searchPlaceholder="Search courses..." />
    </div>
  );
};
export default CourseList;
