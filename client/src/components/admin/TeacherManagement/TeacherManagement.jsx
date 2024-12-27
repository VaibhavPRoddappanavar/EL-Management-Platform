import {
  Box,
  Button,
  CircularProgress,
  Grid,
  Paper,
  Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import AddTeacherModal from "./AddTeacherModal";
import AssignTeamsModal from "./AssignTeamsModal";

const TeacherManagement = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openAssignModal, setOpenAssignModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

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
      flex: 1,
      renderCell: (params) => (
        <Button
          variant="contained"
          size="small"
          onClick={() => handleAssignTeams(params.row)}
        >
          Assign Teams
        </Button>
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
            <Button
              variant="contained"
              color="primary"
              onClick={() => setOpenAddModal(true)}
            >
              Add New Teacher
            </Button>
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
      </Paper>
    </Box>
  );
};

export default TeacherManagement;
