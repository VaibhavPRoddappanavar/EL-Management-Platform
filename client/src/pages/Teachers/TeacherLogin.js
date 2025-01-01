import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
} from '@mui/material';
import { Login } from "@mui/icons-material";

const TeacherLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/teacher/login', formData);
      if (response.data.token) {
        setIsAuthenticated(true);
        setTimeout(() => {
          localStorage.setItem('teacherToken', response.data.token);
          localStorage.setItem('teacherData', JSON.stringify(response.data.teacher));
          navigate('/teacher/home');
        }, 2000);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: '50%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-150px',
            left: '-150px',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            backgroundColor: '#4481eb',
            opacity: 0.7,
            zIndex: -1,
            animation: isAuthenticated ? 'spiralGrowLeft 2s ease-in-out forwards' : 'none',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: '-100px',
            right: '-100px',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            backgroundColor: '#4481eb',
            opacity: 0.7,
            zIndex: -1,
            animation: isAuthenticated ? 'spiralGrowRight 2s ease-in-out forwards' : 'none',
          },
          '@keyframes spiralGrowLeft': {
            '0%': {
              transform: 'scale(1) rotate(0deg)',
            },
            '100%': {
              transform: 'scale(10) rotate(720deg)',
              opacity: 0,
            }
          },
          '@keyframes spiralGrowRight': {
            '0%': {
              transform: 'scale(1) rotate(0deg)',
            },
            '100%': {
              transform: 'scale(10) rotate(-720deg)',
              opacity: 0,
            }
          }
        }}
      >
        <Paper elevation={3} sx={{ 
          padding: 3,
          width: '120%',
          borderRadius: '10%',
          opacity: 1,
          animation: isAuthenticated ? 'fadeOut 1s ease-in-out forwards' : 'none',
          '@keyframes fadeOut': {
            '0%': {
              opacity: 1,
              transform: 'scale(1)',
            },
            '100%': {
              opacity: 0,
              transform: 'scale(0.8)',
            }
          }
        }}>
          <Typography 
            component="h1" 
            variant="h5" 
            align="center" 
            gutterBottom 
            sx={{ 
              color: '#1d4ed8',
              fontSize: '1.875rem',
              fontWeight: 600,
              fontStyle: 'Arial'
            }}
          >
            Teacher Login
          </Typography>
          {error && (
            <Typography color="error" align="center" gutterBottom>
              {error}
            </Typography>
          )}
          <form
            onSubmit={handleSubmit}
            style={{ 
              paddingLeft: '3%',
              paddingRight: '3%',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={handleChange}
              sx={{
                width: '95%',
                maxWidth: '600px',
                borderRadius: '10rem',
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10rem',
                  backgroundColor: '#f0f0f0',
                },
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              sx={{
                width: '95%',
                maxWidth: '600px',
                borderRadius: '10rem',
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10rem',
                  backgroundColor: '#f0f0f0',
                },
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                mb: 1,
                width: '40%',
                maxWidth: '600px',
                height: '50px',
                backgroundColor: '#4481eb',
                borderRadius: '10rem',
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10rem',
                },
              }}
              endIcon={<Login />}
            >
              Sign In
            </Button>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default TeacherLogin;
