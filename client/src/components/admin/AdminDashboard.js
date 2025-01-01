import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Paper,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Grid,
  IconButton,
  Tooltip,
  Avatar,
  Stack,
  Chip,
  Collapse,
} from "@mui/material";
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  School as SchoolIcon,
  Badge as BadgeIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import TeacherManagement from "./TeacherManagement/TeacherManagement";
import UnassignedStudents from './UnassignedStudents';
import StudentMarks from './StudentMarks';

// Contact info component with icon
const ContactInfo = ({ icon: Icon, text, label }) => (
  <Tooltip title={label} placement="top">
    <Stack direction="row" spacing={0.5} alignItems="center">
      <Icon color="primary" sx={{ fontSize: 16 }} />
      <Typography variant="body2" noWrap>{text}</Typography>
    </Stack>
  </Tooltip>
);

// Member info component
const MemberInfo = ({ member }) => {
  if (!member.name) return null;

  return (
    <Box sx={{ 
      p: 1, 
      bgcolor: 'background.paper',
      borderRadius: 1,
      minWidth: 250,
      maxWidth: 300,
      boxShadow: 1,
    }}>
      <Stack spacing={0.5}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.main' }}>
            <PersonIcon sx={{ fontSize: 16 }} />
          </Avatar>
          <Typography variant="subtitle2" noWrap>{member.name}</Typography>
        </Stack>
        <Stack spacing={0.5} sx={{ pl: 4 }}>
          <ContactInfo icon={BadgeIcon} text={member.usn} label="USN" />
          <ContactInfo icon={EmailIcon} text={member.email} label="Email" />
          <ContactInfo icon={PhoneIcon} text={member.phone} label="Phone" />
          <ContactInfo icon={SchoolIcon} text={member.program} label="Program" />
        </Stack>
      </Stack>
    </Box>
  );
};

// Team Row component
const TeamRow = ({ team, formatMemberData, onDelete }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TableRow 
        sx={{ 
          '& > *': { borderBottom: 'unset' },
          '&:hover': { bgcolor: 'action.hover' },
        }}
      >
        <TableCell>
          <MemberInfo
            member={{
              name: team.TeamLeaderName,
              usn: team.TeamLeaderUSN,
              email: team.TeamleaderEmailID,
              phone: team.TeamleaderMobileNumber,
              program: team.TeamleaderProgram,
            }}
          />
        </TableCell>
        <TableCell>
          <Chip 
            label={team.Theme}
            color="primary"
            variant="outlined"
            size="small"
          />
        </TableCell>
        <TableCell>
          <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">
              {[
                team.TeamMember1Name,
                team.TeamMember2Name,
                team.TeamMember3Name,
                team.TeamMember4Name,
              ].filter(Boolean).length} Members
            </Typography>
            <Stack direction="row" spacing={1}>
              <IconButton
                aria-label="expand row"
                size="small"
                onClick={() => setOpen(!open)}
              >
                {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
              </IconButton>
              <IconButton
                aria-label="delete team"
                size="small"
                onClick={() => onDelete(team._id)}
                color="error"
              >
                <DeleteIcon />
              </IconButton>
            </Stack>
          </Stack>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={3}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2 }}>
              <Typography variant="h6" gutterBottom component="div">
                Team Members
              </Typography>
              <Stack 
                direction="row" 
                spacing={2} 
                sx={{ 
                  overflowX: 'auto',
                  pb: 1,
                  '&::-webkit-scrollbar': {
                    height: 8,
                  },
                  '&::-webkit-scrollbar-track': {
                    backgroundColor: 'background.paper',
                    borderRadius: 4,
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: 'primary.light',
                    borderRadius: 4,
                  },
                }}
              >
                {[1, 2, 3, 4].map((num) => {
                  const member = formatMemberData(`TeamMember${num}`, team);
                  if (!member.name) return null;
                  return (
                    <Box key={num} sx={{ flexShrink: 0 }}>
                      <MemberInfo member={member} />
                    </Box>
                  );
                })}
              </Stack>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

