import { Box, Container, Paper, Tab, Tabs } from "@mui/material";
import React, { useState } from "react";
import TeacherManagement from "./TeacherManagement/TeacherManagement";
// Import your existing admin components
import StudentManagement from "./StudentManagement";
import TeamManagement from "./TeamManagement";

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
          </Tabs>
        </Box>

        {activeTab === 0 && <TeamManagement />}
        {activeTab === 1 && <StudentManagement />}
        {activeTab === 2 && <TeacherManagement />}
      </Paper>
    </Container>
  );
};

export default AdminDashboard;
