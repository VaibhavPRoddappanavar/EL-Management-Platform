import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import axios from "axios";
import React, { useState } from "react";
import { toast } from "react-toastify";

const MarksManagement = ({ teams }) => {
  const [selectedTeam, setSelectedTeam] = useState("");
  const [phase, setPhase] = useState("");
  const [studentMarks, setStudentMarks] = useState([]);
  const [generalFeedback, setGeneralFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTeamSelect = async (teamId) => {
    setSelectedTeam(teamId);
    const team = teams.find((t) => t._id === teamId);
    if (team) {
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
      ].filter((s) => s.email); // Remove empty email entries
      setStudentMarks(students);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("teacherToken");
      await axios.post(
        "http://localhost:5000/api/teachers/marks/submit-marks",
        {
          teamId: selectedTeam,
          phase,
          studentMarks,
          generalFeedback,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Marks submitted successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error submitting marks");
    } finally {
      setLoading(false);
    }
  };

  const selectedTeamDetails = teams?.find((team) => team._id === selectedTeam);

  return (
    <Box sx={{ mt: 3 }}>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              select
              fullWidth
              label="Select Team"
              value={selectedTeam}
              onChange={(e) => handleTeamSelect(e.target.value)}
            >
              {teams.map((team) => (
                <MenuItem key={team._id} value={team._id}>
                  {team.TeamName} - {team.Theme}
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
              onChange={(e) => setPhase(e.target.value)}
            >
              <MenuItem value="Phase1">Phase 1</MenuItem>
              <MenuItem value="Phase2">Phase 2</MenuItem>
              <MenuItem value="Phase3">Phase 3</MenuItem>
            </TextField>
          </Grid>

          {selectedTeamDetails && (
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" color="primary" gutterBottom>
                    {selectedTeamDetails.TeamName}
                  </Typography>
                  <Typography variant="subtitle2" color="textSecondary">
                    Theme: {selectedTeamDetails.Theme}
                  </Typography>
                  <Divider sx={{ my: 1.5 }} />
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: "bold", mb: 1 }}
                    >
                      Team Members:
                    </Typography>
                    <Typography variant="body2">
                      • Leader: {selectedTeamDetails.TeamLeaderName} (
                      {selectedTeamDetails.TeamLeaderUSN})
                    </Typography>
                    {selectedTeamDetails.TeamMember1Name && (
                      <Typography variant="body2">
                        • Member 1: {selectedTeamDetails.TeamMember1Name} (
                        {selectedTeamDetails.TeamMember1USN})
                      </Typography>
                    )}
                    {selectedTeamDetails.TeamMember2Name && (
                      <Typography variant="body2">
                        • Member 2: {selectedTeamDetails.TeamMember2Name} (
                        {selectedTeamDetails.TeamMember2USN})
                      </Typography>
                    )}
                    {selectedTeamDetails.TeamMember3Name && (
                      <Typography variant="body2">
                        • Member 3: {selectedTeamDetails.TeamMember3Name} (
                        {selectedTeamDetails.TeamMember3USN})
                      </Typography>
                    )}
                    {selectedTeamDetails.TeamMember4Name && (
                      <Typography variant="body2">
                        • Member 4: {selectedTeamDetails.TeamMember4Name} (
                        {selectedTeamDetails.TeamMember4USN})
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}

          {studentMarks.map((student, index) => (
            <Grid item xs={12} key={index}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    {student.name} ({student.usn})
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Marks"
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
            <TextField
              fullWidth
              multiline
              rows={4}
              label="General Feedback"
              value={generalFeedback}
              onChange={(e) => setGeneralFeedback(e.target.value)}
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{ mt: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : "Submit Marks"}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default MarksManagement;
