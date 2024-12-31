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
  Typography
} from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./TeacherDashboard.css";

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
    totalMarks: 50,
    criteria: [
      { name: 'Project Execution', maxMarks: 15, description: 'Adherence, timeliness, quality' },
      { name: 'Tools/Techniques', maxMarks: 10, description: 'Selection, application, integration' },
      { name: 'Partial Results', maxMarks: 5, description: 'Clarity, progress, analysis' }
    ]
  },
  Phase3: {
    totalMarks: 100,
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
  const navigate = useNavigate();

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

  const handleAssignMarks = (team) => {
    setSelectedTeam(team);
    const students = [
      {
        email: team.TeamleaderEmailID,
        name: team.TeamLeaderName,
        usn: team.TeamLeaderUSN,
        marks: "",
        feedback: "",
      },
      {
        email: team.TeamMember1EmailID,
        name: team.TeamMember1Name,
        usn: team.TeamMember1USN,
        marks: "",
        feedback: "",
      },
      {
        email: team.TeamMember2EmailID,
        name: team.TeamMember2Name,
        usn: team.TeamMember2USN,
        marks: "",
        feedback: "",
      },
      {
        email: team.TeamMember3EmailID,
        name: team.TeamMember3Name,
        usn: team.TeamMember3USN,
        marks: "",
        feedback: "",
      },
      {
        email: team.TeamMember4EmailID,
        name: team.TeamMember4Name,
        usn: team.TeamMember4USN,
        marks: "",
        feedback: "",
      },
    ].filter((s) => s.email);
    setStudentMarks(students);
  };

  const handleSubmitMarks = async () => {
    if (!phase) {
      toast.error("Please select a phase");
      return;
    }
    setSubmitting(true);

    try {
      const token = localStorage.getItem("teacherToken");
      await axios.post(
        "http://localhost:5000/api/teachers/marks/submit-marks",
        {
          teamId: selectedTeam._id,
          phase,
          studentMarks,
          generalFeedback,
          isUpdate: !!existingMarks
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      const message = existingMarks 
        ? "Marks updated successfully" 
        : "Marks submitted successfully";
      toast.success(message);
      
      setSelectedTeam(null);
      setPhase("");
      setGeneralFeedback("");
      setExistingMarks(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Error submitting marks");
    } finally {
      setSubmitting(false);
    }
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
            // Transform the marks data to match the expected format
            const transformedMarks = response.data.studentMarks.map(mark => ({
              email: mark.studentEmail,
              name: mark.studentName,
              usn: mark.studentUSN,
              marks: mark.marks.toString(),
              feedback: mark.individualFeedback || ""
            }));
            setStudentMarks(transformedMarks);
            setGeneralFeedback(response.data.generalFeedback || "");
            setExistingMarks(response.data);
          } else {
            // Reset phase if user doesn't want to edit
            setPhase("");
          }
        } else {
          setExistingMarks(null);
          // Initialize empty marks for the team
          handleAssignMarks(selectedTeam);
        }
      } catch (error) {
        console.error("Error fetching existing marks:", error);
        toast.error("Error checking existing marks");
      }
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
    const currentCriteria = phase ? MARKING_CRITERIA[phase] : null;

    const handleCriteriaChange = (criteriaName, rating) => {
      const criteria = MARKING_CRITERIA[phase].criteria.find(c => c.name === criteriaName);
      const maxMarks = criteria.maxMarks;
      const marks = maxMarks * rating;

      setTeamCriteria(prev => ({
        ...prev,
        [criteriaName]: { rating, marks }
      }));

      // Calculate total marks and update all students
      const totalMarks = Object.values(teamCriteria).reduce((sum, item) => sum + item.marks, 0) + marks;
      const updatedMarks = studentMarks.map(student => ({
        ...student,
        marks: totalMarks
      }));
      setStudentMarks(updatedMarks);
    };

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

                {selectedTeam && currentCriteria && (
                  <>
                    <Grid item xs={12}>
                      <Card variant="outlined" sx={{ mb: 3, backgroundColor: '#f5f5f5' }}>
                        <CardContent>
                          <Typography variant="h6" gutterBottom color="primary">
                            {phase} Assessment (Total: {currentCriteria.totalMarks} marks)
                          </Typography>
                          
                          {currentCriteria.criteria.map((criteria) => (
                            <Box key={criteria.name} sx={{ mb: 3 }}>
                              <Typography variant="subtitle1" gutterBottom>
                                {criteria.name} (Max: {criteria.maxMarks} marks)
                              </Typography>
                              <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                                {criteria.description}
                              </Typography>
                              <TextField
                                select
                                fullWidth
                                label="Rating"
                                value={teamCriteria[criteria.name]?.rating || ''}
                                onChange={(e) => handleCriteriaChange(criteria.name, parseFloat(e.target.value))}
                                sx={{ mt: 1 }}
                              >
                                {RATING_SCALE.map((rating) => (
                                  <MenuItem key={rating.label} value={rating.value}>
                                    {rating.label} ({(rating.value * criteria.maxMarks).toFixed(1)} marks)
                                  </MenuItem>
                                ))}
                              </TextField>
                            </Box>
                          ))}

                          <Box sx={{ mt: 3 }}>
                            <Typography variant="subtitle1" gutterBottom>
                              Total Marks: {studentMarks[0]?.marks || 0} / {currentCriteria.totalMarks}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Team Feedback"
                        value={generalFeedback}
                        onChange={(e) => setGeneralFeedback(e.target.value)}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Typography variant="h6" gutterBottom color="primary">
                        Individual Assessments
                      </Typography>
                      <Typography variant="caption" color="textSecondary" sx={{ mb: 2, display: 'block' }}>
                        Modify individual marks if needed
                      </Typography>
                    </Grid>

                    {studentMarks.map((student, index) => (
                      <Grid item xs={12} key={index}>
                        <Card variant="outlined" sx={{ mb: 2 }}>
                          <CardContent>
                            <Typography variant="subtitle1" gutterBottom>
                              {student.name} ({student.usn})
                            </Typography>
                            <Grid container spacing={2}>
                              <Grid item xs={12} md={6}>
                                <TextField
                                  fullWidth
                                  label="Individual Marks"
                                  type="number"
                                  value={student.marks}
                                  onChange={(e) => {
                                    const newMarks = [...studentMarks];
                                    newMarks[index].marks = e.target.value;
                                    setStudentMarks(newMarks);
                                  }}
                                />
                              </Grid>
                              <Grid item xs={12} md={6}>
                                <TextField
                                  fullWidth
                                  label="Individual Feedback"
                                  value={student.feedback}
                                  onChange={(e) => {
                                    const newMarks = [...studentMarks];
                                    newMarks[index].feedback = e.target.value;
                                    setStudentMarks(newMarks);
                                  }}
                                />
                              </Grid>
                            </Grid>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}

                    <Grid item xs={12}>
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={handleSubmitMarks}
                        disabled={submitting}
                        sx={{ mt: 2 }}
                      >
                        {submitting ? <CircularProgress size={24} /> : "Submit Marks"}
                      </Button>
                    </Grid>
                  </>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div className="teacher-dashboard">
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
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
    </div>
  );
};

export default TeacherDashboard;
