import axios from 'axios';
import { Check, Loader2, Send, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from '../ui/Alert';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Input } from '../ui/Input';

const clusterPrograms = {
  CS: ['AI', 'CD', 'CS', 'CY', 'IS'],
  EC: ['EC', 'EE', 'EI', 'ET'],
  ME: ['AE', 'IM', 'ME'],
  CV: ['CV', 'BT', 'CH']
};

const JoinTeamView = () => {
  const navigate = useNavigate();
  const [invitedTeams, setInvitedTeams] = useState([]);
  const [eligibleTeams, setEligibleTeams] = useState([]);
  const [applicationData, setApplicationData] = useState({
    phoneNumber: '',
    usn: '',
    name: '',
    program: ''
  });
  const [errors, setErrors] = useState({
    usn: '',
    phoneNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [appliedTeams, setAppliedTeams] = useState([]);

  useEffect(() => {
    fetchInvitedTeams();
    fetchStudentDetails();
  }, []);

  const validateFields = () => {
    const newErrors = {};
    
    if (!applicationData.usn) {
      newErrors.usn = 'USN is required';
    }
    
    if (!applicationData.phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\d{10}$/.test(applicationData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid 10-digit phone number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fetchStudentDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const email = localStorage.getItem('userEmail'); // Assuming email is stored in localStorage
      const response = await axios.get(`http://localhost:5000/student-details?email=${email}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setApplicationData(prev => ({
        ...prev,
        name: response.data.name,
        program: response.data.branch,
        usn: prev.usn // Preserve any USN already entered
      }));
    } catch (error) {
      console.error('Error fetching student details:', error);
      setMessage({ 
        type: 'error', 
        text: 'Failed to load your details. Please try again later.' 
      });
    }
  };

  useEffect(() => {
    if (applicationData.program) {
      const cluster = Object.keys(clusterPrograms).find(key => 
        clusterPrograms[key].includes(applicationData.program)
      );
      fetchEligibleTeams(cluster);
    }
  }, [applicationData.program]);

  const fetchEligibleTeams = async (cluster) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/cluster/${cluster}/${applicationData.program}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setEligibleTeams(response.data.eligibleTeams);
    } catch (error) {
      console.error('Error fetching eligible teams:', error);
    }
  };

  const handleApplyToTeam = async (teamId) => {
    // First validate the required fields
    if (!validateFields()) {
      setMessage({
        type: 'error',
        text: 'Please fill in all required fields correctly'
      });
      return;
    }
  
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/${teamId}/apply`, 
        {
          usn: applicationData.usn,
          mobileNumber: applicationData.phoneNumber, // Added missing mobileNumber
          name: applicationData.name,
          program: applicationData.program
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
  
      setAppliedTeams(prev => [...prev, teamId]);
      setMessage({ 
        type: 'success', 
        text: 'Application submitted successfully!' 
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to apply to team'
      });
    }
  };

  const fetchInvitedTeams = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/invited', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setInvitedTeams(response.data.invitedTeams);
    } catch (error) {
      console.error('Error fetching invited teams:', error);
    }
  };

  const handleInviteResponse = async (teamId, status, teamData) => {
    if (!validateFields()) {
      setMessage({
        type: 'error',
        text: 'Please fill in all required fields correctly'
      });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:5000/invite/${teamId}/respond`,
        {
          status,
          name: applicationData.name,
          usn: applicationData.usn,
          program: applicationData.program,
          mobileNumber: applicationData.phoneNumber // Changed to match backend
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (status === 'ACCEPTED') {
        setMessage({ type: 'success', text: 'Successfully joined the team!' });
        setTimeout(() => {
          navigate('/TeamManagement');
        }, 1000);
      } else {
        setMessage({ type: 'success', text: response.data.message });
        setInvitedTeams(prevTeams => 
          prevTeams.filter(team => team._id !== teamId)
        );
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'An error occurred',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-4xl font-bold text-blue-900 mb-8 text-center">
        Team Discovery & Invitations
        </h1>
        
        {message && (
          <Alert 
            className={`
              ${message.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}
              transition-all duration-300 ease-in-out
            `}
          >
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

<Card className="bg-white/80 backdrop-blur-sm shadow-xl border-blue-100">
          <CardHeader>
            <CardTitle className="text-blue-800">Your Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Name</label>
                <Input
                  value={applicationData.name}
                  disabled
                  className="bg-gray-50 border-blue-100"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Program</label>
                <Input
                  value={applicationData.program}
                  disabled
                  className="bg-gray-50 border-blue-100"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  USN <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Enter your USN"
                  value={applicationData.usn}
                  onChange={(e) => {
                    setApplicationData(prev => ({
                      ...prev,
                      usn: e.target.value
                    }));
                    setErrors(prev => ({ ...prev, usn: '' }));
                  }}
                  className={`border-blue-200 focus:border-blue-400 ${
                    errors.usn ? 'border-red-500' : ''
                  }`}
                />
                {errors.usn && (
                  <p className="text-red-500 text-sm mt-1">{errors.usn}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Enter your phone number"
                  value={applicationData.phoneNumber}
                  onChange={(e) => {
                    setApplicationData(prev => ({
                      ...prev,
                      phoneNumber: e.target.value
                    }));
                    setErrors(prev => ({ ...prev, phoneNumber: '' }));
                  }}
                  className={`border-blue-200 focus:border-blue-400 ${
                    errors.phoneNumber ? 'border-red-500' : ''
                  }`}
                />
                {errors.phoneNumber && (
                  <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-blue-100">
          <CardHeader>
            <CardTitle className="text-blue-800">Teams That Have Invited You</CardTitle>
          </CardHeader>
          <CardContent>
            {invitedTeams.length === 0 ? (
              <div className="text-gray-500 text-center py-8">
                <p className="text-lg">No pending invites at the moment</p>
                <p className="text-sm mt-2">When teams invite you, they'll appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {invitedTeams.map((team) => (
                  <div 
                    key={team._id} 
                    className="border rounded-lg p-4 hover:border-blue-300 transition-colors bg-white/50"
                  >
                    <h3 className="font-semibold text-blue-900">{team.TeamLeaderName}</h3>
                    <p className="text-gray-600 text-sm mt-1">{team.Theme}</p>
                    <div className="mt-4 flex space-x-2">
                      <Button
                        onClick={() => handleInviteResponse(team._id, 'ACCEPTED', team)}
                        disabled={loading}
                        className="flex content-center items-center bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 h-8"
                        size="sm"
                      >
                        {loading ? (
                          <Loader2 className="animate-spin w-4 h-4" />
                        ) : (
                          <>
                            <Check className="w-3 h-3 mr-1" />
                            Accept
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => handleInviteResponse(team._id, 'REJECTED', team)}
                        disabled={loading}
                        variant="outline"
                        className="flex content-center items-center border-blue-200 text-blue-700 hover:bg-blue-50 px-4 py-1 h-8"
                        size="sm"
                      >
                        {loading ? (
                          <Loader2 className="animate-spin w-4 h-4" />
                        ) : (
                          <>
                            <X className="w-3 h-3 mr-1" />
                            Decline
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-blue-100">
          <CardHeader>
            <CardTitle className="text-blue-800">
              Teams in Your Cluster ({applicationData.program})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {eligibleTeams.length === 0 ? (
              <div className="text-gray-500 text-center py-8">
                <p className="text-lg">No eligible teams found</p>
                <p className="text-sm mt-2">Teams for your program will appear here</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {eligibleTeams.map((team) => (
                  <div 
                    key={team._id} 
                    className="border rounded-lg p-4 hover:shadow-md transition-all bg-white/70 space-y-3"
                  >
                    <div>
                      <h3 className="font-semibold text-blue-900 text-lg">
                        {team.TeamLeaderName}
                      </h3>
                      <p className="text-gray-600 text-sm mt-1">{team.Theme}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        Cluster: {team.cluster} | Expires: {new Date(team.expiresAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      onClick={() => handleApplyToTeam(team._id)}
                      disabled={appliedTeams.includes(team._id)}
                      className={`w-full ${
                        appliedTeams.includes(team._id) 
                          ? 'bg-green-500 hover:bg-green-600' 
                          : 'bg-blue-500 hover:bg-blue-600'
                      } text-white flex items-center justify-center`}
                    >
                      {appliedTeams.includes(team._id) ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Applied
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Apply to Team
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JoinTeamView;