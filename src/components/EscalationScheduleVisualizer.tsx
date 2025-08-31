import React, { useState, useMemo } from 'react';
import { format, addMinutes } from 'date-fns';
import { toZonedTime, format as formatTz } from 'date-fns-tz';
import type { Team, EscalationStep } from '../types';
import { useTheme } from '../theme/utils';
import { Button, Card, CardHeader, CardTitle, CardContent } from './';

interface EscalationScheduleVisualizerProps {
  team: Team;
  userTimezone?: string;
}

export const EscalationScheduleVisualizer: React.FC<EscalationScheduleVisualizerProps> = ({ 
  team,
  userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
}) => {
  const theme = useTheme();
  const getTeamMembers = () => team.members;
  const [isEditing, setIsEditing] = useState(false);
  const [selectedStep, setSelectedStep] = useState<EscalationStep | null>(null);
  const [showTimezoneComparison, setShowTimezoneComparison] = useState(false);

  const teamMembers = getTeamMembers();

  // Calculate escalation timeline
  const escalationTimeline = useMemo(() => {
    const steps = [...team.escalationPolicy.steps].sort((a, b) => a.order - b.order);
    let cumulativeTime = 0;
    
    return steps.map((step, index) => {
      const startTime = cumulativeTime;
      cumulativeTime += step.timeout;
      

      return {
        ...step,
        startMinutes: startTime,
        endMinutes: cumulativeTime,
        duration: step.timeout,
        targetName: step.targetType === 'user' ? 
          `User ${step.targetId}` :
          `Team ${step.targetId}`,
        isLast: index === steps.length - 1
      };
    });
  }, [team.escalationPolicy.steps, teamMembers]);

  const formatTimeInTimezone = (minutes: number, timezone: string): string => {
    try {
      const baseTime = new Date('2024-01-01T00:00:00Z'); // Reference time
      const timeWithMinutes = addMinutes(baseTime, minutes);
      const zonedTime = toZonedTime(timeWithMinutes, timezone);
      return formatTz(zonedTime, 'HH:mm', { timeZone: timezone });
    } catch (error) {
      return `+${minutes}m`;
    }
  };

  const getStepColor = (index: number): string => {
    const colors = ['#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981'];
    return colors[index % colors.length];
  };

  const stepStyle = (step: typeof escalationTimeline[0], index: number): React.CSSProperties => {
    const stepColor = getStepColor(index);
    const widthPercentage = (step.duration / team.escalationPolicy.timeout) * 100;

    return {
      position: 'relative',
      width: `${widthPercentage}%`,
      minWidth: '120px',
      height: '60px',
      backgroundColor: stepColor,
      color: '#ffffff',
      borderRadius: theme.borderRadius.sm,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      cursor: 'pointer',
      transition: `all ${theme.animation.duration.fast}`,
      border: selectedStep?.id === step.id ? '3px solid #ffffff' : 'none',
      boxShadow: selectedStep?.id === step.id ? theme.elevation.lg : theme.elevation.sm,
    };
  };

  const timelineContainerStyle: React.CSSProperties = {
    display: 'flex',
    gap: theme.spacing[1],
    marginBottom: theme.spacing[4],
    overflowX: 'auto',
    padding: theme.spacing[2],
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    border: `1px solid ${theme.colors.border}`,
  };

  const detailsPanelStyle: React.CSSProperties = {
    padding: theme.spacing[4],
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    border: `1px solid ${theme.colors.border}`,
    marginTop: theme.spacing[4],
  };

  const timezoneComparisonStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: theme.spacing[3],
    marginTop: theme.spacing[4],
    padding: theme.spacing[3],
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    border: `1px solid ${theme.colors.border}`,
  };

  const renderStepDetails = () => {
    if (!selectedStep) return null;

    const stepInfo = escalationTimeline.find(s => s.id === selectedStep.id);
    if (!stepInfo) return null;

    return (
      <div style={detailsPanelStyle}>
        <h4 style={{
          fontSize: theme.typography.fontSize.lg,
          fontWeight: theme.typography.fontWeight.semibold,
          margin: `0 0 ${theme.spacing[3]} 0`,
          color: theme.colors.text,
        }}>
          Step {stepInfo.order} Details
        </h4>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: theme.spacing[4],
        }}>
          <div>
            <div style={{
              fontSize: theme.typography.fontSize.sm,
              fontWeight: theme.typography.fontWeight.medium,
              color: theme.colors.text,
              marginBottom: theme.spacing[1],
            }}>
              Target
            </div>
            <div style={{
              fontSize: theme.typography.fontSize.base,
              color: theme.colors.textSecondary,
            }}>
              {stepInfo.targetName}
            </div>
          </div>

          <div>
            <div style={{
              fontSize: theme.typography.fontSize.sm,
              fontWeight: theme.typography.fontWeight.medium,
              color: theme.colors.text,
              marginBottom: theme.spacing[1],
            }}>
              Timeout
            </div>
            <div style={{
              fontSize: theme.typography.fontSize.base,
              color: theme.colors.textSecondary,
            }}>
              {stepInfo.timeout} minutes
            </div>
          </div>

          <div>
            <div style={{
              fontSize: theme.typography.fontSize.sm,
              fontWeight: theme.typography.fontWeight.medium,
              color: theme.colors.text,
              marginBottom: theme.spacing[1],
            }}>
              Timeline
            </div>
            <div style={{
              fontSize: theme.typography.fontSize.base,
              color: theme.colors.textSecondary,
            }}>
              {stepInfo.startMinutes}m - {stepInfo.endMinutes}m
            </div>
          </div>

          <div>
            <div style={{
              fontSize: theme.typography.fontSize.sm,
              fontWeight: theme.typography.fontWeight.medium,
              color: theme.colors.text,
              marginBottom: theme.spacing[1],
            }}>
              Type
            </div>
            <div style={{
              fontSize: theme.typography.fontSize.base,
              color: theme.colors.textSecondary,
              textTransform: 'capitalize',
            }}>
              {stepInfo.targetType}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTimezoneComparison = () => {
    if (!showTimezoneComparison) return null;

    const timezones = [
      'America/New_York',
      'America/Los_Angeles', 
      'Europe/London',
      'Europe/Paris',
      'Asia/Tokyo',
      userTimezone
    ].filter((tz, index, arr) => arr.indexOf(tz) === index); // Remove duplicates

    return (
      <div style={timezoneComparisonStyle}>
        <h4 style={{
          gridColumn: '1 / -1',
          fontSize: theme.typography.fontSize.lg,
          fontWeight: theme.typography.fontWeight.semibold,
          margin: `0 0 ${theme.spacing[3]} 0`,
          color: theme.colors.text,
        }}>
          Escalation Timeline in Different Timezones
        </h4>

        {timezones.map((timezone) => (
          <div key={timezone}>
            <div style={{
              fontSize: theme.typography.fontSize.sm,
              fontWeight: theme.typography.fontWeight.medium,
              color: theme.colors.text,
              marginBottom: theme.spacing[2],
            }}>
              {timezone.replace('_', ' ')}
            </div>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: theme.spacing[1],
            }}>
              {escalationTimeline.map((step) => (
                <div key={step.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: theme.spacing[1],
                  fontSize: theme.typography.fontSize.xs,
                  backgroundColor: theme.colors.surface,
                  borderRadius: theme.borderRadius.sm,
                  border: `1px solid ${theme.colors.border}`,
                }}>
                  <span>Step {step.order}</span>
                  <span>
                    {formatTimeInTimezone(step.startMinutes, timezone)} - {formatTimeInTimezone(step.endMinutes, timezone)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card variant="elevated">
      <CardHeader>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <CardTitle>Escalation Schedule - {team.name}</CardTitle>
          <div style={{
            display: 'flex',
            gap: theme.spacing[2],
          }}>
            <Button
              variant={showTimezoneComparison ? "primary" : "ghost"}
              size="sm"
              onClick={() => setShowTimezoneComparison(!showTimezoneComparison)}
            >
              🌍 Timezones
            </Button>
            <Button
              variant={isEditing ? "primary" : "ghost"}
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              ✏️ Edit
            </Button>
          </div>
        </div>
        <div style={{
          fontSize: theme.typography.fontSize.sm,
          color: theme.colors.textMuted,
          marginTop: theme.spacing[1],
        }}>
          Total escalation time: {team.escalationPolicy.timeout} minutes • {escalationTimeline.length} steps
        </div>
      </CardHeader>

      <CardContent>
        {/* Visual Timeline */}
        <div style={{
          marginBottom: theme.spacing[4],
        }}>
          <div style={{
            fontSize: theme.typography.fontSize.sm,
            fontWeight: theme.typography.fontWeight.medium,
            color: theme.colors.text,
            marginBottom: theme.spacing[2],
          }}>
            Escalation Timeline
          </div>
          <div style={timelineContainerStyle}>
            {escalationTimeline.map((step, index) => (
              <div
                key={step.id}
                style={stepStyle(step, index)}
                onClick={() => setSelectedStep(selectedStep?.id === step.id ? null : step)}
                title={`Step ${step.order}: ${step.targetName} (${step.timeout}m)`}
              >
                <div style={{
                  fontSize: theme.typography.fontSize.xs,
                  fontWeight: theme.typography.fontWeight.bold,
                  marginBottom: theme.spacing[0.5],
                }}>
                  Step {step.order}
                </div>
                <div style={{
                  fontSize: theme.typography.fontSize.xs,
                  textAlign: 'center',
                  lineHeight: theme.typography.lineHeight.tight,
                }}>
                  {step.targetName.length > 12 ? 
                    step.targetName.substring(0, 12) + '...' : 
                    step.targetName
                  }
                </div>
                <div style={{
                  fontSize: theme.typography.fontSize.xs,
                  opacity: 0.9,
                }}>
                  {step.timeout}m
                </div>
                {!step.isLast && (
                  <div style={{
                    position: 'absolute',
                    right: '-8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: theme.typography.fontSize.lg,
                    color: theme.colors.text,
                  }}>
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Details */}
        {renderStepDetails()}

        {/* Timezone Comparison */}
        {renderTimezoneComparison()}

        {/* Escalation Summary */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: theme.spacing[3],
          marginTop: theme.spacing[4],
          padding: theme.spacing[3],
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.md,
          border: `1px solid ${theme.colors.border}`,
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: theme.typography.fontSize.lg,
              fontWeight: theme.typography.fontWeight.bold,
              color: theme.colors.text,
            }}>
              {escalationTimeline.length}
            </div>
            <div style={{
              fontSize: theme.typography.fontSize.xs,
              color: theme.colors.textMuted,
            }}>
              Total Steps
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: theme.typography.fontSize.lg,
              fontWeight: theme.typography.fontWeight.bold,
              color: theme.colors.text,
            }}>
              {team.escalationPolicy.timeout}m
            </div>
            <div style={{
              fontSize: theme.typography.fontSize.xs,
              color: theme.colors.textMuted,
            }}>
              Max Duration
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: theme.typography.fontSize.lg,
              fontWeight: theme.typography.fontWeight.bold,
              color: theme.colors.text,
            }}>
              {Math.round(team.escalationPolicy.timeout / escalationTimeline.length)}m
            </div>
            <div style={{
              fontSize: theme.typography.fontSize.xs,
              color: theme.colors.textMuted,
            }}>
              Avg Step Time
            </div>
          </div>
        </div>

        {/* Current Time Indicator */}
        <div style={{
          marginTop: theme.spacing[4],
          padding: theme.spacing[3],
          backgroundColor: '#f0f9ff',
          borderRadius: theme.borderRadius.md,
          border: `1px solid ${theme.colors.border}`,
        }}>
          <div style={{
            fontSize: theme.typography.fontSize.sm,
            fontWeight: theme.typography.fontWeight.medium,
            color: theme.colors.text,
            marginBottom: theme.spacing[1],
          }}>
            If escalation started now:
          </div>
          <div style={{
            display: 'flex',
            gap: theme.spacing[4],
            flexWrap: 'wrap',
          }}>
            <div>
              <span style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.textMuted }}>
                Your timezone ({userTimezone}):
              </span>
              <span style={{ 
                marginLeft: theme.spacing[1],
                fontWeight: theme.typography.fontWeight.medium,
                color: theme.colors.text,
              }}>
                {format(new Date(), 'HH:mm')}
              </span>
            </div>
            <div>
              <span style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.textMuted }}>
                Team timezone ({team.onCallSchedule.timezone}):
              </span>
              <span style={{ 
                marginLeft: theme.spacing[1],
                fontWeight: theme.typography.fontWeight.medium,
                color: theme.colors.text,
              }}>
                {formatTz(toZonedTime(new Date(), team.onCallSchedule.timezone), 'HH:mm', { 
                  timeZone: team.onCallSchedule.timezone 
                })}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};