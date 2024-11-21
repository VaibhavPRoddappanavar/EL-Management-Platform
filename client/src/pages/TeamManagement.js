import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { CreateTeamView } from '../components/Team/CreateTeamView';
import JoinTeamView from '../components/Team/JoinTeamView';
import { MainView } from '../components/Team/MainView';
import TeamManagementView from '../components/Team/TeamManagementView';

const TeamManagement = () => {
  const [view, setView] = useState('main');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [userTeam, setUserTeam] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is part of a forming team
    const checkUserTeam = async () => {
      try {
        const email = localStorage.getItem('userEmail'); // Assuming you store the email in localStorage after login
        const token = localStorage.getItem('token');
  
        if (!email) {
          setError('User email not found.');
          return;
        }

        const response = await axios.post('http://localhost:5000/check-team-status', { email },{
          headers: {
            Authorization: `Bearer ${token}`, // Include token in the Authorization header
          },
        });

        // Handle responses based on the message returned
        if (response.data.message === 'You are already part of a registered team') {
          setUserTeam(response.data.existingTeam);
          setView('team-management');
        } else if (response.data.message === 'You already have a team in formation') {
          setUserTeam(response.data.existingFormingTeam);
          setView('team-management');
        } else if (response.data.message === 'No team found') {
          setView('main'); // No team status, stay on main view
        } else {
          setError('Unexpected response from the server.');
        }
      } catch (error) {
        console.error('Error occurred during /check-team-status request:', error);
        setError('An error occurred while checking your team status. Please try again later.');
      }
    };

    checkUserTeam();
  }, []);
  return (
    <>
      {view === 'main' && (
        <MainView
          onCreateTeam={() => setView('create')}
          onJoinTeam={() => setView('join')}
        />
      )}
      {view === 'create' && (
        <CreateTeamView
          onBack={() => setView('main')}
        />
      )}
      {view === 'join' && (
        <JoinTeamView
          onBack={() => setView('main')}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filter={filter}
          setFilter={setFilter}
        />
      )}
      {view === 'team-management' && (
        <TeamManagementView team={userTeam} />
      )}
    </>
  );
};

export default TeamManagement;