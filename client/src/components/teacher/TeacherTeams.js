import {
    Box,
    Card,
    CardContent,
    Divider,
    Grid,
    Typography,
} from "@mui/material";
import React from "react";

const TeacherTeams = ({ teams }) => {
  if (!teams || teams.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: "center" }}>
        <Typography variant="h6" color="textSecondary">
          No teams assigned yet
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        My Teams ({teams.length})
      </Typography>
      <Grid container spacing={3}>
        {teams.map((team) => (
          <Grid item xs={12} md={6} key={team._id}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" color="primary" gutterBottom>
                  {team.TeamName}
                </Typography>
                <Typography variant="subtitle2" color="textSecondary">
                  Theme: {team.Theme}
                </Typography>
                <Divider sx={{ my: 1.5 }} />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Team Members:
                  </Typography>
                  <Typography variant="body2">
                    • Leader: {team.TeamLeaderName} ({team.TeamLeaderUSN})
                  </Typography>
                  {team.TeamMember1Name && (
                    <Typography variant="body2">
                      • Member 1: {team.TeamMember1Name} ({team.TeamMember1USN})
                    </Typography>
                  )}
                  {team.TeamMember2Name && (
                    <Typography variant="body2">
                      • Member 2: {team.TeamMember2Name} ({team.TeamMember2USN})
                    </Typography>
                  )}
                  {team.TeamMember3Name && (
                    <Typography variant="body2">
                      • Member 3: {team.TeamMember3Name} ({team.TeamMember3USN})
                    </Typography>
                  )}
                  {team.TeamMember4Name && (
                    <Typography variant="body2">
                      • Member 4: {team.TeamMember4Name} ({team.TeamMember4USN})
                    </Typography>
                  )}
                </Box>
                <Divider sx={{ my: 1.5 }} />
                <Typography variant="body2" color="textSecondary">
                  Contact: {team.TeamLeaderMobileNumber}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Email: {team.TeamleaderEmailID}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default TeacherTeams; 