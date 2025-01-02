import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Container,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
} from '@mui/material';
import GroupsIcon from '@mui/icons-material/Groups';
import PeopleIcon from '@mui/icons-material/People';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import LogoutIcon from '@mui/icons-material/Logout';
import './UnassignedStudents.css';

const UnassignedStudents = () => {
  const [isHovered, setIsHovered] = useState(false);
  const isMobile = useMediaQuery('(max-width:600px)');
  const sidebarWidth = isHovered || isMobile ? 240 : 70;
  
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const clusterDepartments = ["AI", "CS", "CD", "CY", "IS"];

  const handleLogout = () => {
    localStorage.removeItem('teacherToken');
    navigate('/teacher/login');
  };

  const sidebarContent = (
    <Box
      sx={{
        width: sidebarWidth,
        bgcolor: '#457ee0',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease',
        overflow: 'hidden',
        boxShadow: isMobile ? 'none' : '4px 0 10px -3px rgba(0,0,0,0.1)',
        position: 'fixed',
        left: 0,
        top: 0,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <List sx={{ flexGrow: 1, color: 'white' }}>
        <ListItem
          button
          onClick={() => navigate('/teacher/dashboard')}
          sx={{ 
            py: 2,
            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' },
            whiteSpace: 'nowrap'
          }}
        >
          <ListItemIcon sx={{ color: 'white', minWidth: 45 }}>
            <GroupsIcon />
          </ListItemIcon>
          <ListItemText 
            primary="View Teams" 
            sx={{ 
              opacity: (isHovered || isMobile) ? 1 : 0,
              transition: 'opacity 0.3s ease',
              width: 'auto'
            }}
          />
        </ListItem>
        <ListItem
          button
          onClick={() => navigate('/teacher/teams')}
          sx={{ 
            py: 2,
            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' },
            whiteSpace: 'nowrap'
          }}
        >
          <ListItemIcon sx={{ color: 'white', minWidth: 45 }}>
            <PeopleIcon />
          </ListItemIcon>
          <ListItemText 
            primary="All Teams" 
            sx={{ 
              opacity: (isHovered || isMobile) ? 1 : 0,
              transition: 'opacity 0.3s ease',
              width: 'auto'
            }}
          />
        </ListItem>
        <ListItem
          button
          onClick={() => navigate('/teacher/unassigned')}
          sx={{ 
            py: 2,
            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' },
            whiteSpace: 'nowrap'
          }}
        >
          <ListItemIcon sx={{ color: 'white', minWidth: 45 }}>
            <PersonAddIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Unassigned Students" 
            sx={{ 
              opacity: (isHovered || isMobile) ? 1 : 0,
              transition: 'opacity 0.5s ease',
              width: 'auto'
            }}
          />
        </ListItem>
      </List>
      <List sx={{ color: 'white' }}>
        <ListItem
          button
          onClick={handleLogout}
          sx={{ 
            py: 2,
            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' },
            whiteSpace: 'nowrap'
          }}
        >
          <ListItemIcon sx={{ color: 'white', minWidth: 45 }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Logout" 
            sx={{ 
              opacity: (isHovered || isMobile) ? 1 : 0,
              transition: 'opacity 0.3s ease',
              width: 'auto'
            }}
          />
        </ListItem>
      </List>
    </Box>
  );

  useEffect(() => {
    const fetchUnassignedStudents = async () => {
      const token = localStorage.getItem('teacherToken');
      if (!token) {
        navigate('/teacher/login');
        return;
      }

      setLoading(true);
      try {
        const response = await axios.get(
          "http://localhost:5000/teacher/unassigned",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        console.log('Fetched students:', response.data);
        setStudents(response.data);
        setError(null);
      } catch (error) {
        console.error("Error fetching unassigned students:", error);
        setError(error.response?.data?.message || 'Failed to fetch unassigned students');
        if (error.response?.status === 401) {
          localStorage.removeItem('teacherToken');
          navigate('/teacher/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUnassignedStudents();
  }, [navigate]);

  const filteredStudents = students.filter((student) => {
    const matchesDepartment = !selectedDepartment || student.departmentCode === selectedDepartment;
    const matchesSearch = !searchQuery || 
      student.Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.USN.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDepartment && matchesSearch;
  });

  if (loading) {
    return (
      <Box className="loading-container">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex' }}>
      {sidebarContent}
      <Container 
        className="dashboard-container" 
        maxWidth="xl" 
        sx={{ 
          marginLeft: `${sidebarWidth}px`,
          transition: 'margin-left 0.3s ease',
          width: `calc(100% - ${sidebarWidth}px)`,
          padding: '20px'
        }}
      >
        <Box className="dashboard-header">
          <Typography variant="h4" component="h1" gutterBottom>
            Unassigned Students
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
        </Box>

        <Box className="filters-container" sx={{ mb: 3 }}>
          <FormControl sx={{ minWidth: 200, mr: 2 }}>
            <InputLabel>Filter by Department</InputLabel>
            <Select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              label="Filter by Department"
            >
              <MenuItem value="">All Departments</MenuItem>
              {clusterDepartments.map((dept) => (
                <MenuItem key={dept} value={dept}>
                  {dept}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Search by Name or USN"
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ minWidth: 200 }}
          />
        </Box>

        <Typography variant="h6" gutterBottom>
          Total Unassigned Students: {filteredStudents.length}
        </Typography>
        
        <TableContainer component={Paper} className="table-container">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>USN</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Email</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No unassigned students found
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((student) => (
                  <TableRow key={student.USN} className="table-row">
                    <TableCell>{student.Name}</TableCell>
                    <TableCell>{student.USN}</TableCell>
                    <TableCell>{student.departmentCode}</TableCell>
                    <TableCell>{student.email}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </Box>
  );
};

export default UnassignedStudents;
