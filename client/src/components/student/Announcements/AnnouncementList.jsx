import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import axios from 'axios';
import { toast } from 'react-toastify';

const AnnouncementList = () => {
  const [announcements, setAnnouncements] = useState([]);

  const fetchAnnouncements = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        'http://localhost:5000/api/student/announcements',
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAnnouncements(response.data);
    } catch (error) {
      toast.error('Error fetching announcements');
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Announcements
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {announcements.map((announcement) => (
          <Card key={announcement._id} sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6">{announcement.title}</Typography>
              <Typography color="textSecondary" gutterBottom>
                {new Date(announcement.createdAt).toLocaleString()}
              </Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                {announcement.description}
              </Typography>
            </CardContent>
          </Card>
        ))}
        {announcements.length === 0 && (
          <Typography color="textSecondary" align="center">
            No announcements yet
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default AnnouncementList; 