import React, { useState } from 'react';
import { format } from 'date-fns';
import { toZonedTime, format as formatTz } from 'date-fns-tz';
import type { Team } from '../types';
import { useTheme } from '../theme/utils';
import { Button, Card, CardHeader, CardTitle, CardContent, Modal, ModalHeader, ModalBody, ModalFooter } from './';

interface TeamDetailsPanelProps {
  team: Team | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TeamDetailsPanel: React.FC<TeamDetailsPanelProps> = ({ 
  team, 
  isOpen, 
  onClose 
}) => {
  const theme = useTheme();
  const getTeamMetrics = () => ({ avgResponseTime: 4.2, incidentCount: 12, uptime: 99.8, totalMembers: team?.members.length || 0, averageResponseTime: 4.2, resolutionRate: 92 });
  const addContactMethod = async () => {};
  const updateContactMethod = async () => {};
  const removeContactMethod = async () => {};
  
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'escalation' | 'oncall' | 'contacts'>('overview');
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [newContactType, setNewContactType] = useState<'email' | 'slack' | 'sms' | 'webhook'>('slack');
  const [newContactValue, setNewContactValue] = useState('');

  if (!team) return null;

  const teamMembers = team?.members || [];
  const currentOnCall = team?.onCallSchedule.rotation.find(r => r.isActive);
  const upcomingOnCall = team?.onCallSchedule.rotation.find((rotation, i, arr) => {
    const currentIndex = arr.findIndex(rot => rot.isActive);
    return i === (currentIndex + 1) % arr.length;
  });
  const metrics = getTeamMetrics();

  const formatTimezone = (timestamp: string, timezone: string): string => {
    try {
      const date = new Date(timestamp);
      const zonedDate = toZonedTime(date, timezone);
      return formatTz(zonedDate, 'MMM dd, yyyy HH:mm zzz', { timeZone: timezone });
    } catch (error) {
      return format(new Date(timestamp), 'MMM dd, yyyy HH:mm');
    }
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

  const getInitials = (name: string): string => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleAddContact = async () => {
    if (!newContactValue.trim()) return;

    try {
      await addContactMethod(team.id, {
        type: newContactType,
        value: newContactValue.trim(),
        isActive: true
      });
      setNewContactValue('');
      setIsAddingContact(false);
    } catch (error) {
      console.error('Error adding contact method:', error);
    }
  };

  const handleRemoveContact = async (methodId: string) => {
    try {
      await removeContactMethod(team.id, methodId);
    } catch (error) {
      console.error('Error removing contact method:', error);
    }
  };

  const handleToggleContact = async (methodId: string, isActive: boolean) => {
    try {
      await updateContactMethod(team.id, methodId, { isActive: !isActive });
    } catch (error) {
      console.error('Error toggling contact method:', error);
    }
  };

  const tabStyle = (isActive: boolean): React.CSSProperties => ({
    padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
    border: 'none',
    backgroundColor: isActive ? theme.colors.primary : 'transparent',
    color: isActive ? '#ffffff' : theme.colors.text,
    borderRadius: theme.borderRadius.sm,
    cursor: 'pointer',
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    transition: `all ${theme.animation.duration.fast}`,
  });

  const memberItemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing[3],
    padding: theme.spacing[3],
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.sm,
    border: `1px solid ${theme.colors.border}`,
    marginBottom: theme.spacing[2],
  };

  const avatarStyle: React.CSSProperties = {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: theme.colors.primary,
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
  };

  const roleStyle = (role: string): React.CSSProperties => ({
    padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
    borderRadius: theme.borderRadius.sm,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium,
    textTransform: 'uppercase',
    color: '#ffffff',
    backgroundColor: getRoleColor(role),
    letterSpacing: '0.025em',
  });

  const escalationStepStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing[2],
    padding: theme.spacing[3],
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.sm,
    border: `1px solid ${theme.colors.border}`,
    marginBottom: theme.spacing[2],
  };

