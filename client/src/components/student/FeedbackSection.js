import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Divider,
  Grid,
  Tab,
  Tabs,
  Typography
} from '@mui/material';
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

        console.log('Raw response data:', response.data);

        // Process the feedback data
        const processedData = {
          Phase1: { feedback: '', teamFeedback: '' },
          Phase2: { feedback: '', teamFeedback: '' },
          Phase3: { feedback: '', teamFeedback: '' }
        };

        if (response.data && Array.isArray(response.data)) {
          response.data.forEach(phase => {
            console.log('Processing phase:', phase);
            if (phase.studentMarks && phase.phase) {
              const studentMark = phase.studentMarks.find(mark => 
                mark.studentEmail && mark.studentEmail.toLowerCase() === localStorage.getItem('userEmail').toLowerCase()
              );
              console.log('Found student mark:', studentMark);
              if (studentMark) {
                processedData[phase.phase] = {
                  feedback: studentMark.individualFeedback || studentMark.feedback || '',
                  teamFeedback: phase.generalFeedback || ''
                };
              }
            }
          });
        }

        console.log('Processed feedback data:', processedData);

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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container>
      <Box sx={{ width: '100%', mt: 3 }}>
        <Typography variant="h4" gutterBottom>
          Project Feedback
        </Typography>
        
        <Tabs
          value={currentPhase}
          onChange={handlePhaseChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          sx={{ mb: 3 }}
        >
          <Tab label="Phase 1" value="Phase1" />
          <Tab label="Phase 2" value="Phase2" />
          <Tab label="Phase 3" value="Phase3" />
        </Tabs>

        <Card>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom color="primary">
                  Individual Feedback
                </Typography>
                <Card variant="outlined" sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                  <Typography variant="body1">
                    {feedbackData[currentPhase].feedback || 'No individual feedback provided yet.'}
                  </Typography>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom color="primary">
                  Team Feedback
                </Typography>
                <Card variant="outlined" sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                  <Typography variant="body1">
                    {feedbackData[currentPhase].teamFeedback || 'No team feedback provided yet.'}
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default FeedbackSection;
