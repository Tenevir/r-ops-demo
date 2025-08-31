import React, { useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  Cell
} from 'recharts';
import type { Event } from '../types';
import { useTheme } from '../theme/utils';
import { useEvents } from '../hooks/useEvents';
import { Card, CardHeader, CardTitle, CardContent } from './';

interface EventTimelineProps {
  height?: number;
  showCorrelation?: boolean;
}

export const EventTimeline: React.FC<EventTimelineProps> = ({ 
  height = 300,
  showCorrelation = true 
}) => {
  const theme = useTheme();
  const { events } = useEvents();

  const getTypeColor = (type: Event['type']): string => {
    switch (type) {
      case 'system': return '#6366f1';
      case 'application': return theme.colors.primary;
      case 'security': return '#ef4444';
      case 'performance': return '#f59e0b';
      default: return theme.colors.textMuted;
    }
  };

  const getSeverityValue = (severity: Event['severity']): number => {
    switch (severity) {
      case 'critical': return 3;
      case 'warning': return 2;
      case 'info': return 1.5;
      case 'low': return 1;
      default: return 0;
    }
  };

  // Process events for timeline visualization
  const timelineData = useMemo(() => {
    if (!events.length) return [];

    // Group events by hour for trend visualization
    const eventsByHour: Record<string, { timestamp: string, count: number, types: Record<string, number> }> = {};
    
    events.forEach(event => {
      const eventDate = new Date(event.createdAt);
      const hourKey = new Date(
        eventDate.getFullYear(),
        eventDate.getMonth(),
        eventDate.getDate(),
        eventDate.getHours()
      ).toISOString();

      if (!eventsByHour[hourKey]) {
        eventsByHour[hourKey] = {
          timestamp: hourKey,
          count: 0,
          types: { system: 0, application: 0, security: 0, performance: 0 }
        };
      }

      eventsByHour[hourKey].count++;
      eventsByHour[hourKey].types[event.type] = (eventsByHour[hourKey].types[event.type] || 0) + 1;
    });

    return Object.values(eventsByHour)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .map(hour => ({
        time: new Date(hour.timestamp).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        timestamp: hour.timestamp,
        total: hour.count,
        system: hour.types.system,
        application: hour.types.application,
        security: hour.types.security,
        performance: hour.types.performance,
      }));
  }, [events]);

  // Process events for correlation scatter plot
  const correlationData = useMemo(() => {
    if (!events.length) return [];

    return events.slice(0, 200).map((event, _index) => ({ // Limit to 200 for performance
      x: new Date(event.createdAt).getTime(),
      y: getSeverityValue(event.severity),
      type: event.type,
      severity: event.severity,
      id: event.id,
      summary: event.summary || event.type,
      size: event.promoted ? 8 : 5,
    }));
  }, [events]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    
    return (
      <div style={{
        backgroundColor: theme.colors.surfaceElevated,
        padding: theme.spacing[3],
        borderRadius: theme.borderRadius.md,
        border: `1px solid ${theme.colors.border}`,
        fontSize: theme.typography.fontSize.sm,
        boxShadow: theme.elevation.md,
      }}>
        <div style={{ fontWeight: theme.typography.fontWeight.semibold, marginBottom: theme.spacing[1] }}>
          {data.time || new Date(data.x).toLocaleTimeString()}
        </div>
        {data.total !== undefined ? (
          <div>
            <div>Total Events: {data.total}</div>
            <div style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.textMuted }}>
              System: {data.system} | App: {data.application} | Security: {data.security} | Perf: {data.performance}
            </div>
          </div>
        ) : (
          <div>
            <div>{data.summary}</div>
            <div style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.textMuted }}>
              {data.type} • {data.severity} severity
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Timeline Visualization */}
      {showCorrelation && timelineData.length > 0 && (
        <Card style={{ marginBottom: theme.spacing[6] }}>
          <CardHeader>
            <CardTitle>Event Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={height}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.border} />
                <XAxis 
                  dataKey="time" 
                  stroke={theme.colors.textMuted}
                  fontSize={12}
                />
                <YAxis 
                  stroke={theme.colors.textMuted}
                  fontSize={12}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke={theme.colors.primary} 
                  strokeWidth={2}
                  dot={{ fill: theme.colors.primary, strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, stroke: theme.colors.primary, strokeWidth: 2 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="security" 
                  stroke="#ef4444" 
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="performance" 
                  stroke="#f59e0b" 
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Event Correlation Scatter Plot */}
      {showCorrelation && correlationData.length > 0 && (
        <Card style={{ marginBottom: theme.spacing[6] }}>
          <CardHeader>
            <CardTitle>Event Correlation by Severity Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={height}>
              <ScatterChart data={correlationData}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.border} />
                <XAxis 
                  dataKey="x"
                  type="number"
                  scale="time"
                  domain={['dataMin', 'dataMax']}
                  tickFormatter={(value) => new Date(value).toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                  stroke={theme.colors.textMuted}
                  fontSize={12}
                />
                <YAxis 
                  dataKey="y"
                  type="number"
                  domain={[0, 4]}
                  tickFormatter={(value) => {
                    switch(value) {
                      case 3: return 'High';
                      case 2: return 'Medium';
                      case 1: return 'Low';
                      default: return '';
                    }
                  }}
                  stroke={theme.colors.textMuted}
                  fontSize={12}
                />
                <Tooltip content={<CustomTooltip />} />
                <Scatter dataKey="y">
                  {correlationData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={getTypeColor(entry.type)}
                      opacity={entry.size > 5 ? 1 : 0.7}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </>
  );
};