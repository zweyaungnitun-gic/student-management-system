import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../components/DataTable';
import { Plus } from 'lucide-react';

const ResultList = () => {
  const navigate = useNavigate();
  const [results] = useState([
    { id: 1, student: 'John Doe',       test: 'N5 Midterm Exam',  score: 85, total: 100, grade: 'A',  gpa: '4.0', pct: '85%', result: 'PASS' },
    { id: 2, student: 'Jane Smith',     test: 'N4 Progress Test', score: 62, total: 100, grade: 'C',  gpa: '2.0', pct: '62%', result: 'PASS' },
    { id: 3, student: 'Robert Johnson', test: 'N5 Midterm Exam',  score: 45, total: 100, grade: 'F',  gpa: '0.0', pct: '45%', result: 'FAIL' },
  ]);
  const columns = [
    { header: '#', accessor: 'id' },
    { header: 'Student', accessor: 'student' },
    { header: 'Test',    accessor: 'test' },
    { header: 'Score',   accessor: 'score', render: (r) => `${r.score} / ${r.total}` },
    { header: '%',       accessor: 'pct' },
    { header: 'Grade',   accessor: 'grade', render: (r) => <span style={{ fontWeight: 700 }}>{r.grade}</span> },
    { header: 'GPA',     accessor: 'gpa' },
    { header: 'Result',  accessor: 'result', render: (r) => <span className={`badge ${r.result === 'PASS' ? 'badge-success' : 'badge-danger'}`}>{r.result}</span> },
    { header: 'Actions', accessor: 'id', render: (r) => (
        <button className="action-icon update" onClick={(e)=>{ e.stopPropagation(); navigate(`/results/${r.id}`); }}>Edit</button>
      )
    },
  ];
  return (
    <div>
      <div className="page-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
        <div>
          <h1 className="page-title">Test Results</h1>
          <p className="page-subtitle">View and manage student examination scores.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/results/new')}><Plus size={16}/> Enter Result</button>
      </div>
      <DataTable columns={columns} data={results} title="Test Results" searchPlaceholder="Search results..." />
    </div>
  );
};
export default ResultList;
