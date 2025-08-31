import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  TeamCard,
  TeamFilter,
  TeamDetailsPanel,
  EscalationScheduleVisualizer,
  OnCallCalendar,
  TeamPerformanceCharts,
  CommunicationToolsPanel,
  ScreenReaderAnnouncement,
} from '../components';
import { useTheme } from '../theme/utils';
import type { Team, User } from '../types';

export const Teams = () => {
  const theme = useTheme();
  const teams: Team[] = [];
  const isLoading = false;
  const selectedTeam: Team | null = null;
  const setSelectedTeam = () => {};
  const [showDetailsPanel, setShowDetailsPanel] = useState(false);
  const [activeView, setActiveView] = useState<'directory' | 'schedules' | 'calendar' | 'performance' | 'communication'>('directory');
  const [announcement, setAnnouncement] = useState('');
  const [selectedTeamForTools, setSelectedTeamForTools] = useState<Team | null>(null);
  const [targetUser] = useState<User | null>(null);

  const handleShowDetails = () => {
    setShowDetailsPanel(true);
  };

  const handleCloseDetails = () => {
    setShowDetailsPanel(false);
    setSelectedTeam();
  };

  const handleEditTeam = () => {
    setAnnouncement(`Edit functionality will be implemented in future updates`);
  };

  const handleHandoffNotification = (fromUser: User, toUser: User, handoffTime: Date) => {
    setAnnouncement(`Handoff notification sent: ${fromUser.name} → ${toUser.name} at ${handoffTime.toLocaleTimeString()}`);
  };

  const pageHeaderStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing[8],
    flexWrap: 'wrap',
    gap: theme.spacing[4],
  };

  const titleStyle: React.CSSProperties = {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    margin: 0,
  };

  const viewSelectorStyle: React.CSSProperties = {
    display: 'flex',
    gap: theme.spacing[2],
    alignItems: 'center',
    flexWrap: 'wrap',
  };

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: theme.spacing[6],
  };

  const emptyStateStyle: React.CSSProperties = {
    textAlign: 'center',
    padding: theme.spacing[8],
    color: theme.colors.textSecondary,
  };

  const loadingStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing[8],
    color: theme.colors.textSecondary,
  };

  if (isLoading) {
    return (
      <div>
        <header style={pageHeaderStyle}>
          <h1 style={titleStyle}>Teams Management</h1>
        </header>
        <div style={loadingStyle}>
          <div>Loading teams...</div>
        </div>
      </div>
    );
  }

  const renderView = () => {
    switch (activeView) {
      case 'directory':
        return (
          <>
            <TeamFilter />
            {teams.length === 0 ? (
              <div style={emptyStateStyle}>
                <div style={{
                  fontSize: theme.typography.fontSize.xl,
                  marginBottom: theme.spacing[2],
                }}>
                  👥
                </div>
                <div style={{
                  fontSize: theme.typography.fontSize.lg,
                  fontWeight: theme.typography.fontWeight.medium,
                  marginBottom: theme.spacing[2],
                }}>
                  No Teams Found
                </div>
                <div>
                  Try adjusting your filters to see more teams.
                </div>
              </div>
            ) : (
              <div style={gridStyle}>
                {teams.map((team) => (
                  <TeamCard
                    key={team.id}
                    team={team}
                    onShowDetails={handleShowDetails}
                    onEditTeam={handleEditTeam}
                  />
                ))}
              </div>
            )}
          </>
        );

      case 'schedules':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing[6] }}>
            {teams.map((team) => (
              <EscalationScheduleVisualizer
                key={team.id}
                team={team}
              />
            ))}
          </div>
        );

      case 'calendar':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing[6] }}>
            {teams.map((team) => (
              <OnCallCalendar
                key={team.id}
                team={team}
                onHandoffNotification={handleHandoffNotification}
              />
            ))}
          </div>
        );

      case 'performance':
        return <TeamPerformanceCharts teams={teams} />;

      case 'communication':
        return (
          <div>
            {!selectedTeamForTools ? (
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle>Select Team for Communication</CardTitle>
                </CardHeader>
                <CardContent>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: theme.spacing[3],
                  }}>
                    {teams.map((team) => (
                      <Button
                        key={team.id}
                        variant="ghost"
                        onClick={() => setSelectedTeamForTools(team)}
                        style={{
                          padding: theme.spacing[4],
                          height: 'auto',
                          flexDirection: 'column',
                          gap: theme.spacing[2],
                        }}
                      >
                        <div style={{
                          fontSize: theme.typography.fontSize.base,
                          fontWeight: theme.typography.fontWeight.medium,
                        }}>
                          {team.name}
                        </div>
                        <div style={{
                          fontSize: theme.typography.fontSize.xs,
                          color: theme.colors.textMuted,
                        }}>
                          {team.contactMethods.filter((m: any) => m.isActive).length} active channels
                        </div>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: theme.spacing[3],
                  marginBottom: theme.spacing[6],
                }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedTeamForTools(null)}
                  >
                    ← Back to Team Selection
                  </Button>
                  <h2 style={{
                    fontSize: theme.typography.fontSize.xl,
                    fontWeight: theme.typography.fontWeight.semibold,
                    margin: 0,
                  }}>
                    Communication Tools - {selectedTeamForTools.name}
                  </h2>
                </div>
                <CommunicationToolsPanel
                  team={selectedTeamForTools}
                  targetUser={targetUser || undefined}
                  urgency="medium"
                />
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      <ScreenReaderAnnouncement message={announcement} priority="polite" />
      
      <header style={pageHeaderStyle}>
        <h1 style={titleStyle}>Teams Management</h1>
        <div style={viewSelectorStyle}>
          <Button
            variant={activeView === 'directory' ? "primary" : "ghost"}
            size="sm"
            onClick={() => setActiveView('directory')}
          >
            👥 Directory
          </Button>
          <Button
            variant={activeView === 'schedules' ? "primary" : "ghost"}
            size="sm"
            onClick={() => setActiveView('schedules')}
          >
            📈 Escalation
          </Button>
          <Button
            variant={activeView === 'calendar' ? "primary" : "ghost"}
            size="sm"
            onClick={() => setActiveView('calendar')}
          >
            📅 On-Call
          </Button>
          <Button
            variant={activeView === 'performance' ? "primary" : "ghost"}
            size="sm"
            onClick={() => setActiveView('performance')}
          >
            📊 Performance
          </Button>
          <Button
            variant={activeView === 'communication' ? "primary" : "ghost"}
            size="sm"
            onClick={() => setActiveView('communication')}
          >
            💬 Communication
          </Button>
        </div>
      </header>

      {renderView()}

      <TeamDetailsPanel 
        team={selectedTeam}
        isOpen={showDetailsPanel}
        onClose={handleCloseDetails}
      />
    </div>
  );
};
