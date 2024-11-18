// components/team/MainView.js
import React from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

export const MainView = ({ onCreateTeam, onJoinTeam }) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
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
);
