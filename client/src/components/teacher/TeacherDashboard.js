import {
  Box,
  CircularProgress,
  Container,
  Paper,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MarksManagement from "./MarksManagement";
import "./TeacherDashboard.css";
import TeacherTeams from "./TeacherTeams";

const TeacherDashboard = () => {
  const [value, setValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [teacherData, setTeacherData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("teacherToken");
    if (!token) {
      navigate("/teacher/login");
      return;
    }

    const fetchTeacherData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/teacher/profile",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setTeacherData(response.data);
      } catch (error) {
        console.error("Error fetching teacher data:", error);
        if (error.response?.status === 401) {
          localStorage.removeItem("teacherToken");
          navigate("/teacher/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("teacherToken");
    navigate("/teacher/login");
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div className="teacher-dashboard">
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <div>
              <Typography variant="h4" gutterBottom>
                Welcome, {teacherData?.name}
              </Typography>
              <Typography variant="subtitle1" color="textSecondary">
                Department: {teacherData?.department}
              </Typography>
              <Typography variant="subtitle1" color="textSecondary">
                Designation: {teacherData?.designation}
              </Typography>
            </div>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </Box>

          <Box sx={{ borderBottom: 1, borderColor: "divider", mt: 3 }}>
            <Tabs value={value} onChange={(e, newValue) => setValue(newValue)}>
              <Tab label="My Teams" />
              <Tab label="Marks Management" />
            </Tabs>
          </Box>

          {value === 0 && (
            <Box sx={{ mt: 3 }}>
              <TeacherTeams teams={teacherData?.assignedTeams} />
            </Box>
          )}
          {value === 1 && (
            <Box sx={{ mt: 3 }}>
              <MarksManagement teams={teacherData?.assignedTeams} />
            </Box>
          )}
        </Paper>
      </Container>
    </div>
  );
};

export default TeacherDashboard;
