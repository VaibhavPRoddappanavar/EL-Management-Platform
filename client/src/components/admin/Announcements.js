import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Container,
  Alert,
} from '@mui/material';

const Announcements = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [announcements, setAnnouncements] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch announcements
  const fetchAnnouncements = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/announcements');
      setAnnouncements(response.data);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      setError('Failed to fetch announcements');
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  // Create announcement
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/admin/announcements', { title, description });
      setTitle('');
      setDescription('');
      setSuccess('Announcement created successfully!');
      fetchAnnouncements();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error creating announcement:', error);
      setError('Failed to create announcement');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <Container>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Create Announcement
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        <Paper sx={{ p: 3 }}>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              multiline
              rows={4}
              sx={{ mb: 2 }}
            />
            <Button variant="contained" type="submit">
              Post Announcement
            </Button>
          </form>
        </Paper>
      </Box>

      <Box>
        <Typography variant="h4" gutterBottom>
          Recent Announcements
        </Typography>
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

export default Announcements;
