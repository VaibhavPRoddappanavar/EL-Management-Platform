// components/team/MainView.js
import React, { useEffect, useState } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import Nbar from '../ui/Nbar';
import CountUp from 'react-countup';
import axios from 'axios';
import { Users, UserPlus, UserCheck, Calculator } from 'lucide-react';

const StatCard = ({ icon: Icon, title, value, suffix = "" }) => (
  <div className="bg-white rounded-lg p-6 shadow-lg border border-blue-100 hover:shadow-xl transition-shadow">
    <div className="flex items-center justify-between mb-4">
      <div className="p-2 bg-blue-50 rounded-lg">
        <Icon className="w-6 h-6 text-blue-500" />
      </div>
      <div className="text-xs font-medium text-blue-400 uppercase tracking-wider">{title}</div>
    </div>
    <div className="flex items-baseline">
      <div className="text-2xl font-bold text-gray-900">
        <CountUp end={value} duration={2.5} separator="," />
        {suffix}
      </div>
    </div>
  </div>
);

export const MainView = ({ onCreateTeam, onJoinTeam }) => {
  const [stats, setStats] = useState({
    unassignedCount: 0,
    formedTeamsCount: 0,
    formingTeamsCount: 0,
    totalTeamMembers: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('http://localhost:5000/team-stats');
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching team statistics:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="main-view">
      <Nbar />
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
        {/* Statistics Section */}
        <div className="w-full max-w-6xl mb-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Team Formation Statistics</h2>
            <p className="text-gray-600">Current status of team formation process</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              icon={Users}
              title="Unassigned Members"
              value={stats.unassignedCount}
            />
            <StatCard
              icon={UserCheck}
              title="Teams Formed"
              value={stats.formedTeamsCount}
            />
            <StatCard
              icon={UserPlus}
              title="Teams in Progress"
              value={stats.formingTeamsCount}
            />
            <StatCard
              icon={Calculator}
              title="Total Team Members"
              value={stats.totalTeamMembers}
            />
          </div>
        </div>

        {/* Main Actions Card */}
        <Card className="w-full max-w-2xl">
          <div className="text-center bg-blue-50 border-b border-blue-100 p-6">
            <h1 className="text-2xl font-bold text-blue-900">Team Management</h1>
            <p className="text-blue-600">Choose how you'd like to proceed</p>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Button
                variant="outline"
                className="h-40 flex flex-col items-center justify-center space-y-4"
                onClick={onCreateTeam}
              >
                <span className="text-blue-500 text-2xl">👥</span>
                <div>
                  <h3 className="font-semibold text-lg text-blue-900">Create a Team</h3>
                  <p className="text-sm text-blue-600">Start your own team</p>
                </div>
              </Button>

              <Button
                variant="outline"
                className="h-40 flex flex-col items-center justify-center space-y-4"
                onClick={onJoinTeam}
              >
                <span className="text-blue-500 text-2xl">🤝</span>
                <div>
                  <h3 className="font-semibold text-lg text-blue-900">Join a Team</h3>
                  <p className="text-sm text-blue-600">Find existing teams</p>
                </div>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
