const mongoose = require("mongoose");

const TeamSchema = new mongoose.Schema({
  TeamLeaderUSN: {
    type: String,
    required: true,
  },
  TeamLeaderName: {
    type: String,
    required: true,
  },
  TeamleaderEmailID: {
    type: String,
    required: true,
  },
  TeamleaderMobileNumber: {
    type: String,
    required: true,
  },
  TeamleaderProgram: {
    type: String,
    required: true,
  },
  Theme: {
    type: String,
    required: true,
  },
  TeamMember1USN: {
    type: String,
    required: true,
  },
  TeamMember1Name: {
    type: String,
    required: true,
  },
  TeamMember1EmailID: {
    type: String,
    required: true,
  },
  TeamMember1MobileNumber: {
    type: String,
    required: true,
  },
  TeamMember1Program: {
    type: String,
    required: true,
  },
  TeamMember2USN: {
    type: String,
    required: true,
  },
  TeamMember2Name: {
    type: String,
    required: true,
  },
  TeamMember2EmailID: {
    type: String,
    required: true,
  },
  TeamMember2MobileNumber: {
    type: String,
    required: true,
  },
  TeamMember2Program: {
    type: String,
    required: true,
  },
  TeamMember3USN: {
    type: String,
    required: true,
  },
  TeamMember3Name: {
    type: String,
    required: true,
  },
  TeamMember3EmailID: {
    type: String,
    required: true,
  },
  TeamMember3MobileNumber: {
    type: String,
    required: true,
  },
  TeamMember3Program: {
    type: String,
    required: true,
  },
  TeamMember4USN: {
    type: String,
  },
  TeamMember4Name: {
    type: String,
  },
  TeamMember4EmailID: {
    type: String,
  },
  TeamMember4MobileNumber: {
    type: String,
  },
  TeamMember4Program: {
    type: String,
  },
});

const Team = mongoose.model("Team", TeamSchema);
module.exports = Team;
