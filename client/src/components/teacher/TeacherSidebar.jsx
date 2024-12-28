import { Assessment, Group, Logout } from "@mui/icons-material";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";

const TeacherSidebar = ({ open, onClose }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("teacherToken");
    navigate("/teacher/login");
  };

  const menuItems = [
    {
      text: "My Teams",
      icon: <Group />,
      onClick: () => navigate("/teacher/dashboard"),
    },
    {
      text: "Marks Management",
      icon: <Assessment />,
      onClick: () => navigate("/teacher/marks"),
    },
    {
      text: "Logout",
      icon: <Logout />,
      onClick: handleLogout,
    },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: 240,
          boxSizing: "border-box",
          backgroundColor: "#1a237e",
          color: "white",
        },
      }}
    >
      <Box sx={{ overflow: "auto", mt: 8 }}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ color: "white" }}>
            Teacher Portal
          </Typography>
        </Box>
        <List>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.text}
              onClick={item.onClick}
              sx={{
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                },
              }}
            >
              <ListItemIcon sx={{ color: "white" }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default TeacherSidebar;