function AdminDashboard() {
  // Existing state
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState("All Teams");
  const [searchType, setSearchType] = useState("Name");
  const [searchTerm, setSearchTerm] = useState("");
  
  // New state for tabs
  const [activeTab, setActiveTab] = useState(0);
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

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin/login");
    } else {
      // Fetch all teams by default
      fetchTeams("All Teams");
    }
  }, [navigate]);

  // Existing team fetching logic
  const fetchTeams = async (theme) => {
    setLoading(true);
    setSelectedTheme(theme);
    setSearchTerm("");

    try {
      const token = localStorage.getItem("adminToken");
      const url = theme === "All Teams"
        ? `http://localhost:5000/admin/teams`
        : `http://localhost:5000/admin/teams?theme=${encodeURIComponent(theme)}`;

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTeams(response.data);
    } catch (error) {
      console.error("Failed to fetch teams:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeam = async (teamId) => {
    if (!window.confirm("Are you sure you want to delete this team?")) {
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");
      await axios.delete(`http://localhost:5000/admin/teams/${teamId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTeams((prevTeams) => prevTeams.filter((team) => team._id !== teamId));
      alert("Team deleted successfully!");
    } catch (error) {
      console.error("Failed to delete team:", error);
      alert("Failed to delete team. Please try again.");
    }
  };

  const formatMemberData = (prefix, team) => ({
    name: team[prefix + 'Name'],
    usn: team[prefix + 'USN'],
    email: team[prefix + 'EmailID'],
    phone: team[prefix + 'MobileNumber'],
    program: team[prefix + 'Program'],
  });

  const filteredTeams = teams.filter((team) => {
    const term = searchTerm.toLowerCase();
    if (searchType === "Name") {
      return (
        team.TeamLeaderName.toLowerCase().includes(term) ||
        ["1", "2", "3", "4"].some(
          (member) =>
            team[`TeamMember${member}Name`] &&
            team[`TeamMember${member}Name`].toLowerCase().includes(term)
        )
      );
    } else if (searchType === "USN") {
      return (
        team.TeamLeaderUSN.toLowerCase().includes(term) ||
        ["1", "2", "3", "4"].some(
          (member) =>
            team[`TeamMember${member}USN`] &&
            team[`TeamMember${member}USN`].toLowerCase().includes(term)
        )
      );
    }
    return false;
  });

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const renderTeamManagement = () => (
    <Box sx={{ marginTop: 4, marginBottom: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Team Management
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Filter by Theme</InputLabel>
            <Select
              value={selectedTheme}
              onChange={(e) => fetchTeams(e.target.value)}
              label="Filter by Theme"
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
          <FormControl fullWidth>
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
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label={`Search by ${searchType.toLowerCase()}`}
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Grid>
      </Grid>

      {selectedTheme && (
        <Typography variant="subtitle1" gutterBottom>
          Showing {filteredTeams.length} teams
          {selectedTheme !== "All Teams" && ` in ${selectedTheme}`}
          {searchTerm && ` matching "${searchTerm}"`}
        </Typography>
      )}

      <TableContainer 
        component={Paper} 
        elevation={3}
        sx={{
          '& .MuiTableCell-head': {
            backgroundColor: 'primary.main',
            color: 'primary.contrastText',
            fontWeight: 'bold',
          },
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width="45%">Team Leader</TableCell>
              <TableCell width="30%">Theme</TableCell>
              <TableCell width="25%">Team Size</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} align="center">Loading...</TableCell>
              </TableRow>
            ) : filteredTeams.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center">No teams found</TableCell>
              </TableRow>
            ) : (
              filteredTeams.map((team) => (
                <TeamRow 
                  key={team._id} 
                  team={team} 
                  formatMemberData={formatMemberData}
                  onDelete={handleDeleteTeam}
                />
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  return (
    <Container maxWidth="xl">
      <Box sx={{ width: '100%', typography: 'body1', mt: 6 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{
                '& .MuiTab-root': {
                  fontWeight: 'bold',
                  fontSize: '1rem',
                },
              }}
            >
              <Tab label="Teams Overview" />
              <Tab label="Teacher Management" />
              <Tab label="Unassigned Students" />
              <Tab label="Student Marks" />
            </Tabs>
          </Box>

          {/* Tab Panels */}
          <Box sx={{ mt: 2 }}>
            {activeTab === 0 && renderTeamManagement()}
            {activeTab === 1 && <TeacherManagement />}
            {activeTab === 2 && <UnassignedStudents />}
            {activeTab === 3 && <StudentMarks />}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default AdminDashboard;
