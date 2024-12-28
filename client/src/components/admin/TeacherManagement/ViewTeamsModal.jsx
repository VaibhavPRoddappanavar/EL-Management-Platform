import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Typography,
  Box,
  Paper,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import { toast } from 'react-toastify';

const ViewTeamsModal = ({ open, onClose, teacher, onTeamRemoved }) => {
  const handleRemoveTeam = async (teamId) => {
    if (!window.confirm('Are you sure you want to remove this team?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('adminToken');
      await axios.post(
        `http://localhost:5000/api/admin/teachers/${teacher._id}/remove-single-team`,
        { teamId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success('Team removed successfully');
      onTeamRemoved();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error removing team');
    }
  };

  const renderTeamMembers = (team) => {
    const members = [];
    
    // Add team leader with email
    if (team.TeamLeaderName) {
      members.push({
        name: `${team.TeamLeaderName} (${team.TeamLeaderUSN}) - Leader`,
        email: team.TeamleaderEmailID || 'No email'
      });
    }
    
    // Add other team members with emails
    if (team.TeamMember1Name) {
      members.push({
        name: `${team.TeamMember1Name} (${team.TeamMember1USN})`,
        email: team.TeamMember1EmailID || 'No email'
      });
    }
    if (team.TeamMember2Name) {
      members.push({
        name: `${team.TeamMember2Name} (${team.TeamMember2USN})`,
        email: team.TeamMember2EmailID || 'No email'
      });
    }
    if (team.TeamMember3Name) {
      members.push({
        name: `${team.TeamMember3Name} (${team.TeamMember3USN})`,
        email: team.TeamMember3EmailID || 'No email'
      });
    }
    if (team.TeamMember4Name) {
      members.push({
        name: `${team.TeamMember4Name} (${team.TeamMember4USN})`,
        email: team.TeamMember4EmailID || 'No email'
      });
    }

    return members;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Assigned Teams - {teacher?.name}</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        {!teacher?.assignedTeams?.length ? (
          <Typography color="text.secondary">No teams assigned</Typography>
        ) : (
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Theme</TableCell>
                  <TableCell>Team Members</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {teacher?.assignedTeams?.map((team) => (
                  <TableRow key={team._id}>
                    <TableCell>{team.Theme || 'Not specified'}</TableCell>
                    <TableCell>
                      {renderTeamMembers(team).map((member, index) => (
                        <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
                          • {member.name}
                        </Typography>
                      ))}
                    </TableCell>
                    <TableCell>
                      {renderTeamMembers(team).map((member, index) => (
                        <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
                          • {member.email}
                        </Typography>
                      ))}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="error"
                        onClick={() => handleRemoveTeam(team._id)}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ViewTeamsModal; 