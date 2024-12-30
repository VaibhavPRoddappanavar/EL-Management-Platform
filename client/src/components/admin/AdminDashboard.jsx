import React, { useState } from "react";
import { Box, Container, Paper, Tab, Tabs } from "@mui/material";
import TeacherManagement from "./TeacherManagement/TeacherManagement";
import StudentManagement from "./StudentManagement";
import TeamManagement from "./TeamManagement";
import AnnouncementManagement from "./AnnouncementManagement/AnnouncementManagement";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Container maxWidth="xl">
      <Paper elevation={3} sx={{ mt: 3, p: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Team Management" />
            <Tab label="Student Management" />
            <Tab label="Teacher Management" />
            <Tab label="Announcements" />
          </Tabs>
        </Box>

        {activeTab === 0 && <TeamManagement />}
        {activeTab === 1 && <StudentManagement />}
        {activeTab === 2 && <TeacherManagement />}
        {activeTab === 3 && <AnnouncementManagement />}
      </Paper>
    </Container>
  );
};

export default AdminDashboard;
