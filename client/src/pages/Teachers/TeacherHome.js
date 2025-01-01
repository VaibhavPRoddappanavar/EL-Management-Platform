import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Grid,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import GroupsIcon from '@mui/icons-material/Groups';
import PeopleIcon from '@mui/icons-material/People';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import LogoutIcon from '@mui/icons-material/Logout';
import SchoolIcon from '@mui/icons-material/School';
import profilePic from "../../images/profile.png";
import collegelogo from "../../images/rvlogo.png";

const TeacherHome = () => {
  const navigate = useNavigate();
  const [teacherData, setTeacherData] = useState(null);
  const [open, setOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const sidebarWidth = isHovered || isMobile ? 240 : 65;

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

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
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

  if (!teacherData) {
    return <div>Loading...</div>;
  }

  return (
    <Box sx={{ 
      display: 'flex',
      minHeight: '100vh'
    }}>
      {!isMobile && (
        <Box
          component="nav"
          sx={{
            width: sidebarWidth,
            flexShrink: 0,
            height: '100vh',
            position: 'fixed',
            boxShadow: '4px 0 10px -3px rgba(0,0,0,0.1)',
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
          transition: 'margin-left 0.3s ease',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: '#f8f9fa'  // Light gray background
        }}
        maxWidth={false}
      >
        {/* Header Section with enhanced styling */}
        <Box
          sx={{
            width: '100%',
            bgcolor: 'white',
            borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
            px: 3,
            py: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            position: 'sticky',
            top: 0,
            zIndex: 1100,
            boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
          }}
        >
          {isMobile && (
            <IconButton onClick={() => setOpen(true)}>
              <MenuIcon />
            </IconButton>
          )}
          
          {/* College Logo and Name */}
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <img 
              src={collegelogo} 
              alt="RV Logo" 
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                marginRight: '12px'
              }}
            />
            <Typography variant="h6" sx={{ color: '#2c3e50' }}>
              RV College of Engineering
            </Typography>
          </Box>
          
          {/* Profile Section */}
          <Box
            sx={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer'
            }}
            onClick={toggleDropdown}
          >
            <img
              src={profilePic}
              alt="Profile"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                marginRight: '8px'
              }}
            />
            <Typography variant="body2" sx={{ color: 'gray' }}>
              Profile
            </Typography>

            {/* Dropdown Menu */}
            {dropdownVisible && (
              <Paper
                sx={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  mt: 1,
                  width: 250,
                  p: 2,
                  zIndex: 1200,
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  {teacherData?.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  {teacherData?.email}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {teacherData?.designation}
                </Typography>
                <Box
                  onClick={handleLogout}
                  sx={{
                    bgcolor: 'error.main',
                    color: 'white',
                    py: 1,
                    px: 2,
                    borderRadius: 1,
                    textAlign: 'center',
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: 'error.dark'
                    }
                  }}
                >
                  Logout
                </Box>
              </Paper>
            )}
          </Box>
        </Box>

        {/* Welcome Content Section with enhanced design */}
        <Box sx={{ 
          p: 0,
          flexGrow: 1
        }}>
          {/* Welcome Card */}
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              mb: 4, 
              borderRadius: 2,
              background: 'linear-gradient(135deg, #457ee0 0%, #3366cc 100%)',
              color: 'white'
            }}
          >
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 500 }}>
              Welcome back, {teacherData?.name}
            </Typography>
            <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
              {teacherData?.designation} • Faculty Dashboard
            </Typography>
          </Paper>

          

          </Box>
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

export default TeacherHome;
