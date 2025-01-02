import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Grid,
  MenuItem,
  Paper,
  Tab,
  Tabs,
  TextField,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./TeacherDashboard.css";
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import GroupsIcon from '@mui/icons-material/Groups';
import PeopleIcon from '@mui/icons-material/People';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import LogoutIcon from '@mui/icons-material/Logout';

const MARKING_CRITERIA = {
  Phase1: {
    totalMarks: 20,
    criteria: [
      { name: 'Problem Definition', maxMarks: 10, description: 'Clarity, relevance, context' },
      { name: 'Objectives', maxMarks: 5, description: 'Specificity, alignment, achievability' },
      { name: 'Methodology', maxMarks: 5, description: 'Appropriateness, detail, flowchart' }
    ]
  },
  Phase2: {
    totalMarks: 30,
    criteria: [
      { name: 'Project Execution', maxMarks: 15, description: 'Adherence, timeliness, quality' },
      { name: 'Tools/Techniques', maxMarks: 10, description: 'Selection, application, integration' },
      { name: 'Partial Results', maxMarks: 5, description: 'Clarity, progress, analysis' }
    ]
  },
  Phase3: {
    totalMarks: 50,
    criteria: [
      { name: 'Prototype Demo', maxMarks: 20, description: 'Functionality, innovation, usability' },
      { name: 'Results/Discussion', maxMarks: 10, description: 'Clarity, analysis, interpretation' },
      { name: 'Report', maxMarks: 10, description: 'Organization, clarity, completeness' },
      { name: 'Poster/PPT', maxMarks: 10, description: 'Visual appeal, clarity, content' }
    ]
  }
};

const RATING_SCALE = [
  { label: 'Excellent', value: 1.0 },
  { label: 'Very Good', value: 0.8 },
  { label: 'Good', value: 0.6 },
  { label: 'Satisfactory', value: 0.4 },
  { label: 'Needs Improvement', value: 0.2 }
];

