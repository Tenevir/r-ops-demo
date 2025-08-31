import React, { useState, useMemo } from 'react';
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
import { dataStore } from '../data';

interface TeamFilters {
  search: string;
  memberCount: 'all' | 'small' | 'medium' | 'large';
  hasOnCall: boolean | null;
  hasEscalation: boolean | null;
}

export const Teams = () => {
  const theme = useTheme();
  const allTeams: Team[] = dataStore.getTeams();
  const allUsers: User[] = dataStore.getUsers();
  const isLoading = false;
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [showDetailsPanel, setShowDetailsPanel] = useState(false);
  const [activeView, setActiveView] = useState<'directory' | 'schedules' | 'calendar' | 'performance' | 'communication'>('directory');
  const [announcement, setAnnouncement] = useState('');
  const [selectedTeamForTools, setSelectedTeamForTools] = useState<Team | null>(null);
  const [targetUser] = useState<User | null>(null);
  const [filters, setFilters] = useState<TeamFilters>({
    search: '',
    memberCount: 'all',
    hasOnCall: null,
    hasEscalation: null,
  });

  // Filter teams based on current filters
  const filteredTeams = useMemo(() => {
    return allTeams.filter(team => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const teamMatches = team.name.toLowerCase().includes(searchLower) ||
                          team.description.toLowerCase().includes(searchLower);
        const memberMatches = team.members.some(member => {
          const user = allUsers.find(u => u.id === member.userId);
          return user?.name.toLowerCase().includes(searchLower) ||
                 user?.email.toLowerCase().includes(searchLower);
        });
        if (!teamMatches && !memberMatches) return false;
      }

      // Member count filter
      if (filters.memberCount !== 'all') {
        const memberCount = team.members.length;
        if (filters.memberCount === 'small' && memberCount > 3) return false;
        if (filters.memberCount === 'medium' && (memberCount <= 3 || memberCount > 8)) return false;
        if (filters.memberCount === 'large' && memberCount <= 8) return false;
      }

      // On-call filter
      if (filters.hasOnCall === true) {
        const hasActiveOnCall = team.onCallSchedule.rotation.some(r => r.isActive);
        if (!hasActiveOnCall) return false;
      }

      // Escalation filter
      if (filters.hasEscalation === true) {
        if (team.escalationPolicy.steps.length === 0) return false;
      }

      return true;
    });
  }, [allTeams, allUsers, filters]);

  const handleShowDetails = (team: Team) => {
    setSelectedTeam(team);
    setShowDetailsPanel(true);
  };

  const handleCloseDetails = () => {
    setShowDetailsPanel(false);
    setSelectedTeam(null);
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
            <TeamFilter 
              teams={allTeams}
              filters={filters}
              onFiltersChange={setFilters}
            />
            {filteredTeams.length === 0 ? (
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
                  {allTeams.length === 0 ? 'No Teams Available' : 'No Teams Found'}
                </div>
                <div>
                  {allTeams.length === 0 ? 'Create your first team to get started.' : 'Try adjusting your filters to see more teams.'}
                </div>
              </div>
            ) : (
              <div style={gridStyle}>
                {filteredTeams.map((team) => (
                  <TeamCard
                    key={team.id}
                    team={team}
                    onShowDetails={() => handleShowDetails(team)}
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
            {filteredTeams.map((team) => (
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
            {filteredTeams.map((team) => (
              <OnCallCalendar
                key={team.id}
                team={team}
                onHandoffNotification={handleHandoffNotification}
              />
            ))}
          </div>
        );

      case 'performance':
        return <TeamPerformanceCharts teams={filteredTeams} />;

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
                    {filteredTeams.map((team) => (
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
                          {team.contactMethods.filter((m) => m.isActive).length} active channels
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
