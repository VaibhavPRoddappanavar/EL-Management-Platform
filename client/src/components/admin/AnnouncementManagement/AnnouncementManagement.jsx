import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { toast } from 'react-toastify';
import axios from 'axios';

const AnnouncementManagement = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);

  const fetchAnnouncements = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(
        'http://localhost:5000/api/admin/announcements',
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      await axios.post(
        'http://localhost:5000/api/admin/announcements',
        {
          title,
          description,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success('Announcement created successfully');
      setTitle('');
      setDescription('');
      fetchAnnouncements();
    } catch (error) {
      toast.error('Error creating announcement');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) {
      return;
    }
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(
        `http://localhost:5000/api/admin/announcements/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success('Announcement deleted successfully');
      fetchAnnouncements();
    } catch (error) {
      toast.error('Error deleting announcement');
    }
  };

  const handleEdit = (announcement) => {
    setEditingAnnouncement(announcement);
    setOpenEditDialog(true);
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(
        `http://localhost:5000/api/admin/announcements/${editingAnnouncement._id}`,
        {
          title: editingAnnouncement.title,
          description: editingAnnouncement.description,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success('Announcement updated successfully');
      setOpenEditDialog(false);
      fetchAnnouncements();
    } catch (error) {
      toast.error('Error updating announcement');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Create Announcement
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                multiline
                rows={4}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" type="submit">
                Announce
              </Button>
            </Grid>
          </Grid>
        </form>

        <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
          Recent Announcements
        </Typography>
        <Grid container spacing={2}>
          {announcements.map((announcement) => (
            <Grid item xs={12} key={announcement._id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography variant="h6">{announcement.title}</Typography>
                      <Typography color="textSecondary" gutterBottom>
                        {new Date(announcement.createdAt).toLocaleString()}
                      </Typography>
                      <Typography variant="body1" sx={{ mt: 1 }}>
                        {announcement.description}
                      </Typography>
                    </Box>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(announcement)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(announcement._id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
        <DialogTitle>Edit Announcement</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Title"
            value={editingAnnouncement?.title || ''}
            onChange={(e) =>
              setEditingAnnouncement({
                ...editingAnnouncement,
                title: e.target.value,
              })
            }
            sx={{ mt: 2 }}
          />
          <TextField
            fullWidth
            label="Description"
            value={editingAnnouncement?.description || ''}
            onChange={(e) =>
              setEditingAnnouncement({
                ...editingAnnouncement,
                description: e.target.value,
              })
            }
            multiline
            rows={4}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button onClick={handleUpdate} variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AnnouncementManagement; 