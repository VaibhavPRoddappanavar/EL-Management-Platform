export const teacherAPI = {
  getAllTeachers: () => axios.get('/api/admin/teachers/teachers'),
  registerTeacher: (teacherData) => axios.post('/api/admin/teachers/register-teacher', teacherData),
  assignTeams: (teacherId, teamIds) => axios.post('/api/admin/teachers/assign-teams', { teacherId, teamIds }),
}; 