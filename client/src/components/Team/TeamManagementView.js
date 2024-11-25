import axios from "axios";
import Chat from "./Chat";
import {
  CheckCircle,
  Crown,
  PlusCircle,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

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
  const [invites, setInvites] = useState({
    sentInvites: { pending: [], accepted: [], rejected: [] },
    appliedInvites: { pending: [], accepted: [], rejected: [] },
  });
  const [teamData, setTeamData] = useState({ teamLeader: null, members: [] });
  const [newInviteEmail, setNewInviteEmail] = useState("");
  const [newInvitePosition, setNewInvitePosition] = useState("");
  const [sentActiveTab, setSentActiveTab] = useState("pending");
  const [receivedActiveTab, setReceivedActiveTab] = useState("pending");

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
        // For rejection, simply send the status
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
      console.error("Error responding to invite:", error);
      alert(error.response?.data?.message || "Failed to respond to invite");
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

  return (
    <div className="wrapper bg-blue-50 min-h-screen max-w-screen overflow-x-hidden p-4 md:p-6">
      <div className="grid md:grid-cols-2 gap-6">
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
              <div className="flex flex-col md:flex-row gap-4 flex-wrap">
                <input
                  type="email"
                  placeholder="Email address"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                  value={newInviteEmail}
                  onChange={(e) => setNewInviteEmail(e.target.value)}
                />
                <select
                  value={newInvitePosition}
                  onChange={(e) => setNewInvitePosition(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 bg-white"
                >
                  <option value="" disabled>
                    Select Position
                  </option>
                  {POSITION_OPTIONS.map((position) => (
                    <option key={position} value={position}>
                      {position}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleInviteMember}
                  className="flex items-center justify-center gap-2 px-6 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 transition duration-200"
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
              <button
                onClick={handleFinalizeTeam}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 text-white bg-green-500 rounded-md hover:bg-green-600 transition duration-200"
              >
                <CheckCircle className="w-5 h-5" />
                Finalize Team
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
      <Chat teamId={team._id} userName={studentDetails.name} />
    </div>
  );
};

export default TeamManagementView;
