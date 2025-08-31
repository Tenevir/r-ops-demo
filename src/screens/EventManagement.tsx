import React, { useMemo, useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  EventCard,
  EventFilter,
  EventDetailsPanel,
  EventBulkActions,
  EventTimeline,
  ScreenReaderAnnouncement,
} from '../components';
import { useTheme } from '../theme/utils';
import { useEvents } from '../hooks/useEvents';
import type { Event as EventModel } from '../types';

export const EventManagement = () => {
  const theme = useTheme();
  const { 
    events, 
    isLoading, 
    selectedEvents, 
    selectedEvent,
    filters, 
    toggleSelectEvent,
    setSelectedEventForDetails,
    createEvent 
  } = useEvents();
  
  const [showBulkSelect, setShowBulkSelect] = useState(false);
  const [showDetailsPanel, setShowDetailsPanel] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const [showTimeline, setShowTimeline] = useState(true);

  // Apply filters to events
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const now = new Date();
      const eventDate = new Date(event.createdAt);
      
      // Time range filter
      const timeThresholds = {
        '1h': new Date(now.getTime() - 60 * 60 * 1000),
        '24h': new Date(now.getTime() - 24 * 60 * 60 * 1000),
        '7d': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        '30d': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        'all': new Date(0),
      };
      
      if (eventDate < timeThresholds[filters.timeRange]) {
        return false;
      }
      
      // Type filter
      if (filters.type.length > 0 && !filters.type.includes(event.type)) {
        return false;
      }
      
      // Severity filter
      if (filters.severity.length > 0 && !filters.severity.includes(event.severity)) {
        return false;
      }
      
      // Source filter
      if (filters.source.length > 0 && !filters.source.includes(event.source)) {
        return false;
      }
      
      // Search query filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        return (
          event.summary?.toLowerCase().includes(query) ||
          event.description.toLowerCase().includes(query) ||
          event.source.toLowerCase().includes(query) ||
          event.tags.some(tag => tag.toLowerCase().includes(query))
        );
      }
      
      return true;
    });
  }, [events, filters]);

  // Calculate statistics
  const stats = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Calculate top sources
    const sourceStats: Record<string, number> = {};
    events.forEach(event => {
      sourceStats[event.source] = (sourceStats[event.source] || 0) + 1;
    });
    
    const topSources = Object.entries(sourceStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([source, count]) => ({
        source,
        count,
        percentage: Math.round((count / events.length) * 100)
      }));

    return {
      total: events.length,
      todayCount: events.filter(e => new Date(e.createdAt) >= todayStart).length,
      processedPercentage: 98.7, // Mock processed percentage
      topSources,
      byType: {
        system: events.filter(e => e.type === 'system').length,
        application: events.filter(e => e.type === 'application').length,
        security: events.filter(e => e.type === 'security').length,
        performance: events.filter(e => e.type === 'performance').length,
      },
      bySeverity: {
        critical: events.filter(e => e.severity === 'critical').length,
        warning: events.filter(e => e.severity === 'warning').length,
        info: events.filter(e => e.severity === 'info').length,
        low: events.filter(e => e.severity === 'low').length,
      }
    };
  }, [events]);

  const handleCreateEvent = async () => {
    try {
      await createEvent({
        timestamp: new Date().toISOString(),
        title: 'Manual Test Event',
        summary: 'Manual Test Event',
        description: 'This is a manually created test event.',
        type: 'application',
        severity: 'info',
        source: 'manual-creation',
        tags: ['manual', 'test'],
        ruleId: 'manual-rule',
        updatedAt: new Date().toISOString(),
        promoted: false,
        payload: {
          action: 'manual_creation',
          user: 'current-user',
          timestamp: new Date().toISOString()
        },
        metadata: {
          createdBy: 'current-user',
          category: 'testing'
        }
      });
      setAnnouncement('New event created successfully');
    } catch (error) {
      console.error('Error creating event:', error);
      setAnnouncement('Failed to create event. Please try again.');
    }
  };

  const handleShowDetails = (event: EventModel) => {
    setSelectedEventForDetails(event);
    setShowDetailsPanel(true);
  };

  const handleCloseDetails = () => {
    setShowDetailsPanel(false);
    setSelectedEventForDetails(null);
  };

  const exportEvents = () => {
    const dataStr = JSON.stringify(filteredEvents, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `events-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setAnnouncement(`Exported ${filteredEvents.length} events`);
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

  const actionsStyle: React.CSSProperties = {
    display: 'flex',
    gap: theme.spacing[3],
    alignItems: 'center',
    flexWrap: 'wrap',
  };

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: theme.spacing[4],
    marginBottom: theme.spacing[8],
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
          <h1 style={titleStyle}>Event Management</h1>
        </header>
        <div style={loadingStyle}>
          <div>Loading events...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <ScreenReaderAnnouncement message={announcement} priority="assertive" />
      
      <header style={pageHeaderStyle}>
        <h1 style={titleStyle}>Event Management</h1>
        <div style={actionsStyle}>
          <Button
            variant={showTimeline ? "primary" : "ghost"}
            size="sm"
            onClick={() => setShowTimeline(!showTimeline)}
            aria-label="Toggle timeline visualization"
          >
            {showTimeline ? 'Hide Timeline' : 'Show Timeline'}
          </Button>
          <Button
            variant={showBulkSelect ? "primary" : "ghost"}
            size="sm"
            onClick={() => {
              setShowBulkSelect(!showBulkSelect);
              setAnnouncement(showBulkSelect ? 'Bulk selection disabled' : 'Bulk selection enabled');
            }}
            aria-label="Toggle bulk selection mode"
          >
            {showBulkSelect ? 'Exit Bulk Mode' : 'Bulk Select'}
          </Button>
          <Button 
            variant="secondary" 
            onClick={handleCreateEvent}
            aria-label="Create new test event"
          >
            Create Event
          </Button>
          <Button 
            variant="primary" 
            onClick={exportEvents}
            aria-label={`Export ${filteredEvents.length} filtered events`}
          >
            Export Events
          </Button>
        </div>
      </header>

      <EventFilter />
      
      {showBulkSelect && <EventBulkActions />}

      {showTimeline && <EventTimeline />}

      {filteredEvents.length === 0 ? (
        <div style={emptyStateStyle}>
          <div style={{
            fontSize: theme.typography.fontSize.xl,
            marginBottom: theme.spacing[2],
          }}>
            {events.length === 0 ? '📊' : '🔍'}
          </div>
          <div style={{
            fontSize: theme.typography.fontSize.lg,
            fontWeight: theme.typography.fontWeight.medium,
            marginBottom: theme.spacing[2],
          }}>
            {events.length === 0 ? 'No Events' : 'No Matching Events'}
          </div>
          <div>
            {events.length === 0 
              ? 'No events have been recorded yet!'
              : 'Try adjusting your filters to see more events.'
            }
          </div>
        </div>
      ) : (
        <div style={gridStyle}>
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              isSelected={selectedEvents.has(event.id)}
              onSelect={showBulkSelect ? toggleSelectEvent : undefined}
              onShowDetails={handleShowDetails}
              showBulkSelect={showBulkSelect}
            />
          ))}
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: theme.spacing[6],
          marginTop: theme.spacing[8],
        }}
      >
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Event Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: theme.spacing[4],
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: theme.typography.fontSize.lg,
                    fontWeight: theme.typography.fontWeight.bold,
                    color: theme.colors.text,
                  }}
                >
                  {stats.todayCount.toLocaleString()}
                </div>
                <div
                  style={{
                    fontSize: theme.typography.fontSize.sm,
                    color: theme.colors.textMuted,
                  }}
                >
                  Today
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: theme.typography.fontSize.lg,
                    fontWeight: theme.typography.fontWeight.bold,
                    color: theme.colors.text,
                  }}
                >
                  {stats.processedPercentage}%
                </div>
                <div
                  style={{
                    fontSize: theme.typography.fontSize.sm,
                    color: theme.colors.textMuted,
                  }}
                >
                  Processed
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Top Event Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: theme.spacing[3],
              }}
            >
              {stats.topSources.map(({ source, count, percentage }) => (
                <div
                  key={source}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span
                    style={{
                      fontSize: theme.typography.fontSize.sm,
                      color: theme.colors.textSecondary,
                    }}
                  >
                    {source}
                  </span>
                  <span
                    style={{
                      fontWeight: theme.typography.fontWeight.medium,
                      color: theme.colors.text,
                    }}
                  >
                    {percentage}% ({count})
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Event Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: theme.spacing[4],
            }}>
              <div>
                <div style={{
                  fontSize: theme.typography.fontSize.sm,
                  fontWeight: theme.typography.fontWeight.medium,
                  color: theme.colors.text,
                  marginBottom: theme.spacing[2],
                }}>
                  By Type
                </div>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: theme.spacing[1],
                  fontSize: theme.typography.fontSize.xs,
                  color: theme.colors.textSecondary,
                }}>
                  <div>System: {stats.byType.system}</div>
                  <div>Application: {stats.byType.application}</div>
                  <div>Security: {stats.byType.security}</div>
                  <div>Performance: {stats.byType.performance}</div>
                </div>
              </div>
              <div>
                <div style={{
                  fontSize: theme.typography.fontSize.sm,
                  fontWeight: theme.typography.fontWeight.medium,
                  color: theme.colors.text,
                  marginBottom: theme.spacing[2],
                }}>
                  By Severity
                </div>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: theme.spacing[1],
                  fontSize: theme.typography.fontSize.xs,
                  color: theme.colors.textSecondary,
                }}>
                  <div>Critical: {stats.bySeverity.critical}</div>
                  <div>Warning: {stats.bySeverity.warning}</div>
                  <div>Info: {stats.bySeverity.info}</div>
                  <div>Low: {stats.bySeverity.low}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <EventDetailsPanel 
        event={selectedEvent}
        isOpen={showDetailsPanel}
        onClose={handleCloseDetails}
      />
    </div>
  );
};
