import {
  Box,
  Button,
  CircularProgress,
  Grid,
  Paper,
  Typography,
  Tooltip,
  IconButton,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import AddTeacherModal from "./AddTeacherModal";
import AssignTeamsModal from "./AssignTeamsModal";
import ViewTeamsModal from './ViewTeamsModal';
import VisibilityIcon from '@mui/icons-material/Visibility';

const TeacherManagement = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openAssignModal, setOpenAssignModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [openViewModal, setOpenViewModal] = useState(false);

  const columns = [
    { field: "name", headerName: "Name", flex: 1.5 },
    { field: "email", headerName: "Email", flex: 1.5 },
    { field: "designation", headerName: "Designation", flex: 1 },
    {
      field: "assignedTeams",
      headerName: "Assigned Teams",
      flex: 0.5,
      renderCell: (params) => params.value?.length || 0,
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1.5,
      renderCell: (params) => (
        <Box display="flex" gap={1}>
          <Button
            variant="contained"
            size="small"
            onClick={() => handleAssignTeams(params.row)}
          >
            Assign Teams
          </Button>
          <Tooltip title="View Teams">
            <IconButton
              color="primary"
              size="small"
              onClick={() => handleViewTeams(params.row)}
            >
              <VisibilityIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={params.row.assignedTeams?.length === 0 ? "No teams assigned" : ""}>
            <span>
              <Button
                variant="outlined"
                color="error"
                size="small"
                disabled={params.row.assignedTeams?.length === 0}
                onClick={() => handleRemoveTeacherTeams(params.row._id)}
              >
                Remove Teams
              </Button>
            </span>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const fetchTeachers = async () => {
    try {
      // Fetch teachers directly from MongoDB TeacherProfile
      const response = await axios.get(
        "http://localhost:5000/api/admin/teachers/teachers"
      );

      // Add id field for DataGrid
      const teachersWithIds = response.data.map((teacher) => ({
        ...teacher,
        id: teacher._id,
      }));

      setTeachers(teachersWithIds);
    } catch (error) {
      toast.error("Error fetching teachers");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleAssignTeams = (teacher) => {
    setSelectedTeacher(teacher);
    setOpenAssignModal(true);
  };

  const handleRandomAssign = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      await axios.post(
        "http://localhost:5000/api/admin/teachers/random-assign",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Teams randomly assigned successfully");
      fetchTeachers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error randomly assigning teams");
    }
  };

  const handleRemoveAllTeams = async () => {
    if (!window.confirm("Are you sure you want to remove all team assignments?")) {
      return;
    }
    try {
      const token = localStorage.getItem("adminToken");
      await axios.post(
        "http://localhost:5000/api/admin/teachers/remove-all-teams",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("All team assignments removed successfully");
      fetchTeachers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error removing team assignments");
    }
  };

  const handleRemoveTeacherTeams = async (teacherId) => {
    if (!window.confirm("Are you sure you want to remove all teams from this teacher?")) {
      return;
    }
    try {
      const token = localStorage.getItem("adminToken");
      await axios.post(
        `http://localhost:5000/api/admin/teachers/${teacherId}/remove-teams`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Teams removed successfully");
      fetchTeachers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error removing teams");
    }
  };

  const handleViewTeams = (teacher) => {
    setSelectedTeacher(teacher);
    setOpenViewModal(true);
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid
            item
            xs={12}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h5">Teacher Management</Typography>
            <Box display="flex" gap={2}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setOpenAddModal(true)}
              >
                Add New Teacher
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleRandomAssign}
              >
                Random Assign Teams
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={handleRemoveAllTeams}
              >
                Remove All Teams
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <DataGrid
              rows={teachers}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[10]}
              autoHeight
              disableSelectionOnClick
              sx={{ minHeight: 400 }}
            />
          </Grid>
        </Grid>

        <AddTeacherModal
          open={openAddModal}
          onClose={() => setOpenAddModal(false)}
          onTeacherAdded={fetchTeachers}
        />

        <AssignTeamsModal
          open={openAssignModal}
          onClose={() => setOpenAssignModal(false)}
          teacher={selectedTeacher}
          onTeamsAssigned={fetchTeachers}
        />

        <ViewTeamsModal
          open={openViewModal}
          onClose={() => setOpenViewModal(false)}
          teacher={selectedTeacher}
          onTeamRemoved={fetchTeachers}
        />
      </Paper>
    </Box>
  );
};

export default TeacherManagement;
