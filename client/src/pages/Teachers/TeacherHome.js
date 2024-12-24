import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
} from '@mui/material';

const TeacherHome = () => {
  const navigate = useNavigate();
  const [teacherData, setTeacherData] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('teacherToken');
    const teacher = localStorage.getItem('teacherData');
    
    if (!token) {
      navigate('/teacher/login');
      return;
    }

    if (teacher) {
      setTeacherData(JSON.parse(teacher));
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('teacherToken');
    localStorage.removeItem('teacherData');
    navigate('/teacher/login');
  };

  if (!teacherData) {
    return <div>Loading...</div>;
  }

  return (
    <Container component="main" maxWidth="md">
      <Box sx={{ marginTop: 4 }}>
        <Paper elevation={3} sx={{ padding: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Welcome, {teacherData.name}
          </Typography>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            {teacherData.designation}
          </Typography>
          <Typography variant="body1" gutterBottom>
            Email: {teacherData.email}
          </Typography>
          <Box sx={{ mt: 4 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default TeacherHome;
