import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../components/DataTable';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const TestList = () => {
  const navigate = useNavigate();
  const [tests] = useState([
    { id: 1, testName: 'N5 Midterm Exam',  course: 'Japanese N5', totalMarks: 100, passingMarks: 60, testDate: '2024-03-15', createdBy: 'Yamamoto Keiko' },
    { id: 2, testName: 'N4 Progress Test', course: 'Japanese N4', totalMarks: 100, passingMarks: 65, testDate: '2024-03-20', createdBy: 'Tanaka Hiroshi' },
    { id: 3, testName: 'N5 Final Exam',    course: 'Japanese N5', totalMarks: 150, passingMarks: 90, testDate: '2024-06-01', createdBy: 'Yamamoto Keiko' },
  ]);
  const columns = [
    { header: '#', accessor: 'id' },
    { header: 'Test Name', accessor: 'testName' },
    { header: 'Course', accessor: 'course' },
    { header: 'Total Marks', accessor: 'totalMarks' },
    { header: 'Pass Marks', accessor: 'passingMarks' },
    { header: 'Date', accessor: 'testDate' },
    { header: 'Created By', accessor: 'createdBy' },
    { header: 'Actions', accessor: 'id', render: (r) => (
        <div style={{ display:'flex', gap:'0.25rem', justifyContent:'center' }}>
          <button className="action-icon update" onClick={(e)=>{ e.stopPropagation(); navigate(`/tests/${r.id}`); }}><Pencil size={13}/> Edit</button>
          <button className="action-icon delete" onClick={(e)=>{ e.stopPropagation(); }}><Trash2 size={13}/> Delete</button>
        </div>
      )
    },
  ];
  return (
    <div>
      <div className="page-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
        <div>
          <h1 className="page-title">Tests</h1>
          <p className="page-subtitle">Manage examinations and assessments.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/tests/new')}><Plus size={16}/> Create Test</button>
      </div>
      <DataTable columns={columns} data={tests} title="Tests" searchPlaceholder="Search tests..." />
    </div>
  );
};
export default TestList;
