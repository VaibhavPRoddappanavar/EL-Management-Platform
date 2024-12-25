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
} from '@mui/material';
import './TeacherDashboard.css';

const TeacherDashboard = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTheme, setSelectedTheme] = useState("All Teams");
  const [searchType, setSearchType] = useState("Name");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const themes = [
    "All Teams",
    "AI for Social Good",
    "AI in Education",
    "AR, VR & MR",
    "Artificial Intelligence",
    "Cloud Security",
    "Data Science and Analytics",
    "Edge Computing",
    "Ethical AI",
    "Internet of things",
    "Programming Mechanics(coding for App development)",
  ];

  const fetchTeams = async (theme) => {
    const token = localStorage.getItem('teacherToken');
    if (!token) {
      navigate('/teacher/login');
      return;
    }

    setLoading(true);
    try {
      const url = theme === "All Teams"
        ? 'http://localhost:5000/teacher/teams'
        : `http://localhost:5000/teacher/teams?theme=${encodeURIComponent(theme)}`;

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (Array.isArray(response.data)) {
        setTeams(response.data);
        setError(null);
      } else {
        console.error('Unexpected data format:', response.data);
        setError('Received invalid data format from server');
        setTeams([]);
      }
    } catch (error) {
      console.error('Error fetching teams:', error.response || error);
      setError(error.response?.data?.message || 'Failed to fetch teams');
      if (error.response?.status === 401) {
        localStorage.removeItem('teacherToken');
        navigate('/teacher/login');
      }
      setTeams([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams(selectedTheme);
  }, [selectedTheme, navigate]);

  const filteredTeams = teams.filter((team) => {
    if (!searchTerm) return true;
    
    const term = searchTerm.toLowerCase();
    if (searchType === "Name") {
      return (
        team.TeamLeaderName?.toLowerCase().includes(term) ||
        team.TeamMember1Name?.toLowerCase().includes(term) ||
        team.TeamMember2Name?.toLowerCase().includes(term) ||
        team.TeamMember3Name?.toLowerCase().includes(term) ||
        team.TeamMember4Name?.toLowerCase().includes(term)
      );
    } else if (searchType === "USN") {
      return (
        team.TeamLeaderUSN?.toLowerCase().includes(term) ||
        team.TeamMember1USN?.toLowerCase().includes(term) ||
        team.TeamMember2USN?.toLowerCase().includes(term) ||
        team.TeamMember3USN?.toLowerCase().includes(term) ||
        team.TeamMember4USN?.toLowerCase().includes(term)
      );
    }
    return true;
  });

  if (loading) {
    return (
      <Box className="loading-container">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container className="dashboard-container" maxWidth="xl">
      <Box className="dashboard-header">
        <Typography variant="h4" component="h1" gutterBottom>
          Teams Dashboard
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
      </Box>

      <Box className="filters-container" sx={{ mb: 3 }}>
        <FormControl sx={{ minWidth: 200, mr: 2 }}>
          <InputLabel>Filter by Theme</InputLabel>
          <Select
            value={selectedTheme}
            onChange={(e) => setSelectedTheme(e.target.value)}
            label="Filter by Theme"
          >
            {themes.map((theme) => (
              <MenuItem key={theme} value={theme}>
                {theme}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 120, mr: 2 }}>
          <InputLabel>Search by</InputLabel>
          <Select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            label="Search by"
          >
            <MenuItem value="Name">Name</MenuItem>
            <MenuItem value="USN">USN</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label={`Search by ${searchType}`}
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ minWidth: 200 }}
        />
      </Box>

      <Typography variant="h6" gutterBottom>
        Total Teams: {filteredTeams.length}
      </Typography>
      
      <TableContainer component={Paper} className="table-container">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Team Members</TableCell>
              <TableCell>USN</TableCell>
              <TableCell>Program</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Theme</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTeams.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No teams found
                </TableCell>
              </TableRow>
            ) : (
              filteredTeams.map((team) => (
                <TableRow key={team._id || Math.random()} className="table-row">
                  <TableCell>
                    <div className="member-cell">
                      <strong>{team.TeamLeaderName} (Lead)</strong>
                      {[1, 2, 3, 4].map((num) => 
                        team[`TeamMember${num}Name`] && (
                          <div key={num}>
                            {team[`TeamMember${num}Name`]}
                          </div>
                        )
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="member-cell">
                      <strong>{team.TeamLeaderUSN}</strong>
                      {[1, 2, 3, 4].map((num) => 
                        team[`TeamMember${num}USN`] && (
                          <div key={num}>
                            {team[`TeamMember${num}USN`]}
                          </div>
                        )
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="member-cell">
                      <strong>{team.TeamleaderProgram}</strong>
                      {[1, 2, 3, 4].map((num) => 
                        team[`TeamMember${num}Program`] && (
                          <div key={num}>
                            {team[`TeamMember${num}Program`]}
                          </div>
                        )
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="member-cell">
                      <strong>{team.TeamleaderEmailID}</strong>
                      {[1, 2, 3, 4].map((num) => 
                        team[`TeamMember${num}EmailID`] && (
                          <div key={num}>
                            {team[`TeamMember${num}EmailID`]}
                          </div>
                        )
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="member-cell">
                      <strong>{team.TeamleaderMobileNumber}</strong>
                      {[1, 2, 3, 4].map((num) => 
                        team[`TeamMember${num}MobileNumber`] && (
                          <div key={num}>
                            {team[`TeamMember${num}MobileNumber`]}
                          </div>
                        )
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{team.Theme}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default TeacherDashboard;