const TeacherDashboard = () => {
  const [value, setValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [teacherData, setTeacherData] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [phase, setPhase] = useState("");
  const [studentMarks, setStudentMarks] = useState([]);
  const [generalFeedback, setGeneralFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [teamCriteria, setTeamCriteria] = useState({});
  const [existingMarks, setExistingMarks] = useState(null);
  const [showIndividualMarks, setShowIndividualMarks] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [open, setOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const sidebarWidth = isHovered || isMobile ? 240 : 65;

  useEffect(() => {
    const token = localStorage.getItem("teacherToken");
    if (!token) {
      navigate("/teacher/login");
      return;
    }

    const fetchTeacherData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/teacher/profile",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setTeacherData(response.data);
      } catch (error) {
        console.error("Error fetching teacher data:", error);
        if (error.response?.status === 401) {
          localStorage.removeItem("teacherToken");
          navigate("/teacher/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("teacherToken");
    navigate("/teacher/login");
  };

  const initializeTeamCriteria = () => {
    const criteria = MARKING_CRITERIA[phase]?.criteria || [];
    return criteria.reduce((acc, c) => ({ ...acc, [c.name]: 0 }), {});
  };

  const handleAssignMarks = (team) => {
    setSelectedTeam(team);
    setTeamCriteria(initializeTeamCriteria());
    const students = [
      {
        email: team.TeamleaderEmailID,
        name: team.TeamLeaderName,
        usn: team.TeamLeaderUSN,
        marks: 0,
        feedback: ""
      },
      {
        email: team.TeamMember1EmailID,
        name: team.TeamMember1Name,
        usn: team.TeamMember1USN,
        marks: 0,
        feedback: ""
      },
      {
        email: team.TeamMember2EmailID,
        name: team.TeamMember2Name,
        usn: team.TeamMember2USN,
        marks: 0,
        feedback: ""
      },
      {
        email: team.TeamMember3EmailID,
        name: team.TeamMember3Name,
        usn: team.TeamMember3USN,
        marks: 0,
        feedback: ""
      },
      {
        email: team.TeamMember4EmailID,
        name: team.TeamMember4Name,
        usn: team.TeamMember4USN,
        marks: 0,
        feedback: ""
      }
    ].filter(s => s.email);
    
    setStudentMarks(students);
  };

  const handlePhaseChange = async (event) => {
    const selectedPhase = event.target.value;
    setPhase(selectedPhase);
    
    if (selectedTeam) {
      try {
        const token = localStorage.getItem("teacherToken");
        const response = await axios.get(
          `http://localhost:5000/api/teachers/marks/team-marks/${selectedTeam._id}/${selectedPhase}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        
        if (response.data) {
          const confirmEdit = window.confirm(
            "Marks already exist for this phase. Would you like to edit them?"
          );
          
          if (confirmEdit) {
            const existingStudentMarks = response.data.studentMarks.map(mark => ({
              email: mark.studentEmail,
              name: mark.studentName,
              usn: mark.studentUSN,
              marks: mark.marks,
              feedback: mark.feedback || ""
            }));
            setStudentMarks(existingStudentMarks);
            setGeneralFeedback(response.data.generalFeedback || "");
          } else {
            handleAssignMarks(selectedTeam);
          }
        } else {
          handleAssignMarks(selectedTeam);
        }
      } catch (error) {
        console.error("Error fetching existing marks:", error);
        handleAssignMarks(selectedTeam);
      }
    }
  };

  const handleTeamCriteriaChange = (criteriaName, value) => {
    const maxMarks = MARKING_CRITERIA[phase].criteria.find(c => c.name === criteriaName).maxMarks;
    const newValue = Math.min(maxMarks, Math.max(0, Number(value)));
    
    setTeamCriteria(prev => ({
      ...prev,
      [criteriaName]: newValue
    }));

    // Update all students' marks with the team total
    const newTotal = Object.values({
      ...teamCriteria,
      [criteriaName]: newValue
    }).reduce((sum, mark) => sum + Number(mark), 0);

    setStudentMarks(prev => 
      prev.map(student => ({
        ...student,
        marks: newTotal
      }))
    );
  };

  const handleIndividualMarksChange = (studentIndex, value) => {
    const maxMarks = MARKING_CRITERIA[phase].totalMarks;
    const newValue = Math.min(maxMarks, Math.max(0, Number(value)));
    
    setStudentMarks(prev => {
      const newMarks = [...prev];
      newMarks[studentIndex] = {
        ...newMarks[studentIndex],
        marks: newValue
      };
      return newMarks;
    });
  };

  const handleIndividualFeedbackChange = (studentIndex, value) => {
    setStudentMarks(prev => {
      const newMarks = [...prev];
      newMarks[studentIndex] = {
        ...newMarks[studentIndex],
        feedback: value
      };
      return newMarks;
    });
  };

  const calculateTeamTotal = () => {
    return Object.values(teamCriteria).reduce((sum, mark) => sum + Number(mark), 0);
  };

  const handleSubmit = async () => {
    if (!selectedTeam || !phase) {
      toast.error("Please select a team and phase");
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem("teacherToken");
      const marksData = {
        teamId: selectedTeam._id,
        phase,
        studentMarks: studentMarks.map(student => ({
          email: student.email,
          name: student.name,
          usn: student.usn,
          marks: student.marks,
          feedback: student.feedback || ''
        })),
        generalFeedback: generalFeedback || ''
      };

      await axios.post(
        "http://localhost:5000/api/teachers/marks/submit-marks",
        marksData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Marks submitted successfully");
      setSelectedTeam(null);
      setPhase("");
      setStudentMarks([]);
      setGeneralFeedback("");
    } catch (error) {
      console.error("Error submitting marks:", error);
      toast.error("Error submitting marks");
    } finally {
      setSubmitting(false);
    }
  };

  const renderTeams = () => (
    <Grid container spacing={3}>
      {teacherData?.assignedTeams?.map((team) => (
        <Grid item xs={12} md={6} key={team._id}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" color="primary" gutterBottom>
                {team.TeamName}
              </Typography>
              <Typography variant="subtitle2" color="textSecondary">
                Theme: {team.Theme}
              </Typography>
　
 　　　　　
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  Team Lead:
                </Typography>
                <Typography variant="body2">
                  {team.TeamLeaderName} ({team.TeamLeaderUSN})
                </Typography>
                <Typography variant="body2">
                  Email: {team.TeamleaderEmailID}
                </Typography>
                <Typography variant="body2">
                  Phone: {team.TeamleaderMobileNumber}
                </Typography>
              </Box>

              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  Team Members:
                </Typography>
                
                {team.TeamMember1Name && (
                  <Box sx={{ ml: 2, mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      • {team.TeamMember1Name} ({team.TeamMember1USN})
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Email: {team.TeamMember1EmailID}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Phone: {team.TeamMember1MobileNumber}
                    </Typography>
                  </Box>
                )}

                {team.TeamMember2Name && (
                  <Box sx={{ ml: 2, mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      • {team.TeamMember2Name} ({team.TeamMember2USN})
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Email: {team.TeamMember2EmailID}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Phone: {team.TeamMember2MobileNumber}
                    </Typography>
                  </Box>
                )}

                {team.TeamMember3Name && (
                  <Box sx={{ ml: 2, mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      • {team.TeamMember3Name} ({team.TeamMember3USN})
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Email: {team.TeamMember3EmailID}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Phone: {team.TeamMember3MobileNumber}
                    </Typography>
                  </Box>
                )}

                {team.TeamMember4Name && (
                  <Box sx={{ ml: 2, mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      • {team.TeamMember4Name} ({team.TeamMember4USN})
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Email: {team.TeamMember4EmailID}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Phone: {team.TeamMember4MobileNumber}
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderMarksManagement = () => {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card variant="outlined">
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    select
                    fullWidth
                    label="Select Team"
                    value={selectedTeam?._id || ""}
                    onChange={(e) => {
                      const team = teacherData.assignedTeams.find(t => t._id === e.target.value);
                      handleAssignMarks(team);
                    }}
                  >
                    {teacherData?.assignedTeams?.map((team) => (
                      <MenuItem key={team._id} value={team._id}>
                        {team.TeamName} - {team.Theme} (Lead: {team.TeamLeaderName})
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    select
                    fullWidth
                    label="Phase"
                    value={phase}
                    onChange={handlePhaseChange}
                  >
                    <MenuItem value="Phase1">Phase 1</MenuItem>
                    <MenuItem value="Phase2">Phase 2</MenuItem>
                    <MenuItem value="Phase3">Phase 3</MenuItem>
                  </TextField>
                </Grid>

                {selectedTeam && phase && (
                  <Grid item xs={12}>
                    <Card variant="outlined" sx={{ mb: 3, backgroundColor: '#f5f5f5' }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Assign Marks for {selectedTeam.TeamName} - {phase}
                        </Typography>
                        <Card>
                          <CardContent>
                            <Typography variant="h6" gutterBottom>
                              Team Assessment for {selectedTeam.TeamName} - {phase}
                            </Typography>
                            
                            {/* Team Criteria Section */}
                            <Box mb={4}>
                              <Typography variant="subtitle1" gutterBottom color="primary">
                                Team Evaluation (Total Marks: {MARKING_CRITERIA[phase].totalMarks})
                              </Typography>
                              {MARKING_CRITERIA[phase].criteria.map((criterion) => (
                                <Box key={criterion.name} mb={2}>
                                  <Typography variant="subtitle2" gutterBottom>
                                    {criterion.name} (Max: {criterion.maxMarks})
                                  </Typography>
                                  <Typography variant="body2" color="textSecondary" gutterBottom>
                                    {criterion.description}
                                  </Typography>
                                  <TextField
                                    type="number"
                                    value={teamCriteria[criterion.name] || 0}
                                    onChange={(e) => handleTeamCriteriaChange(criterion.name, e.target.value)}
                                    fullWidth
                                    InputProps={{
                                      inputProps: {
                                        min: 0,
                                        max: criterion.maxMarks
                                      }
                                    }}
                                  />
                                </Box>
                              ))}
                              <Typography variant="h6" gutterBottom color="primary" mt={2}>
                                Team Total: {calculateTeamTotal()} / {MARKING_CRITERIA[phase].totalMarks}
                              </Typography>
                            </Box>

                            {/* Individual Marks Toggle */}
                            <Box mb={3}>
                              <Button
                                variant="outlined"
                                onClick={() => setShowIndividualMarks(!showIndividualMarks)}
                                startIcon={showIndividualMarks ? <RemoveIcon /> : <AddIcon />}
                              >
                                {showIndividualMarks ? "Hide" : "Show"} Individual Marks
                              </Button>
                            </Box>

                            {/* Individual Marks Section */}
                            {showIndividualMarks && (
                              <Box>
                                <Typography variant="subtitle1" gutterBottom color="primary">
                                  Individual Marks Adjustment
                                </Typography>
                                <Grid container spacing={2}>
                                  {studentMarks.map((student, index) => (
                                    <Grid item xs={12} key={student.email}>
                                      <Paper elevation={3} sx={{ p: 2 }}>
                                        <Typography variant="subtitle2" gutterBottom>
                                          {student.name} ({student.usn})
                                        </Typography>
                                        <Grid container spacing={2}>
                                          <Grid item xs={12} md={6}>
                                            <TextField
                                              label="Marks"
                                              type="number"
                                              value={student.marks}
                                              onChange={(e) => handleIndividualMarksChange(index, e.target.value)}
                                              fullWidth
                                              InputProps={{
                                                inputProps: {
                                                  min: 0,
                                                  max: MARKING_CRITERIA[phase].totalMarks
                                                }
                                              }}
                                            />
                                          </Grid>
                                          <Grid item xs={12}>
                                            <TextField
                                              label="Individual Feedback"
                                              multiline
                                              rows={3}
                                              value={student.feedback}
                                              onChange={(e) => handleIndividualFeedbackChange(index, e.target.value)}
                                              fullWidth
                                              placeholder="Enter feedback for this student..."
                                            />
                                          </Grid>
                                        </Grid>
                                      </Paper>
                                    </Grid>
                                  ))}
                                </Grid>
                              </Box>
                            )}

                            {/* Team Feedback Section */}
                            <Box mt={4}>
                              <Typography variant="subtitle1" gutterBottom color="primary">
                                Team Feedback
                              </Typography>
                              <TextField
                                label="General Team Feedback"
                                multiline
                                rows={4}
                                value={generalFeedback}
                                onChange={(e) => setGeneralFeedback(e.target.value)}
                                fullWidth
                                placeholder="Enter general feedback for the entire team..."
                              />
                            </Box>
                          </CardContent>
                        </Card>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        {selectedTeam && phase && (
          <Grid item xs={12}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleSubmit}
              disabled={submitting}
              sx={{ mt: 2 }}
            >
              {submitting ? <CircularProgress size={24} /> : "Submit Marks"}
            </Button>
          </Grid>
        )}
      </Grid>
    );
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
        boxShadow: isMobile ? 'none' : '4px 0 10px -3px rgba(0,0,0,0.1)'
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {!isMobile && (
        <Box
          component="nav"
          sx={{
            width: sidebarWidth,
            flexShrink: 0,
            height: '100vh',
            position: 'fixed',
            zIndex: 1200,
            transition: 'all 0.3s ease'
          }}
        >
          {sidebarContent}
        </Box>
      )}

      <Container 
        component="main" 
        sx={{ 
          flexGrow: 1,
          p: 0,
          marginLeft: !isMobile ? `${sidebarWidth}px` : 0,
          transition: 'margin-left 0.3s ease'
        }}
      >
        <Paper elevation={3} sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <div>
              <Typography variant="h4" gutterBottom>
                Welcome, {teacherData?.name}
              </Typography>
              <Typography variant="subtitle1" color="textSecondary">
                Department: {teacherData?.department}
              </Typography>
              <Typography variant="subtitle1" color="textSecondary">
                Designation: {teacherData?.designation}
              </Typography>
            </div>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </Box>

          <Box sx={{ borderBottom: 1, borderColor: "divider", mt: 3 }}>
            <Tabs value={value} onChange={(e, newValue) => setValue(newValue)}>
              <Tab label="My Teams" />
              <Tab label="Marks Management" />
            </Tabs>
          </Box>

          <Box sx={{ mt: 3 }}>
            {value === 0 && renderTeams()}
            {value === 1 && renderMarksManagement()}
          </Box>
        </Paper>
      </Container>

      {isMobile && (
        <Drawer
          anchor="left"
          open={open}
          onClose={() => setOpen(false)}
        >
          {sidebarContent}
        </Drawer>
      )}
    </Box>
  );
};

export default TeacherDashboard;
