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
import MarksManagement from "./MarksManagement";
import TeacherTeams from "./TeacherTeams";

const TeacherDashboard = () => {
  const [value, setValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [teacherData, setTeacherData] = useState(null);

  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        const token = localStorage.getItem("teacherToken");
        const response = await axios.get(
          "http://localhost:5000/teacher/profile",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setTeacherData(response.data);
      } catch (error) {
        console.error("Error fetching teacher data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherData();
  }, []);

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
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Welcome, {teacherData?.name}
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" gutterBottom>
          Department: {teacherData?.department}
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: "divider", mt: 3 }}>
          <Tabs value={value} onChange={(e, newValue) => setValue(newValue)}>
            <Tab label="My Teams" />
            <Tab label="Marks Management" />
          </Tabs>
        </Box>

        {value === 0 && <TeacherTeams teams={teacherData?.assignedTeams} />}
        {value === 1 && <MarksManagement teams={teacherData?.assignedTeams} />}
      </Paper>
    </Container>
  );
};

export default TeacherDashboard;