  const contactMethodStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing[2],
    padding: theme.spacing[3],
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.sm,
    border: `1px solid ${theme.colors.border}`,
    marginBottom: theme.spacing[2],
  };

  const renderOverview = () => (
    <div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: theme.spacing[4],
        marginBottom: theme.spacing[6],
      }}>
        <div style={{
          textAlign: 'center',
          padding: theme.spacing[4],
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.md,
          border: `1px solid ${theme.colors.border}`,
        }}>
          <div style={{
            fontSize: theme.typography.fontSize['2xl'],
            fontWeight: theme.typography.fontWeight.bold,
            color: theme.colors.text,
            marginBottom: theme.spacing[1],
          }}>
            {metrics.totalMembers}
          </div>
          <div style={{
            fontSize: theme.typography.fontSize.sm,
            color: theme.colors.textMuted,
          }}>
            Total Members
          </div>
        </div>
        <div style={{
          textAlign: 'center',
          padding: theme.spacing[4],
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.md,
          border: `1px solid ${theme.colors.border}`,
        }}>
          <div style={{
            fontSize: theme.typography.fontSize['2xl'],
            fontWeight: theme.typography.fontWeight.bold,
            color: theme.colors.text,
            marginBottom: theme.spacing[1],
          }}>
            {metrics.averageResponseTime?.toFixed(1)}m
          </div>
          <div style={{
            fontSize: theme.typography.fontSize.sm,
            color: theme.colors.textMuted,
          }}>
            Avg Response Time
          </div>
        </div>
        <div style={{
          textAlign: 'center',
          padding: theme.spacing[4],
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.md,
          border: `1px solid ${theme.colors.border}`,
        }}>
          <div style={{
            fontSize: theme.typography.fontSize['2xl'],
            fontWeight: theme.typography.fontWeight.bold,
            color: theme.colors.text,
            marginBottom: theme.spacing[1],
          }}>
            {metrics.resolutionRate?.toFixed(0)}%
          </div>
          <div style={{
            fontSize: theme.typography.fontSize.sm,
            color: theme.colors.textMuted,
          }}>
            Resolution Rate
          </div>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: theme.spacing[4],
      }}>
        <Card>
          <CardHeader>
            <CardTitle>On-Call Status</CardTitle>
          </CardHeader>
          <CardContent>
            {currentOnCall ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: theme.spacing[2],
                padding: theme.spacing[3],
                backgroundColor: '#dcfce7',
                borderRadius: theme.borderRadius.sm,
                border: '1px solid #16a34a',
                marginBottom: theme.spacing[2],
              }}>
                <span>🟢</span>
                <div>
                  <div style={{ fontWeight: theme.typography.fontWeight.medium }}>
                    User {currentOnCall.userId}
                  </div>
                  <div style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.textMuted }}>
                    Currently on call
                  </div>
                </div>
              </div>
            ) : (
              <div style={{
                padding: theme.spacing[3],
                backgroundColor: '#fef3c7',
                borderRadius: theme.borderRadius.sm,
                border: '1px solid #f59e0b',
                color: theme.colors.text,
              }}>
                No one currently on call
              </div>
            )}
            
            {upcomingOnCall && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: theme.spacing[2],
                padding: theme.spacing[3],
                backgroundColor: '#f0f9ff',
                borderRadius: theme.borderRadius.sm,
                border: `1px solid ${theme.colors.border}`,
              }}>
                <span>📅</span>
                <div>
                  <div style={{ fontWeight: theme.typography.fontWeight.medium }}>
                    User {upcomingOnCall.userId}
                  </div>
                  <div style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.textMuted }}>
                    Next on call
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{
              color: theme.colors.textMuted,
              fontSize: theme.typography.fontSize.sm,
              fontStyle: 'italic',
            }}>
              Activity tracking will be implemented with event correlation
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderMembers = () => (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing[4],
      }}>
        <h3 style={{
          fontSize: theme.typography.fontSize.lg,
          fontWeight: theme.typography.fontWeight.semibold,
          margin: 0,
        }}>
          Team Members ({teamMembers.length})
        </h3>
        <Button variant="primary" size="sm">
          Add Member
        </Button>
      </div>

      {teamMembers.map((member: any) => {
        const teamMember = team.members.find(m => m.userId === member.id);
        return (
          <div key={member.id} style={memberItemStyle}>
            <div style={avatarStyle}>
              {member.userId.slice(0,2).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ 
                fontWeight: theme.typography.fontWeight.medium,
                color: theme.colors.text,
                fontSize: theme.typography.fontSize.base,
                marginBottom: theme.spacing[0.5],
              }}>
                User {member.userId}
              </div>
              <div style={{
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.textMuted,
                marginBottom: theme.spacing[1],
              }}>
                {member.email}
              </div>
              <div style={{
                fontSize: theme.typography.fontSize.xs,
                color: theme.colors.textMuted,
              }}>
                Joined {format(new Date(teamMember?.joinedAt || ''), 'MMM dd, yyyy')}
              </div>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: theme.spacing[2],
            }}>
              {teamMember && (
                <div style={roleStyle(teamMember.role)}>
                  {teamMember.role}
                </div>
              )}
              <div style={{
                fontSize: theme.typography.fontSize.xs,
                color: theme.colors.textMuted,
              }}>
                {member.role}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderEscalation = () => (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing[4],
      }}>
        <h3 style={{
          fontSize: theme.typography.fontSize.lg,
          fontWeight: theme.typography.fontWeight.semibold,
          margin: 0,
        }}>
          Escalation Policy ({team.escalationPolicy.steps.length} steps)
        </h3>
        <div style={{
          fontSize: theme.typography.fontSize.sm,
          color: theme.colors.textMuted,
        }}>
          Total timeout: {team.escalationPolicy.timeout} minutes
        </div>
      </div>

      {team.escalationPolicy.steps
        .sort((a, b) => a.order - b.order)
        .map((step) => {
          const targetTeam = step.targetType === 'team' ? 
            step.targetId : null;

          return (
            <div key={step.id} style={escalationStepStyle}>
              <div style={{
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
              }}>
                {step.order}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontWeight: theme.typography.fontWeight.medium,
                  color: theme.colors.text,
                  marginBottom: theme.spacing[0.5],
                }}>
                  {step.targetType === 'user' ? 
                    `User ${step.targetId}` :
                    `Team ${targetTeam}`
                  }
                </div>
                <div style={{
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.textMuted,
                }}>
                  Timeout: {step.timeout} minutes
                </div>
              </div>
              <div style={{
                fontSize: theme.typography.fontSize.xs,
                color: theme.colors.textMuted,
                textTransform: 'uppercase',
                backgroundColor: theme.colors.surface,
                padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
                borderRadius: theme.borderRadius.sm,
              }}>
                {step.targetType}
              </div>
            </div>
          );
        })}
    </div>
  );

  const renderOnCall = () => (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing[4],
      }}>
        <h3 style={{
          fontSize: theme.typography.fontSize.lg,
          fontWeight: theme.typography.fontWeight.semibold,
          margin: 0,
        }}>
          On-Call Schedule
        </h3>
        <div style={{
          fontSize: theme.typography.fontSize.sm,
          color: theme.colors.textMuted,
        }}>
          Timezone: {team.onCallSchedule.timezone}
        </div>
      </div>

      {team.onCallSchedule.rotation.map((rotation) => {
        const isActive = rotation.isActive;
        const isCurrent = currentOnCall?.id === rotation.userId;

        return (
          <div key={rotation.id} style={{
            ...memberItemStyle,
            backgroundColor: isCurrent ? '#dcfce7' : theme.colors.surface,
            border: `1px solid ${isCurrent ? '#16a34a' : theme.colors.border}`,
          }}>
            <div style={{
              ...avatarStyle,
              backgroundColor: isCurrent ? '#16a34a' : theme.colors.primary,
            }}>
              {rotation.userId.slice(0,2).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ 
                fontWeight: theme.typography.fontWeight.medium,
                color: theme.colors.text,
                fontSize: theme.typography.fontSize.base,
                marginBottom: theme.spacing[0.5],
              }}>
                User {rotation.userId}
                {isCurrent && (
                  <span style={{
                    marginLeft: theme.spacing[2],
                    color: '#16a34a',
                    fontSize: theme.typography.fontSize.xs,
                    fontWeight: theme.typography.fontWeight.bold,
                  }}>
                    (CURRENT)
                  </span>
                )}
              </div>
              <div style={{
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.textMuted,
                marginBottom: theme.spacing[1],
              }}>
                {formatTimezone(rotation.startTime, team.onCallSchedule.timezone)} →{' '}
                {formatTimezone(rotation.endTime, team.onCallSchedule.timezone)}
              </div>
              <div style={{
                fontSize: theme.typography.fontSize.xs,
                color: theme.colors.textMuted,
              }}>
                Status: {isActive ? 'Active' : 'Inactive'}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderContacts = () => (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing[4],
      }}>
        <h3 style={{
          fontSize: theme.typography.fontSize.lg,
          fontWeight: theme.typography.fontWeight.semibold,
          margin: 0,
        }}>
          Contact Methods ({team.contactMethods.length})
        </h3>
        <Button 
          variant="primary" 
          size="sm"
          onClick={() => setIsAddingContact(true)}
        >
          Add Contact
        </Button>
      </div>

      {team.contactMethods.map((method) => (
        <div key={method.id} style={contactMethodStyle}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing[2],
          }}>
            <span style={{ fontSize: theme.typography.fontSize.lg }}>
              {getContactTypeIcon(method.type)}
            </span>
            <div>
              <div style={{
                fontWeight: theme.typography.fontWeight.medium,
                color: theme.colors.text,
                fontSize: theme.typography.fontSize.base,
                marginBottom: theme.spacing[0.5],
              }}>
                {method.value}
              </div>
              <div style={{
                fontSize: theme.typography.fontSize.xs,
                color: theme.colors.textMuted,
                textTransform: 'uppercase',
              }}>
                {method.type}
              </div>
            </div>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing[2],
          }}>
            <div style={{
              padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
              borderRadius: theme.borderRadius.sm,
              fontSize: theme.typography.fontSize.xs,
              fontWeight: theme.typography.fontWeight.medium,
              backgroundColor: method.isActive ? '#dcfce7' : '#fef3c7',
              color: method.isActive ? '#16a34a' : '#f59e0b',
            }}>
              {method.isActive ? 'Active' : 'Inactive'}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleToggleContact(method.id, method.isActive)}
            >
              {method.isActive ? 'Disable' : 'Enable'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRemoveContact(method.id)}
              style={{ color: '#ef4444' }}
            >
              Remove
            </Button>
          </div>
        </div>
      ))}

      {isAddingContact && (
        <Card style={{ marginTop: theme.spacing[4] }}>
          <CardHeader>
            <CardTitle>Add Contact Method</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{
              display: 'flex',
              gap: theme.spacing[3],
              alignItems: 'end',
            }}>
              <div style={{ flex: 1 }}>
                <label style={{
                  display: 'block',
                  fontSize: theme.typography.fontSize.sm,
                  fontWeight: theme.typography.fontWeight.medium,
                  color: theme.colors.text,
                  marginBottom: theme.spacing[1],
                }}>
                  Type
                </label>
                <select
                  value={newContactType}
                  onChange={(e) => setNewContactType(e.target.value as any)}
                  style={{
                    width: '100%',
                    padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: theme.borderRadius.sm,
                    backgroundColor: theme.colors.surface,
                    color: theme.colors.text,
                    fontSize: theme.typography.fontSize.sm,
                  }}
                >
                  <option value="slack">Slack</option>
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                  <option value="webhook">Webhook</option>
                </select>
              </div>
              <div style={{ flex: 2 }}>
                <label style={{
                  display: 'block',
                  fontSize: theme.typography.fontSize.sm,
                  fontWeight: theme.typography.fontWeight.medium,
                  color: theme.colors.text,
                  marginBottom: theme.spacing[1],
                }}>
                  Value
                </label>
                <input
                  type="text"
                  value={newContactValue}
                  onChange={(e) => setNewContactValue(e.target.value)}
                  placeholder={
                    newContactType === 'slack' ? '#channel or @user' :
                    newContactType === 'email' ? 'email@example.com' :
                    newContactType === 'sms' ? '+1234567890' :
                    'https://webhook.url'
                  }
                  style={{
                    width: '100%',
                    padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: theme.borderRadius.sm,
                    backgroundColor: theme.colors.surface,
                    color: theme.colors.text,
                    fontSize: theme.typography.fontSize.sm,
                  }}
                />
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={handleAddContact}
                disabled={!newContactValue.trim()}
              >
                Add
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsAddingContact(false);
                  setNewContactValue('');
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalHeader>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: theme.spacing[3],
        }}>
          <h2 style={{
            fontSize: theme.typography.fontSize['2xl'],
            fontWeight: theme.typography.fontWeight.bold,
            margin: 0,
          }}>
            {team.name}
          </h2>
          <div style={{
            padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
            backgroundColor: theme.colors.primary,
            color: '#ffffff',
            borderRadius: theme.borderRadius.sm,
            fontSize: theme.typography.fontSize.xs,
            fontWeight: theme.typography.fontWeight.medium,
          }}>
            {metrics.totalMembers} members
          </div>
        </div>
        <p style={{
          color: theme.colors.textSecondary,
          margin: `${theme.spacing[2]} 0 0 0`,
          fontSize: theme.typography.fontSize.base,
        }}>
          {team.description}
        </p>
      </ModalHeader>

      <ModalBody>
        <div style={{
          display: 'flex',
          gap: theme.spacing[2],
          marginBottom: theme.spacing[6],
          borderBottom: `1px solid ${theme.colors.border}`,
          paddingBottom: theme.spacing[2],
        }}>
          {(['overview', 'members', 'escalation', 'oncall', 'contacts'] as const).map((tab) => (
            <button
              key={tab}
              style={tabStyle(activeTab === tab)}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div style={{ minHeight: '400px' }}>
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'members' && renderMembers()}
          {activeTab === 'escalation' && renderEscalation()}
          {activeTab === 'oncall' && renderOnCall()}
          {activeTab === 'contacts' && renderContacts()}
        </div>
      </ModalBody>

      <ModalFooter>
        <Button variant="ghost" onClick={onClose}>
          Close
        </Button>
        <Button variant="primary">
          Edit Team
        </Button>
      </ModalFooter>
    </Modal>
  );
};