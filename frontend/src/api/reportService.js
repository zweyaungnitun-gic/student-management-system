import client from './client';

export const reportService = {
  // Get student grade summary
  getStudentGradeSummary: async (studentId, academicYear = '2024-2025', semester = 'Semester 1', page = 1, size = 10) => {
    const response = await client.get(`/reports/student/${studentId}`, {
      params: { academicYear, semester, page, size }
    });
    return response.data;
  },

  // Generate/Get report card
  getReportCard: async (studentId, academicYear = '2024-2025', semester = 'Semester 1') => {
    const response = await client.get(`/reports/report-card/${studentId}`, {
      params: { academicYear, semester }
    });
    return response.data;
  },

  // Get class rankings
  getClassRankings: async (className = 'N5', academicYear = '2024-2025', semester = 'Semester 1') => {
    const response = await client.get('/reports/rankings', {
      params: { className, academicYear, semester }
    });
    return response.data;
  },

  // Get test statistics
  getTestStatistics: async (testId) => {
    const response = await client.get(`/reports/test/${testId}/statistics`);
    return response.data;
  },

  // Get all report cards for a student
  getStudentReportCards: async (studentId) => {
    const response = await client.get(`/reports/student/${studentId}/all`);
    return response.data;
  },

  // Export report card as PDF
  exportReportCard: async (studentId, academicYear, semester) => {
    const response = await client.get(`/reports/report-card/${studentId}/export`, {
      params: { academicYear, semester },
      responseType: 'blob'
    });
    return response.data;
  }
};