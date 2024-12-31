import axios from "axios";
import {
  CheckCircle,
  Crown,
  PlusCircle,
  UserPlus,
  Users,
  XCircle,
  Trash2,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Nbar from "../ui/Nbar";
import Chat from "./Chat";
import { useNavigate } from "react-router-dom";

const POSITION_OPTIONS = [
  "TeamMember1",
  "TeamMember2",
  "TeamMember3",
  "TeamMember4",
];

// Card components
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg shadow-md ${className}`}>{children}</div>
);

const CardHeader = ({ children }) => <div className="p-6 pb-0">{children}</div>;

const CardTitle = ({ children, className = "" }) => (
  <h2 className={`text-xl font-semibold text-gray-800 ${className}`}>
    {children}
  </h2>
);

const CardContent = ({ children, className = "" }) => (
  <div className={`p-6 ${className}`}>{children}</div>
);

const TeamManagementView = ({ team }) => {
  const navigate = useNavigate();
  const [invites, setInvites] = useState({
    sentInvites: { pending: [], accepted: [], rejected: [] },
    appliedInvites: { pending: [], accepted: [], rejected: [] },
  });
  const [teamData, setTeamData] = useState({ teamLeader: null, members: [] });
  const [newInviteEmail, setNewInviteEmail] = useState("");
  const [newInvitePosition, setNewInvitePosition] = useState("");
  const [unassignedStudents, setUnassignedStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sentActiveTab, setSentActiveTab] = useState("pending");
  const [receivedActiveTab, setReceivedActiveTab] = useState("pending");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const [studentDetails, setStudentDetails] = useState({
    name: "",
    email: "",
    branch: "",
  });
  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const email = localStorage.getItem("userEmail");
        const response = await axios.get(
          `http://localhost:5000/student-details?email=${email}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setStudentDetails({
          name: response.data.name,
          email: response.data.email,
          branch: response.data.branch,
        });
      } catch (error) {
        console.error("Error fetching student details:", error);
      }
    };

    fetchStudentDetails();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch invites
        const [invitesResponse, membersResponse] = await Promise.all([
          axios.get(`http://localhost:5000/${team._id}/invites`, { headers }),
          axios.get(`http://localhost:5000/${team._id}/members`, { headers }),
        ]);

        setInvites(invitesResponse.data);
        setTeamData(membersResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [team._id]);

  useEffect(() => {
    const fetchUnassignedStudents = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/admin/unassigned", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUnassignedStudents(response.data);
        setFilteredStudents(response.data);
      } catch (error) {
        console.error("Error fetching unassigned students:", error);
      }
    };

    fetchUnassignedStudents();
  }, []);

  const fetchInvites = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/${team._id}/invites`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setInvites(response.data);
    } catch (error) {
      console.error("Error fetching invites:", error);
      toast.error("Failed to refresh invites");
    }
  };

  const handleInviteMember = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:5000/${team._id}/invite`,
        {
          email: newInviteEmail,
          position: newInvitePosition,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Invite sent successfully");
      setNewInviteEmail("");
      setNewInvitePosition("");

      // Refresh invites after sending new invite
      const response = await axios.get(
        `http://localhost:5000/${team._id}/invites`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setInvites(response.data);
    } catch (error) {
      alert(error.response?.data?.message || "An error occurred");
    }
  };

  const handleInviteResponse = async (invite, status) => {
    try {
      const token = localStorage.getItem("token");
      let response;

      if (status === "ACCEPTED") {
        // Prompt user to choose a position for accepted invite
        const position = prompt(
          `Choose a position for ${invite.email}:`,
          POSITION_OPTIONS.find(
            (pos) => !teamData.members.some((member) => member.position === pos)
          ) || ""
        );

        if (!position) {
          alert("Position must be selected to accept the invite");
          return;
        }

        response = await axios.put(
          `http://localhost:5000/handle/${team._id}/${invite._id}`,
          {
            status: "ACCEPTED",
            position,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        response = await axios.put(
          `http://localhost:5000/handle/${team._id}/${invite._id}`,
          {
            status: "REJECTED",
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }

      // Handle case where user has already joined another team
      if (response.data.alreadyInTeam) {
        toast.info("This user has already joined another team. Invite removed.");
        await fetchInvites();
        return;
      }

      // Refresh both invites and members after response
      const [invitesResponse, membersResponse] = await Promise.all([
        axios.get(`http://localhost:5000/${team._id}/invites`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`http://localhost:5000/${team._id}/members`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setInvites(invitesResponse.data);
      setTeamData(membersResponse.data);

      alert(response.data.message);
    } catch (error) {
      if (error.response?.data?.alreadyInTeam) {
        toast.info("This user has already joined another team. Invite removed.");
        await fetchInvites();
        return;
      }
      toast.error(error.response?.data?.message || "Failed to respond to invite");
    }
  };

  const handleFinalizeTeam = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `http://localhost:5000/${team._id}/finalize`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert(response.data.message);
      // Navigate(""); have to do it properly
      window.location.href = "http://localhost:3000/team";
    } catch (error) {
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert("An error occurred. Please try again.");
      }
      console.error(error);
    }
  };

  const handleCancelInvite = async (email) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:5000/${team._id}/cancel-invite`,
        { email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const response = await axios.get(
        `http://localhost:5000/${team._id}/invites`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setInvites(response.data);
    } catch (error) {
      console.error("Error cancelling invite:", error);
      alert("Failed to cancel invite");
    }
  };

  const handleDeleteMember = async (memberId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:5000/${team._id}/members/${memberId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Refresh members list after deletion
      const membersResponse = await axios.get(
        `http://localhost:5000/${team._id}/members`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setTeamData(membersResponse.data);
    } catch (error) {
      console.error("Error deleting member:", error);
      alert(error.response?.data?.message || "Failed to delete member");
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    const filtered = unassignedStudents.filter((student) =>
      student.Name.toLowerCase().includes(query.toLowerCase()) ||
      student.email.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredStudents(filtered);
  };

  const handleStudentSelect = (email) => {
    setNewInviteEmail(email);
  };

  const handleDiscardTeam = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/team/${team._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Team discarded successfully");
      navigate("/"); // Navigate back to main view
    } catch (error) {
      console.error("Error discarding team:", error);
      const errorMessage = error.response?.data?.message || "Failed to discard team. Please try again.";
      toast.error(errorMessage);
    }
  };

  const TabButton = ({ active, onClick, children }) => (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 
        ${
          active ? "bg-blue-500 text-white" : "text-gray-600 hover:bg-gray-100"
        }`}
    >
      {children}
    </button>
  );

  const TeamMembersList = ({ teamLeader, members }) => {
    return (
      <div className="space-y-3">
        {/* Team Leader Card */}
        {teamLeader && (
          <div className="bg-blue-50 p-4 rounded-lg shadow-sm border border-blue-200 hover:shadow-md transition-all duration-200">
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-500" />
                  <span className="font-semibold text-gray-800">
                    {teamLeader.TeamLeaderName}
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  {teamLeader.TeamleaderEmailID}
                </span>
                <span className="text-xs text-gray-400">
                  USN: {teamLeader.TeamLeaderUSN}
                </span>
              </div>
              <span className="px-3 py-1 bg-blue-100 text-blue-600 text-sm rounded-full">
                Team Leader
              </span>
            </div>
          </div>
        )}

        {/* Team Members */}
        {members.map((member) => (
          <div
            key={member._id}
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200"
          >
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <span className="font-semibold text-gray-800">
                  {member.name}
                </span>
                <span className="text-sm text-gray-500">{member.email}</span>
                <span className="text-xs text-gray-400">USN: {member.usn}</span>
              </div>
              <span className="px-3 py-1 bg-gray-50 text-gray-600 text-sm rounded-full">
                {member.position}
              </span>
              <button
                onClick={() => handleDeleteMember(member._id)}
                className="flex items-center justify-center p-1.5 text-red-500 hover:bg-red-50 rounded-full transition-colors duration-200"
                title="Remove member"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const InviteList = ({ inviteList, type, status }) => {
    if (inviteList.length === 0) {
      return (
        <div className="flex items-center justify-center h-32 border-2 border-dashed border-gray-200 rounded-lg">
          <p className="text-gray-400">No {status} invites</p>
        </div>
      );
    }

    return (
      <div className="space-y-3 mt-4">
        {inviteList.map((invite) => (
          <div
            key={invite._id}
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200"
          >
            <div className="flex flex-col justify-between items-center">
              <div className="flex flex-col justify-between items-center">
                <span className="font-semibold text-gray-800">
                  {invite.email}
                </span>
                <span className="text-sm text-gray-500">{invite.position}</span>
              </div>
              <div className="flex gap-2">
                {type === "sent" && status === "pending" && (
                  <button
                    onClick={() => handleCancelInvite(invite.email)}
                    className="flex items-center gap-1 px-4 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors duration-200"
                  >
                    <XCircle className="w-4 h-4" />
                    Cancel
                  </button>
                )}
                {type === "received" && status === "pending" && (
                  <>
                    <button
                      onClick={() => handleInviteResponse(invite, "ACCEPTED")}
                      className="flex items-center gap-1 px-4 py-2 bg-green-50 text-green-600 rounded-md hover:bg-green-100 transition-colors duration-200"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Accept
                    </button>
                    <button
                      onClick={() => handleInviteResponse(invite, "REJECTED")}
                      className="flex items-center gap-1 px-4 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors duration-200"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const ConfirmDialog = ({ onConfirm, onCancel }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Discard Team</h3>
        <p className="text-gray-600 mb-6">
          Are you sure you want to discard this team? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Discard Team
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <Nbar />
      <div className="wrapper bg-blue-50 min-h-screen max-w-screen overflow-x-hidden p-4 md:p-6">
        {showConfirmDialog && (
          <ConfirmDialog
            onConfirm={() => {
              handleDiscardTeam();
              setShowConfirmDialog(false);
            }}
            onCancel={() => setShowConfirmDialog(false)}
          />
        )}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
          <button
            onClick={() => setShowConfirmDialog(true)}
            className="flex items-center px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-5 h-5 mr-2" />
            Discard Team
          </button>
        </div>
        <div className="grid md:grid-cols-2 gap-6 mt-24">
          {/* Current Team Members Card */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-6 h-6 text-blue-500" />
                Current Team Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TeamMembersList
                teamLeader={teamData.teamLeader}
                members={teamData.members}
                onDeleteMember={handleDeleteMember}
              />
            </CardContent>
          </Card>

          {/* Team Management Card */}
          <div className="space-y-6">
            {/* Invite New Member */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="w-6 h-6 text-blue-500" />
                  Invite New Member
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Search and Select Member */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Search Members
                    </label>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={handleSearch}
                      placeholder="Search by name or email"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                    />
                    
                    <div className="mt-2 max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                      {filteredStudents.map((student) => (
                        <div
                          key={student.email}
                          onClick={() => handleStudentSelect(student.email)}
                          className={`p-3 cursor-pointer hover:bg-gray-50 ${
                            newInviteEmail === student.email ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="font-medium">{student.Name}</div>
                          <div className="text-sm text-gray-500">{student.email}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Position Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Position
                    </label>
                    <select
                      value={newInvitePosition}
                      onChange={(e) => setNewInvitePosition(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select position</option>
                      {POSITION_OPTIONS.map((pos) => (
                        <option key={pos} value={pos}>
                          {pos}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={handleInviteMember}
                    disabled={!newInviteEmail || !newInvitePosition}
                    className="w-full flex items-center justify-center gap-2 px-6 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <PlusCircle className="w-5 h-5" />
                    Send Invite
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Invitations Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Sent Invitations Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-6 h-6 text-blue-500" />
                    Sent
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col space-x-2 mb-4">
                    <TabButton
                      active={sentActiveTab === "pending"}
                      onClick={() => setSentActiveTab("pending")}
                    >
                      Pending
                    </TabButton>
                    <TabButton
                      active={sentActiveTab === "accepted"}
                      onClick={() => setSentActiveTab("accepted")}
                    >
                      Accepted
                    </TabButton>
                    <TabButton
                      active={sentActiveTab === "rejected"}
                      onClick={() => setSentActiveTab("rejected")}
                    >
                      Rejected
                    </TabButton>
                  </div>
                  <InviteList
                    inviteList={invites.sentInvites[sentActiveTab] || []}
                    type="sent"
                    status={sentActiveTab}
                  />
                </CardContent>
              </Card>

              {/* Received Invitations Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-6 h-6 text-blue-500" />
                    Received
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col space-x-2 mb-4">
                    <TabButton
                      active={receivedActiveTab === "pending"}
                      onClick={() => setReceivedActiveTab("pending")}
                    >
                      Pending
                    </TabButton>
                    <TabButton
                      active={receivedActiveTab === "accepted"}
                      onClick={() => setReceivedActiveTab("accepted")}
                    >
                      Accepted
                    </TabButton>
                    <TabButton
                      active={receivedActiveTab === "rejected"}
                      onClick={() => setReceivedActiveTab("rejected")}
                    >
                      Rejected
                    </TabButton>
                  </div>
                  <InviteList
                    inviteList={invites.appliedInvites[receivedActiveTab] || []}
                    type="received"
                    status={receivedActiveTab}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Finalize Team Button */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col gap-4">
                  <button
                    onClick={handleFinalizeTeam}
                    className="w-full flex items-center justify-center gap-2 px-6 py-2 text-white bg-green-500 rounded-md hover:bg-green-600 transition duration-200"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Finalize Team
                  </button>
                  <button
                    onClick={() => setShowConfirmDialog(true)}
                    className="w-full flex items-center justify-center gap-2 px-6 py-2 text-white bg-red-500 rounded-md hover:bg-red-600 transition duration-200"
                  >
                    <Trash2 className="w-5 h-5" />
                    Discard Team
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <Chat teamId={team._id} userName={studentDetails.name} />
      </div>
    </div>
  );
};

export default TeamManagementView;
