import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

const AssignTeamsModal = ({ open, onClose, teacher, onTeamsAssigned }) => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [unassignedTeams, setUnassignedTeams] = useState([]);
  const [currentlyAssignedTeams, setCurrentlyAssignedTeams] = useState([]);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [selectedTheme, setSelectedTheme] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const themes = [
    "All",
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

  useEffect(() => {
    if (open && teacher) {
      fetchTeams();
      // Initialize with currently assigned teams if any
      setSelectedTeams(teacher.assignedTeams?.map((team) => team._id) || []);
      setCurrentlyAssignedTeams(teacher.assignedTeams || []);
    }
  }, [open, teacher]);

  const fetchTeams = async () => {
    try {
      const unassignedResponse = await axios.get(
        "http://localhost:5000/api/admin/teachers/unassigned-teams"
      );

      console.log("Unassigned Teams Response:", unassignedResponse.data);

      const allAvailableTeams = [...unassignedResponse.data];
      if (teacher.assignedTeams) {
        teacher.assignedTeams.forEach((team) => {
          if (!allAvailableTeams.find((t) => t._id === team._id)) {
            allAvailableTeams.push(team);
          }
        });
      }

      console.log("All Available Teams:", allAvailableTeams);
      setUnassignedTeams(allAvailableTeams);
    } catch (error) {
      toast.error("Error fetching teams");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (selectedTeams.length > 4) {
      toast.error("Maximum 4 teams can be assigned to a teacher");
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(
        "http://localhost:5000/api/admin/teachers/assign-teams",
        {
          teacherId: teacher._id,
          teamIds: selectedTeams,
        }
      );
      toast.success("Teams assigned successfully");
      onTeamsAssigned();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error assigning teams");
    } finally {
      setSubmitting(false);
    }
  };

  const handleTeamSelect = (teamId) => {
    setSelectedTeams((prev) =>
      prev.includes(teamId)
        ? prev.filter((id) => id !== teamId)
        : [...prev, teamId]
    );
  };

  const filteredTeams = unassignedTeams.filter((team) => {
    const matchesTheme =
      selectedTheme === "All" || team.Theme === selectedTheme;
    const matchesSearch =
      (team.TeamName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (team.TeamLeaderName?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      );
    return matchesTheme && matchesSearch;
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            Assign Teams to {teacher?.name}
            <Typography variant="subtitle2" color="textSecondary">
              Currently assigned teams: {currentlyAssignedTeams.length}/4
            </Typography>
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : (
          <Box>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Filter by Theme</InputLabel>
                  <Select
                    value={selectedTheme}
                    onChange={(e) => setSelectedTheme(e.target.value)}
                  >
                    {themes.map((theme) => (
                      <MenuItem key={theme} value={theme}>
                        {theme}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Search teams"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              {filteredTeams.map((team) => {
                // console.log("Individual Team Object:", team);
                return (
                  <Grid item xs={12} sm={6} md={4} key={team._id}>
                    <Card
                      variant="outlined"
                      sx={{
                        bgcolor: selectedTeams.includes(team._id)
                          ? "action.selected"
                          : "background.paper",
                      }}
                    >
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {team.TeamName || "Unnamed Team"}
                        </Typography>
                        <Typography variant="subtitle2" color="textSecondary">
                          Theme: {team.Theme || "No Theme"}
                        </Typography>
                        <Box mt={1}>
                          <Typography variant="subtitle2">
                            Leader: {team.TeamLeaderName || "No Leader"}
                          </Typography>
                          {team.TeamMember1Name && (
                            <Typography variant="body2">
                              • {team.TeamMember1Name}
                            </Typography>
                          )}
                          {team.TeamMember2Name && (
                            <Typography variant="body2">
                              • {team.TeamMember2Name}
                            </Typography>
                          )}
                          {team.TeamMember3Name && (
                            <Typography variant="body2">
                              • {team.TeamMember3Name}
                            </Typography>
                          )}
                        </Box>
                      </CardContent>
                      <CardActions>
                        <Checkbox
                          checked={selectedTeams.includes(team._id)}
                          onChange={() => handleTeamSelect(team._id)}
                          color="primary"
                        />
                        <Typography variant="caption">
                          {selectedTeams.includes(team._id)
                            ? "Selected"
                            : "Select Team"}
                        </Typography>
                      </CardActions>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={submitting}
        >
          {submitting ? <CircularProgress size={24} /> : "Assign Teams"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssignTeamsModal;
