import {
  Box,
  Button,
  CircularProgress,
  Grid,
  Paper,
  Typography,
  Tooltip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
} from "@mui/material";
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
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

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
            {loading ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Designation</TableCell>
                        <TableCell align="center">Assigned Teams</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {teachers
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((teacher) => (
                          <TableRow key={teacher._id || teacher.id}>
                            <TableCell>{teacher.name}</TableCell>
                            <TableCell>{teacher.email}</TableCell>
                            <TableCell>{teacher.designation}</TableCell>
                            <TableCell align="center">
                              {teacher.assignedTeams?.length || 0}
                            </TableCell>
                            <TableCell align="center">
                              <Box display="flex" gap={1} justifyContent="center">
                                <Button
                                  variant="contained"
                                  size="small"
                                  onClick={() => handleAssignTeams(teacher)}
                                >
                                  Assign Teams
                                </Button>
                                <Tooltip title="View Teams">
                                  <IconButton
                                    color="primary"
                                    size="small"
                                    onClick={() => handleViewTeams(teacher)}
                                  >
                                    <VisibilityIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title={teacher.assignedTeams?.length === 0 ? "No teams assigned" : ""}>
                                  <span>
                                    <Button
                                      variant="outlined"
                                      color="error"
                                      size="small"
                                      disabled={teacher.assignedTeams?.length === 0}
                                      onClick={() => handleRemoveTeacherTeams(teacher._id)}
                                    >
                                      Remove Teams
                                    </Button>
                                  </span>
                                </Tooltip>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  rowsPerPageOptions={[10, 25, 50]}
                  component="div"
                  count={teachers.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </>
            )}
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
