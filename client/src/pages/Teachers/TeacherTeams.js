import React, { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
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
  Button,
  TablePagination,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Drawer,
  useMediaQuery,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  School as SchoolIcon,
  Badge as BadgeIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  Groups as GroupsIcon,
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';

// Configure axios defaults
axios.defaults.baseURL = 'http://localhost:5000';

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
const TeamRow = ({ team, formatMemberData }) => {
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
            <IconButton
              aria-label="expand row"
              size="small"
              onClick={() => setOpen(!open)}
            >
              {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
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

const sidebarWidth = 240;
const collapsedSidebarWidth = 65;

const TeacherTeams = () => {
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTheme, setSelectedTheme] = useState('');
  const [themes, setThemes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [themeStats, setThemeStats] = useState({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const token = localStorage.getItem('teacherToken');
        
        if (!token) {
          navigate('/teacher/login');
          return;
        }

        const response = await axios.get('/teacher/teams', {
          headers: { 
            'Authorization': `Bearer ${token}`
          }
        });
        
        setTeams(response.data);
        
        const uniqueThemes = [...new Set(response.data.map(team => team.Theme))];
        setThemes(uniqueThemes);
        
        const stats = {};
        uniqueThemes.forEach(theme => {
          stats[theme] = response.data.filter(team => team.Theme === theme).length;
        });
        setThemeStats(stats);
        
        setLoading(false);
      } catch (err) {
        console.error('Error details:', err.response || err);
        if (err.response?.status === 401) {
          navigate('/teacher/login');
        } else {
          setError(`Error fetching teams: ${err.response?.data?.message || err.message}`);
        }
        setLoading(false);
      }
    };

    fetchTeams();
  }, [navigate]);

  const searchInTeam = (team, query) => {
    const searchFields = [
      team.TeamLeaderName,
      team.TeamLeaderUSN,
      team.TeamMember1Name,
      team.TeamMember1USN,
      team.TeamMember2Name,
      team.TeamMember2USN,
      team.TeamMember3Name,
      team.TeamMember3USN,
      team.TeamMember4Name,
      team.TeamMember4USN,
    ];

    return searchFields.some(field => 
      field && field.toLowerCase().includes(query.toLowerCase())
    );
  };

  const formatMemberData = (prefix, team) => ({
    name: team[prefix + 'Name'],
    usn: team[prefix + 'USN'],
    email: team[prefix + 'EmailID'],
    phone: team[prefix + 'MobileNumber'],
    program: team[prefix + 'Program'],
  });

  const filteredTeams = teams.filter(team => {
    const matchesTheme = !selectedTheme || team.Theme === selectedTheme;
    const matchesSearch = !searchQuery || searchInTeam(team, searchQuery);
    return matchesTheme && matchesSearch;
  });

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedTeams = filteredTeams.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <Box sx={{ display: 'flex' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: isHovered ? sidebarWidth : collapsedSidebarWidth,
          transition: 'width 0.3s ease',
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: isHovered ? sidebarWidth : collapsedSidebarWidth,
            transition: 'width 0.3s ease',
            boxSizing: 'border-box',
            border: 'none',
          },
        }}
      >
        {sidebarContent}
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${isHovered ? sidebarWidth : collapsedSidebarWidth}px)` },
          transition: 'width 0.3s ease',
        }}
      >
        <Container component="main" maxWidth="lg">
          <Box sx={{ marginTop: 4, marginBottom: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              All Teams
            </Typography>

            {/* Filters */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Filter by Theme</InputLabel>
                  <Select
                    value={selectedTheme}
                    onChange={(e) => setSelectedTheme(e.target.value)}
                    label="Filter by Theme"
                  >
                    <MenuItem value="">
                      <em>All Themes</em>
                    </MenuItem>
                    {themes.map((theme) => (
                      <MenuItem key={theme} value={theme}>
                        {theme} ({themeStats[theme]} teams)
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Search by Name or USN"
                  variant="outlined"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter student name or USN..."
                />
              </Grid>
            </Grid>

            {/* Results Count */}
            <Typography variant="subtitle1" gutterBottom>
              Showing {filteredTeams.length} teams
              {selectedTheme && ` in ${selectedTheme}`}
              {searchQuery && ` matching "${searchQuery}"`}
            </Typography>

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
                  {paginatedTeams.map((team) => (
                    <TeamRow 
                      key={team._id} 
                      team={team} 
                      formatMemberData={formatMemberData}
                    />
                  ))}
                </TableBody>
              </Table>
              <TablePagination
                rowsPerPageOptions={[10, 25, 50]}
                component="div"
                count={filteredTeams.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </TableContainer>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default TeacherTeams;
