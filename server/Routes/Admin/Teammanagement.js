const express = require("express");
const router = express.Router();
const Team = require("../../Models/Team"); // Adjust the path as needed

// Delete an entire team
router.delete("/:teamId", async (req, res) => {
  const { teamId } = req.params;

  try {
    const deletedTeam = await Team.findByIdAndDelete(teamId);

    if (!deletedTeam) {
      return res.status(404).json({ message: "Team not found" });
    }

    res.status(200).json({ message: "Team deleted successfully", deletedTeam });
  } catch (error) {
    console.error("Error deleting team:", error);
    res.status(500).json({ message: "Failed to delete team" });
  }
});

module.exports = router;
