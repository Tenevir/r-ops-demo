import React from 'react';
import type { Team } from '../types';
import { useTheme } from '../theme/utils';
import { Button, Card, CardHeader, CardTitle, CardContent } from './';

interface TeamCardProps {
  team: Team;
  onShowDetails?: (team: Team) => void;
  onEditTeam?: (team: Team) => void;
}

export const TeamCard: React.FC<TeamCardProps> = ({ 
  team, 
  onShowDetails,
  onEditTeam
}) => {
  const theme = useTheme();
  const teamMembers = team.members;
  const currentOnCall = team.onCallSchedule.rotation.find(r => r.isActive);
  const upcomingOnCall = team.onCallSchedule.rotation.find((rotation, i, arr) => {
    const currentIndex = arr.findIndex(rot => rot.isActive);
    return i === (currentIndex + 1) % arr.length;
  });
  const metrics = { 
    avgResponseTime: 4.2, 
    incidentCount: 12, 
    uptime: 99.8,
    totalMembers: team.members.length,
    escalationSteps: team.escalationPolicy.steps.length,
    activeContactMethods: team.contactMethods.filter(c => c.isActive).length,
    averageResponseTime: 4.2,
    alertsHandled: 15,
    resolutionRate: 92
  };

  const getRoleColor = (role: string): string => {
    switch (role) {
      case 'lead': return '#8b5cf6';
      case 'oncall': return '#f59e0b';
      case 'member': return '#6b7280';
      default: return theme.colors.textMuted;
    }
  };

  const getContactTypeIcon = (type: string): string => {
    switch (type) {
      case 'slack': return '💬';
      case 'email': return '📧';
      case 'sms': return '📱';
      case 'webhook': return '🔗';
      default: return '📞';
    }
  };

  const cardStyle: React.CSSProperties = {
    transition: `all ${theme.animation.duration.fast} ${theme.animation.easing.easeOut}`,
    borderLeft: `4px solid ${theme.colors.primary}`,
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: theme.spacing[3],
    gap: theme.spacing[2],
  };

  const metadataStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing[2],
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing[4],
    flexWrap: 'wrap',
  };

  const sectionStyle: React.CSSProperties = {
    marginBottom: theme.spacing[4],
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing[2],
  };

  const memberListStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing[2],
  };

  const memberItemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing[2],
    padding: theme.spacing[2],
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.sm,
    border: `1px solid ${theme.colors.border}`,
  };

  const avatarStyle: React.CSSProperties = {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: theme.colors.primary,
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
  };

  const roleStyle = (role: string): React.CSSProperties => ({
    padding: `${theme.spacing[0.5]} ${theme.spacing[1.5]}`,
    borderRadius: theme.borderRadius.sm,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium,
    textTransform: 'uppercase',
    color: '#ffffff',
    backgroundColor: getRoleColor(role),
    letterSpacing: '0.025em',
  });

  const onCallIndicatorStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing[1],
    padding: theme.spacing[2],
    backgroundColor: currentOnCall ? '#dcfce7' : '#fef3c7',
    borderRadius: theme.borderRadius.sm,
    border: `1px solid ${currentOnCall ? '#16a34a' : '#f59e0b'}`,
    fontSize: theme.typography.fontSize.sm,
  };

  const contactMethodsStyle: React.CSSProperties = {
    display: 'flex',
    gap: theme.spacing[1],
    flexWrap: 'wrap',
  };

  const contactBadgeStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing[1],
    padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.sm,
    border: `1px solid ${theme.colors.border}`,
    fontSize: theme.typography.fontSize.xs,
  };

  const actionsStyle: React.CSSProperties = {
    display: 'flex',
    gap: theme.spacing[2],
    marginTop: theme.spacing[4],
  };

  const getInitials = (name: string): string => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Card variant="elevated" style={cardStyle}>
      <CardHeader>
        <div style={headerStyle}>
          <div style={{ flex: 1 }}>
            <CardTitle style={{ margin: 0, marginBottom: theme.spacing[1] }}>
              {team.name}
            </CardTitle>
            <p style={{
              color: theme.colors.textSecondary,
              fontSize: theme.typography.fontSize.sm,
              margin: 0,
              lineHeight: theme.typography.lineHeight.relaxed,
            }}>
              {team.description}
            </p>
          </div>
        </div>
        
        <div style={metadataStyle}>
          <span>{metrics.totalMembers} members</span>
          <span aria-hidden="true">•</span>
          <span>{metrics.escalationSteps} escalation steps</span>
          <span aria-hidden="true">•</span>
          <span>{metrics.activeContactMethods} contact methods</span>
        </div>
      </CardHeader>

      <CardContent>
        {/* On-Call Status */}
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>On-Call Status</div>
          <div style={onCallIndicatorStyle}>
            <span>{currentOnCall ? '🟢' : '🟡'}</span>
            <span>
              {currentOnCall 
                ? `${currentOnCall.name} is currently on call`
                : 'No one currently on call'
              }
            </span>
          </div>
          {upcomingOnCall && (
            <div style={{
              ...onCallIndicatorStyle,
              backgroundColor: '#f0f9ff',
              border: `1px solid ${theme.colors.border}`,
              marginTop: theme.spacing[2],
            }}>
              <span>📅</span>
              <span>Next: {upcomingOnCall.name}</span>
            </div>
          )}
        </div>

        {/* Team Members */}
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>Team Members ({teamMembers.length})</div>
          <div style={memberListStyle}>
            {teamMembers.slice(0, 3).map((member: any) => {
              const teamMember = team.members.find(m => m.userId === member.id);
              return (
                <div key={member.id} style={memberItemStyle}>
                  <div style={avatarStyle}>
                    {getInitials(member.name)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      fontWeight: theme.typography.fontWeight.medium,
                      color: theme.colors.text,
                      fontSize: theme.typography.fontSize.sm,
                    }}>
                      {member.name}
                    </div>
                    <div style={{
                      fontSize: theme.typography.fontSize.xs,
                      color: theme.colors.textMuted,
                    }}>
                      {member.email}
                    </div>
                  </div>
                  {teamMember && (
                    <div style={roleStyle(teamMember.role)}>
                      {teamMember.role}
                    </div>
                  )}
                </div>
              );
            })}
            {teamMembers.length > 3 && (
              <div style={{
                ...memberItemStyle,
                justifyContent: 'center',
                color: theme.colors.textMuted,
                fontSize: theme.typography.fontSize.sm,
              }}>
                +{teamMembers.length - 3} more members
              </div>
            )}
          </div>
        </div>

        {/* Contact Methods */}
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>Contact Methods</div>
          <div style={contactMethodsStyle}>
            {team.contactMethods.filter(method => method.isActive).map((method) => (
              <div key={method.id} style={contactBadgeStyle}>
                <span>{getContactTypeIcon(method.type)}</span>
                <span>{method.value}</span>
              </div>
            ))}
            {team.contactMethods.filter(method => method.isActive).length === 0 && (
              <div style={{
                color: theme.colors.textMuted,
                fontSize: theme.typography.fontSize.sm,
                fontStyle: 'italic',
              }}>
                No active contact methods
              </div>
            )}
          </div>
        </div>

        {/* Quick Metrics */}
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>Performance Overview</div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: theme.spacing[2],
          }}>
            <div style={{
              textAlign: 'center',
              padding: theme.spacing[2],
              backgroundColor: theme.colors.surface,
              borderRadius: theme.borderRadius.sm,
              border: `1px solid ${theme.colors.border}`,
            }}>
              <div style={{
                fontSize: theme.typography.fontSize.lg,
                fontWeight: theme.typography.fontWeight.bold,
                color: theme.colors.text,
              }}>
                {metrics.averageResponseTime?.toFixed(1)}m
              </div>
              <div style={{
                fontSize: theme.typography.fontSize.xs,
                color: theme.colors.textMuted,
              }}>
                Avg Response
              </div>
            </div>
            <div style={{
              textAlign: 'center',
              padding: theme.spacing[2],
              backgroundColor: theme.colors.surface,
              borderRadius: theme.borderRadius.sm,
              border: `1px solid ${theme.colors.border}`,
            }}>
              <div style={{
                fontSize: theme.typography.fontSize.lg,
                fontWeight: theme.typography.fontWeight.bold,
                color: theme.colors.text,
              }}>
                {metrics.alertsHandled}
              </div>
              <div style={{
                fontSize: theme.typography.fontSize.xs,
                color: theme.colors.textMuted,
              }}>
                Alerts Handled
              </div>
            </div>
            <div style={{
              textAlign: 'center',
              padding: theme.spacing[2],
              backgroundColor: theme.colors.surface,
              borderRadius: theme.borderRadius.sm,
              border: `1px solid ${theme.colors.border}`,
            }}>
              <div style={{
                fontSize: theme.typography.fontSize.lg,
                fontWeight: theme.typography.fontWeight.bold,
                color: theme.colors.text,
              }}>
                {metrics.resolutionRate?.toFixed(0)}%
              </div>
              <div style={{
                fontSize: theme.typography.fontSize.xs,
                color: theme.colors.textMuted,
              }}>
                Resolution Rate
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={actionsStyle}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onShowDetails?.(team)}
            aria-label={`View details for ${team.name}`}
          >
            View Details
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onEditTeam?.(team)}
            aria-label={`Edit ${team.name}`}
          >
            Edit Team
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};