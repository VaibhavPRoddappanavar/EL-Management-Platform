import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Paper,
  Tab,
  Tabs,
  Typography,
  useTheme,
  Alert,
  Fade
} from '@mui/material';
import {
  CommentOutlined as CommentIcon,
  GroupOutlined as TeamIcon,
  Assignment as PhaseIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const FeedbackSection = () => {
  const [loading, setLoading] = useState(true);
  const [feedbackData, setFeedbackData] = useState({
    Phase1: { feedback: '', teamFeedback: '' },
    Phase2: { feedback: '', teamFeedback: '' },
    Phase3: { feedback: '', teamFeedback: '' }
  });
  const [currentPhase, setCurrentPhase] = useState('Phase1');
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get(
          'http://localhost:5000/student/feedback',
          {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        const processedData = {
          Phase1: { feedback: '', teamFeedback: '' },
          Phase2: { feedback: '', teamFeedback: '' },
          Phase3: { feedback: '', teamFeedback: '' }
        };

        if (response.data && Array.isArray(response.data)) {
          response.data.forEach(phase => {
            if (phase.studentMarks && phase.phase) {
              const studentMark = phase.studentMarks.find(mark => 
                mark.studentEmail && mark.studentEmail.toLowerCase() === localStorage.getItem('userEmail').toLowerCase()
              );
              if (studentMark) {
                processedData[phase.phase] = {
                  feedback: studentMark.individualFeedback || studentMark.feedback || '',
                  teamFeedback: phase.generalFeedback || ''
                };
              }
            }
          });
        }

        setFeedbackData(processedData);
      } catch (error) {
        console.error('Error fetching feedback:', error);
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, [navigate]);

  const handlePhaseChange = (event, newPhase) => {
    setCurrentPhase(newPhase);
  };

  const FeedbackCard = ({ title, content, icon, type = 'default' }) => (
    <Fade in timeout={500}>
      <Card 
        elevation={3} 
        sx={{ 
          mb: 3,
          backgroundColor: type === 'team' ? theme.palette.primary.light : theme.palette.background.paper,
          transition: 'transform 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)'
          }
        }}
      >
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            {icon}
            <Typography 
              variant="h6" 
              sx={{ 
                ml: 1,
                color: type === 'team' ? theme.palette.primary.contrastText : 'inherit'
              }}
            >
              {title}
            </Typography>
          </Box>
          <Typography 
            variant="body1" 
            sx={{ 
              whiteSpace: 'pre-wrap',
              color: type === 'team' ? theme.palette.primary.contrastText : 'inherit',
              opacity: content ? 1 : 0.7
            }}
          >
            {content || 'No feedback provided yet.'}
          </Typography>
        </CardContent>
      </Card>
    </Fade>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ width: '100%', mt: 4, mb: 4 }}>
        <Box display="flex" alignItems="center" mb={4}>
          <PhaseIcon sx={{ fontSize: 40, color: theme.palette.primary.main, mr: 2 }} />
          <Typography variant="h4" component="h1" fontWeight="500">
            Project Feedback
          </Typography>
        </Box>

        <Paper elevation={2} sx={{ mb: 4, borderRadius: '12px' }}>
          <Tabs
            value={currentPhase}
            onChange={handlePhaseChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': {
                py: 2,
                fontSize: '1rem'
              }
            }}
          >
            <Tab 
              label={
                <Box display="flex" alignItems="center">
                  <span>Phase 1</span>
                  {feedbackData.Phase1.feedback && 
                    <Alert 
                      icon={false} 
                      severity="success" 
                      sx={{ ml: 1, py: 0, px: 1, minWidth: 0 }}
                    >
                      New
                    </Alert>
                  }
                </Box>
              } 
              value="Phase1" 
            />
            <Tab 
              label={
                <Box display="flex" alignItems="center">
                  <span>Phase 2</span>
                  {feedbackData.Phase2.feedback && 
                    <Alert 
                      icon={false} 
                      severity="success" 
                      sx={{ ml: 1, py: 0, px: 1, minWidth: 0 }}
                    >
                      New
                    </Alert>
                  }
                </Box>
              } 
              value="Phase2" 
            />
            <Tab 
              label={
                <Box display="flex" alignItems="center">
                  <span>Phase 3</span>
                  {feedbackData.Phase3.feedback && 
                    <Alert 
                      icon={false} 
                      severity="success" 
                      sx={{ ml: 1, py: 0, px: 1, minWidth: 0 }}
                    >
                      New
                    </Alert>
                  }
                </Box>
              } 
              value="Phase3" 
            />
          </Tabs>
        </Paper>

        <Box sx={{ mt: 4 }}>
          <FeedbackCard
            title="Your Individual Feedback"
            content={feedbackData[currentPhase].feedback}
            icon={<CommentIcon sx={{ color: theme.palette.secondary.main }} />}
          />
          
          <FeedbackCard
            title="Team Feedback"
            content={feedbackData[currentPhase].teamFeedback}
            icon={<TeamIcon sx={{ color: theme.palette.primary.contrastText }} />}
            type="team"
          />
        </Box>
      </Box>
    </Container>
  );
};

export default FeedbackSection;
