import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Container,
  Alert,
} from '@mui/material';

const StudentAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/student/announcements/announcements');
        setAnnouncements(response.data);
      } catch (error) {
        console.error('Error fetching announcements:', error);
        setError('Failed to fetch announcements');
      }
    };

    fetchAnnouncements();
  }, []);

  return (
    <Container>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Announcements
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Paper>
          <List>
            {announcements.map((announcement, index) => (
              <React.Fragment key={announcement._id}>
                <ListItem alignItems="flex-start">
                  <ListItemText
                    primary={announcement.title}
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="text.primary">
                          {announcement.description}
                        </Typography>
                        <br />
                        <Typography variant="caption" color="text.secondary">
                          Posted on: {new Date(announcement.createdAt).toLocaleString()}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                {index < announcements.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      </Box>
    </Container>
  );
};

export default StudentAnnouncements;
