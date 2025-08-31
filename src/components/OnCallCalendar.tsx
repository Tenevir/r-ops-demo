import React, { useState, useMemo } from 'react';
import { 
  format, 
  startOfWeek, 
  addDays, 
  isSameDay, 
  isWithinInterval,
  addWeeks,
  subWeeks,
  startOfDay,
  endOfDay
} from 'date-fns';
import { toZonedTime, format as formatTz } from 'date-fns-tz';
import type { Team, User } from '../types';
import { useTheme } from '../theme/utils';
import { Button, Card, CardHeader, CardTitle, CardContent } from './';

interface OnCallCalendarProps {
  team: Team;
  onHandoffNotification?: (fromUser: User, toUser: User, handoffTime: Date) => void;
}

interface CalendarEvent {
  id: string;
  userId: string;
  userName: string;
  startTime: Date;
  endTime: Date;
  isActive: boolean;
  isCurrent: boolean;
  isUpcoming: boolean;
}

export const OnCallCalendar: React.FC<OnCallCalendarProps> = ({ 
  team,
  onHandoffNotification
}) => {
  const theme = useTheme();
  const getTeamMembers = () => team.members;
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);

  const teamMembers = getTeamMembers();
  
  // Convert rotation periods to calendar events
  const calendarEvents = useMemo((): CalendarEvent[] => {
    const now = new Date();
    
    return team.onCallSchedule.rotation.map(rotation => {
      const startTime = toZonedTime(new Date(rotation.startTime), team.onCallSchedule.timezone);
      const endTime = toZonedTime(new Date(rotation.endTime), team.onCallSchedule.timezone);
      
      const isCurrent = isWithinInterval(now, { start: startTime, end: endTime }) && rotation.isActive;
      const isUpcoming = startTime > now && rotation.isActive;

      return {
        id: rotation.id,
        userId: rotation.userId,
        userName: `User ${rotation.userId}`,
        startTime,
        endTime,
        isActive: rotation.isActive,
        isCurrent,
        isUpcoming,
      };
    });
  }, [team.onCallSchedule.rotation, teamMembers, team.onCallSchedule.timezone]);

  // Generate calendar grid
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Monday start
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Find events for each day
  const getEventsForDay = (date: Date): CalendarEvent[] => {
    return calendarEvents.filter(event => {
      const eventStart = startOfDay(event.startTime);
      const eventEnd = endOfDay(event.endTime);
      return isWithinInterval(date, { start: eventStart, end: eventEnd }) ||
             isWithinInterval(eventStart, { start: startOfDay(date), end: endOfDay(date) }) ||
             isWithinInterval(eventEnd, { start: startOfDay(date), end: endOfDay(date) });
    });
  };

  // Detect handoffs (when one rotation ends and another begins)
  const handoffs = useMemo(() => {
    const sortedEvents = [...calendarEvents]
      .filter(event => event.isActive)
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

    const handoffPoints: Array<{
      id: string;
      fromUser: string;
      toUser: string;
      time: Date;
      isUpcoming: boolean;
    }> = [];

    for (let i = 0; i < sortedEvents.length - 1; i++) {
      const current = sortedEvents[i];
      const next = sortedEvents[i + 1];
      
      // Check if next rotation starts when current ends (handoff)
      const timeDiff = Math.abs(next.startTime.getTime() - current.endTime.getTime());
      if (timeDiff <= 60 * 60 * 1000) { // Within 1 hour
        handoffPoints.push({
          id: `handoff-${current.id}-${next.id}`,
          fromUser: current.userName,
          toUser: next.userName,
          time: next.startTime,
          isUpcoming: next.startTime > new Date(),
        });
      }
    }

    return handoffPoints;
  }, [calendarEvents]);

  const getInitials = (name: string): string => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getUserColor = (userId: string): string => {
    const colors = ['#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981', '#6366f1'];
    const index = userId.charCodeAt(userId.length - 1) % colors.length;
    return colors[index];
  };

  const dayStyle = (date: Date): React.CSSProperties => {
    const isToday = isSameDay(date, new Date());
    const events = getEventsForDay(date);
    const hasCurrentEvent = events.some(e => e.isCurrent);

    return {
      padding: theme.spacing[2],
      borderRadius: theme.borderRadius.sm,
      border: `1px solid ${theme.colors.border}`,
      backgroundColor: isToday ? 
        (hasCurrentEvent ? '#dcfce7' : '#f0f9ff') : 
        theme.colors.surface,
      minHeight: '120px',
      cursor: 'pointer',
      transition: `all ${theme.animation.duration.fast}`,
    };
  };

  const eventStyle = (event: CalendarEvent): React.CSSProperties => ({
    padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
    backgroundColor: event.isCurrent ? '#16a34a' : getUserColor(event.userId),
    color: '#ffffff',
    borderRadius: theme.borderRadius.sm,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium,
    marginBottom: theme.spacing[1],
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing[1],
    opacity: event.isActive ? 1 : 0.6,
  });

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing[4],
  };

  const navigationStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing[2],
  };

  const calendarGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: theme.spacing[2],
    marginBottom: theme.spacing[4],
  };

  const handoffAlertStyle: React.CSSProperties = {
    padding: theme.spacing[3],
    backgroundColor: '#fef3c7',
    borderRadius: theme.borderRadius.md,
    border: '1px solid #f59e0b',
    marginBottom: theme.spacing[4],
  };

  return (
    <Card variant="elevated">
      <CardHeader>
        <div style={headerStyle}>
          <div>
            <CardTitle>On-Call Calendar - {team.name}</CardTitle>
            <div style={{
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.textMuted,
              marginTop: theme.spacing[1],
            }}>
              Timezone: {team.onCallSchedule.timezone}
            </div>
          </div>
          <div style={navigationStyle}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
              aria-label="Previous week"
            >
              ←
            </Button>
            <span style={{
              fontSize: theme.typography.fontSize.sm,
              fontWeight: theme.typography.fontWeight.medium,
              minWidth: '120px',
              textAlign: 'center',
            }}>
              {format(weekStart, 'MMM dd')} - {format(addDays(weekStart, 6), 'MMM dd, yyyy')}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
              aria-label="Next week"
            >
              →
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCurrentWeek(new Date())}
            >
              Today
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Upcoming Handoffs Alert */}
        {handoffs.filter(h => h.isUpcoming).length > 0 && (
          <div style={handoffAlertStyle}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: theme.spacing[2],
              marginBottom: theme.spacing[2],
            }}>
              <span style={{ fontSize: theme.typography.fontSize.lg }}>⏰</span>
              <span style={{
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.semibold,
                color: theme.colors.text,
              }}>
                Upcoming Handoffs
              </span>
            </div>
            {handoffs.filter(h => h.isUpcoming).slice(0, 3).map((handoff) => (
              <div key={handoff.id} style={{
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.text,
                marginBottom: theme.spacing[1],
              }}>
                {handoff.fromUser} → {handoff.toUser} at{' '}
                {formatTz(toZonedTime(handoff.time, team.onCallSchedule.timezone), 
                  'MMM dd, HH:mm zzz', 
                  { timeZone: team.onCallSchedule.timezone }
                )}
              </div>
            ))}
          </div>
        )}

        {/* Calendar Grid Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: theme.spacing[2],
          marginBottom: theme.spacing[2],
        }}>
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <div key={day} style={{
              padding: theme.spacing[2],
              fontSize: theme.typography.fontSize.sm,
              fontWeight: theme.typography.fontWeight.semibold,
              textAlign: 'center',
              color: theme.colors.text,
              backgroundColor: theme.colors.surface,
              borderRadius: theme.borderRadius.sm,
            }}>
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div style={calendarGridStyle}>
          {weekDays.map((date) => {
            const dayEvents = getEventsForDay(date);
            const isToday = isSameDay(date, new Date());

            return (
              <div
                key={date.toISOString()}
                style={dayStyle(date)}
                onClick={() => setSelectedDate(selectedDate && isSameDay(selectedDate, date) ? null : date)}
              >
                <div style={{
                  fontSize: theme.typography.fontSize.sm,
                  fontWeight: isToday ? theme.typography.fontWeight.bold : theme.typography.fontWeight.medium,
                  color: isToday ? theme.colors.primary : theme.colors.text,
                  marginBottom: theme.spacing[1],
                }}>
                  {format(date, 'd')}
                </div>
                
                {dayEvents.map((event) => (
                  <div key={event.id} style={eventStyle(event)}>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255, 255, 255, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '8px',
                      fontWeight: theme.typography.fontWeight.bold,
                    }}>
                      {getInitials(event.userName)[0]}
                    </div>
                    <span style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {event.userName.split(' ')[0]}
                      {event.isCurrent && ' (NOW)'}
                    </span>
                  </div>
                ))}
                
                {dayEvents.length === 0 && (
                  <div style={{
                    fontSize: theme.typography.fontSize.xs,
                    color: theme.colors.textMuted,
                    fontStyle: 'italic',
                  }}>
                    No coverage
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Selected Date Details */}
        {selectedDate && (
          <Card style={{ marginTop: theme.spacing[4] }}>
            <CardHeader>
              <CardTitle>
                {format(selectedDate, 'EEEE, MMMM do, yyyy')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {getEventsForDay(selectedDate).map((event) => (
                <div key={event.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: theme.spacing[3],
                  backgroundColor: theme.colors.surface,
                  borderRadius: theme.borderRadius.sm,
                  border: `1px solid ${theme.colors.border}`,
                  marginBottom: theme.spacing[2],
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: theme.spacing[3],
                  }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: getUserColor(event.userId),
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: theme.typography.fontSize.sm,
                      fontWeight: theme.typography.fontWeight.bold,
                    }}>
                      {getInitials(event.userName)}
                    </div>
                    <div>
                      <div style={{
                        fontWeight: theme.typography.fontWeight.medium,
                        color: theme.colors.text,
                        marginBottom: theme.spacing[0.5],
                      }}>
                        {event.userName}
                        {event.isCurrent && (
                          <span style={{
                            marginLeft: theme.spacing[2],
                            color: '#16a34a',
                            fontSize: theme.typography.fontSize.xs,
                            fontWeight: theme.typography.fontWeight.bold,
                          }}>
                            (ACTIVE)
                          </span>
                        )}
                      </div>
                      <div style={{
                        fontSize: theme.typography.fontSize.sm,
                        color: theme.colors.textMuted,
                      }}>
                        {formatTz(event.startTime, 'HH:mm', { timeZone: team.onCallSchedule.timezone })} -{' '}
                        {formatTz(event.endTime, 'HH:mm zzz', { timeZone: team.onCallSchedule.timezone })}
                      </div>
                    </div>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    gap: theme.spacing[2],
                  }}>
                    <div style={{
                      padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
                      borderRadius: theme.borderRadius.sm,
                      fontSize: theme.typography.fontSize.xs,
                      fontWeight: theme.typography.fontWeight.medium,
                      backgroundColor: event.isActive ? '#dcfce7' : '#fef3c7',
                      color: event.isActive ? '#16a34a' : '#f59e0b',
                    }}>
                      {event.isActive ? 'Active' : 'Inactive'}
                    </div>
                    {event.isUpcoming && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          const fromUser = teamMembers.find((u: any) => u.userId === calendarEvents.find((e: any) => e.isCurrent)?.userId);
                          const toUser = teamMembers.find((u: any) => u.userId === event.userId);
                          if (fromUser && toUser && onHandoffNotification) {
                            onHandoffNotification(fromUser as any, toUser as any, event.startTime);
                          }
                        }}
                      >
                        📢 Notify Handoff
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              
              {getEventsForDay(selectedDate).length === 0 && (
                <div style={{
                  textAlign: 'center',
                  padding: theme.spacing[4],
                  color: theme.colors.textMuted,
                  fontSize: theme.typography.fontSize.sm,
                  fontStyle: 'italic',
                }}>
                  No on-call coverage scheduled for this date
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Notification Settings Panel */}
        {showNotificationSettings && (
          <Card style={{ marginTop: theme.spacing[4] }}>
            <CardHeader>
              <CardTitle>Handoff Notification Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: theme.spacing[4],
              }}>
                <div>
                  <div style={{
                    fontSize: theme.typography.fontSize.sm,
                    fontWeight: theme.typography.fontWeight.medium,
                    color: theme.colors.text,
                    marginBottom: theme.spacing[2],
                  }}>
                    Notification Timing
                  </div>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: theme.spacing[2],
                  }}>
                    {['15 minutes before', '1 hour before', '24 hours before'].map((timing) => (
                      <label key={timing} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: theme.spacing[2],
                        fontSize: theme.typography.fontSize.sm,
                        color: theme.colors.text,
                      }}>
                        <input 
                          type="checkbox" 
                          defaultChecked={timing === '1 hour before'}
                          style={{ accentColor: theme.colors.primary }}
                        />
                        {timing}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <div style={{
                    fontSize: theme.typography.fontSize.sm,
                    fontWeight: theme.typography.fontWeight.medium,
                    color: theme.colors.text,
                    marginBottom: theme.spacing[2],
                  }}>
                    Notification Channels
                  </div>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: theme.spacing[2],
                  }}>
                    {team.contactMethods.filter(m => m.isActive).map((method) => (
                      <label key={method.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: theme.spacing[2],
                        fontSize: theme.typography.fontSize.sm,
                        color: theme.colors.text,
                      }}>
                        <input 
                          type="checkbox" 
                          defaultChecked={method.type === 'slack'}
                          style={{ accentColor: theme.colors.primary }}
                        />
                        {method.value} ({method.type})
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary Panel */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
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
              {calendarEvents.filter(e => e.isActive).length}
            </div>
            <div style={{
              fontSize: theme.typography.fontSize.xs,
              color: theme.colors.textMuted,
            }}>
              Active Rotations
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: theme.typography.fontSize.lg,
              fontWeight: theme.typography.fontWeight.bold,
              color: theme.colors.text,
            }}>
              {handoffs.filter(h => h.isUpcoming).length}
            </div>
            <div style={{
              fontSize: theme.typography.fontSize.xs,
              color: theme.colors.textMuted,
            }}>
              Upcoming Handoffs
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: theme.typography.fontSize.lg,
              fontWeight: theme.typography.fontWeight.bold,
              color: theme.colors.text,
            }}>
              {new Set(calendarEvents.map(e => e.userId)).size}
            </div>
            <div style={{
              fontSize: theme.typography.fontSize.xs,
              color: theme.colors.textMuted,
            }}>
              People Involved
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: theme.spacing[3],
          marginTop: theme.spacing[6],
          justifyContent: 'center',
        }}>
          <Button
            variant={showNotificationSettings ? "primary" : "secondary"}
            onClick={() => setShowNotificationSettings(!showNotificationSettings)}
          >
            ⚙️ Notification Settings
          </Button>
          <Button variant="secondary">
            📅 Add Rotation
          </Button>
          <Button variant="secondary">
            ⚡ Manual Handoff
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};