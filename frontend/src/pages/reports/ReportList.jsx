import React, { useState } from 'react';
import { FileText, Download, TrendingUp } from 'lucide-react';

const ReportList = () => {
  const [reports] = useState([
    { id: 1, studentName: 'John Doe', studentId: 'ST-001', academicYear: '2023-2024', semester: 'S1', semesterGPA: 3.8, cumulativeGPA: 3.8, totalCredits: 8, passed: 2, failed: 0, standing: 'Good Standing', generatedDate: '2024-03-20' },
    { id: 2, studentName: 'Jane Smith', studentId: 'ST-002', academicYear: '2023-2024', semester: 'S1', semesterGPA: 2.5, cumulativeGPA: 2.5, totalCredits: 4, passed: 1, failed: 0, standing: 'Satisfactory', generatedDate: '2024-03-20' },
    { id: 3, studentName: 'Robert Johnson', studentId: 'ST-003', academicYear: '2023-2024', semester: 'S1', semesterGPA: 1.0, cumulativeGPA: 1.0, totalCredits: 4, passed: 0, failed: 1, standing: 'Academic Warning', generatedDate: '2024-03-20' },
  ]);

  const gpaColor = (gpa) => {
    if (gpa >= 3.5) return 'var(--accent-success)';
    if (gpa >= 2.0) return 'var(--accent-warning)';
    return 'var(--accent-danger)';
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', marginBottom: '0.5rem' }}>Report Cards</h1>
        <p style={{ color: 'var(--text-secondary)' }}>View and download student academic performance reports.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {reports.map((report) => (
          <div key={report.id} style={{ backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', padding: '1.5rem', transition: 'box-shadow var(--transition-fast)' }}
            onMouseOver={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-glow)'}
            onMouseOut={(e) => e.currentTarget.style.boxShadow = 'none'}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', margin: 0, color: 'var(--text-primary)' }}>{report.studentName}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: '0.25rem 0 0' }}>{report.studentId}</p>
              </div>
              <FileText size={20} style={{ color: 'var(--text-muted)' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              {[
                { label: 'Semester GPA', value: report.semesterGPA, colored: true },
                { label: 'Cumulative GPA', value: report.cumulativeGPA, colored: true },
                { label: 'Credits Earned', value: report.totalCredits },
                { label: 'Passed / Failed', value: `${report.passed} / ${report.failed}` },
              ].map(({ label, value, colored }) => (
                <div key={label} style={{ backgroundColor: 'var(--bg-base)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '700', marginTop: '0.25rem', color: colored ? gpaColor(value) : 'var(--text-primary)' }}>{value}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TrendingUp size={14} style={{ color: 'var(--text-muted)' }} />
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{report.standing}</span>
              </div>
              <button style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.375rem 0.875rem', backgroundColor: 'transparent', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)', fontSize: '0.8rem', cursor: 'pointer' }}
                onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; e.currentTarget.style.color = 'var(--accent-primary)'; }}
                onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
              >
                <Download size={13} /> Download PDF
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportList;
