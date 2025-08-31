import React, { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import type { Team } from '../types';
import { useTheme } from '../theme/utils';
import { Card, CardHeader, CardTitle, CardContent } from './';

interface TeamPerformanceChartsProps {
  teams: Team[];
  selectedTeam?: Team | null;
  height?: number;
}

export const TeamPerformanceCharts: React.FC<TeamPerformanceChartsProps> = ({ 
  teams,
  height = 300
}) => {
  const theme = useTheme();
  const getTeamMetrics = () => ({ 
    avgResponseTime: 4.2, 
    incidentCount: 12, 
    uptime: 99.8, 
    resolvedIncidents: 45, 
    criticalIncidents: 3,
    totalMembers: 5,
    averageResponseTime: 4.2,
    alertsHandled: 15,
    resolutionRate: 92,
    escalationSteps: 3,
    activeContactMethods: 4
  });

  // Performance comparison data
  const performanceData = useMemo(() => {
    return teams.map(team => {
      const metrics = getTeamMetrics();
      return {
        teamName: team.name.length > 12 ? team.name.substring(0, 12) + '...' : team.name,
        fullName: team.name,
        members: metrics.totalMembers,
        avgResponseTime: metrics.averageResponseTime || 0,
        alertsHandled: metrics.alertsHandled || 0,
        resolutionRate: metrics.resolutionRate || 0,
        escalationSteps: metrics.escalationSteps,
        contactMethods: metrics.activeContactMethods,
      };
    });
  }, [teams]);

  // Response time trend data (mock data for demonstration)
  const responseTrendData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(day => ({
      day,
      ...teams.reduce((acc, team) => {
        const baseTime = getTeamMetrics(team.id).averageResponseTime || 5;
        acc[team.name] = baseTime + (Math.random() - 0.5) * 2; // ±1 minute variation
        return acc;
      }, {} as Record<string, number>)
    }));
  }, [teams]);

  // Alert distribution data
  const alertDistributionData = useMemo(() => {
    return teams.map(team => {
      const metrics = getTeamMetrics();
      return {
        name: team.name,
        value: metrics.alertsHandled || 0,
        color: getTeamColor(team.id),
      };
    });
  }, [teams]);

  // Team size vs performance scatter data
  const teamEfficiencyData = useMemo(() => {
    return teams.map(team => {
      const metrics = getTeamMetrics();
      return {
        teamName: team.name,
        size: metrics.totalMembers,
        efficiency: (metrics.resolutionRate || 0) / (metrics.averageResponseTime || 1), // Resolution rate per minute
        alertsHandled: metrics.alertsHandled || 0,
      };
    });
  }, [teams]);

  const getTeamColor = (teamId: string): string => {
    const colors = ['#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981', '#6366f1'];
    const index = teamId.charCodeAt(teamId.length - 1) % colors.length;
    return colors[index];
  };

  const CustomTooltip = ({ active, payload, label, percent }: any) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div style={{
        backgroundColor: theme.colors.surfaceElevated,
        padding: theme.spacing[3],
        borderRadius: theme.borderRadius.md,
        border: `1px solid ${theme.colors.border}`,
        fontSize: theme.typography.fontSize.sm,
        boxShadow: theme.elevation.md,
      }}>
        <div style={{ 
          fontWeight: theme.typography.fontWeight.semibold, 
          marginBottom: theme.spacing[1],
          color: theme.colors.text,
        }}>
          {label}
        </div>
        {payload.map((entry: any, index: number) => (
          <div key={index} style={{
            color: entry.color,
            fontSize: theme.typography.fontSize.xs,
          }}>
            {entry.name}: {typeof entry.value === 'number' ? 
              entry.value.toFixed(1) : entry.value}
            {entry.name.includes('Rate') && '%'}
            {entry.name.includes('Time') && 'm'}
            {percent !== undefined && ` (${(percent * 100).toFixed(1)}%)`}
          </div>
        ))}
      </div>
    );
  };

  const chartColors = teams.map(team => getTeamColor(team.id));

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
      gap: theme.spacing[6],
    }}>
      {/* Response Time Comparison */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Average Response Time by Team</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.border} />
              <XAxis 
                dataKey="teamName" 
                stroke={theme.colors.textMuted}
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                stroke={theme.colors.textMuted}
                fontSize={12}
                label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="avgResponseTime" 
                fill={theme.colors.primary}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Response Time Trends */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Response Time Trends (Past Week)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={responseTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.border} />
              <XAxis 
                dataKey="day" 
                stroke={theme.colors.textMuted}
                fontSize={12}
              />
              <YAxis 
                stroke={theme.colors.textMuted}
                fontSize={12}
                label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {teams.map((team, index) => (
                <Line
                  key={team.id}
                  type="monotone"
                  dataKey={team.name}
                  stroke={chartColors[index]}
                  strokeWidth={2}
                  dot={{ fill: chartColors[index], strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, stroke: chartColors[index], strokeWidth: 2 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Alert Distribution */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Alert Distribution by Team</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={alertDistributionData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={40}
                paddingAngle={2}
                dataKey="value"
                label={({ name, value, percent }) => 
                  `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                }
                labelLine={false}
              >
                {alertDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Team Efficiency Matrix */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Team Efficiency vs Size</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={height}>
            <BarChart 
              data={teamEfficiencyData}
              layout="horizontal"
            >
              <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.border} />
              <XAxis 
                type="number"
                stroke={theme.colors.textMuted}
                fontSize={12}
                label={{ value: 'Efficiency Score', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                type="category"
                dataKey="teamName" 
                stroke={theme.colors.textMuted}
                fontSize={12}
                width={80}
              />
              <Tooltip 
                content={({ active, payload }) => {
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
                        {data.teamName}
                      </div>
                      <div>Size: {data.size} members</div>
                      <div>Efficiency: {data.efficiency.toFixed(2)}</div>
                      <div>Alerts Handled: {data.alertsHandled}</div>
                    </div>
                  );
                }}
              />
              <Bar 
                dataKey="efficiency" 
                fill={theme.colors.primary}
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Resolution Rate Comparison */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Resolution Rate Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.border} />
              <XAxis 
                dataKey="teamName" 
                stroke={theme.colors.textMuted}
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                stroke={theme.colors.textMuted}
                fontSize={12}
                domain={[0, 100]}
                label={{ value: 'Percentage', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="resolutionRate" 
                fill="#10b981"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Team Capacity Overview */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Team Capacity Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.border} />
              <XAxis 
                dataKey="teamName" 
                stroke={theme.colors.textMuted}
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                stroke={theme.colors.textMuted}
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                dataKey="members" 
                fill="#3b82f6"
                name="Team Members"
                radius={[2, 2, 0, 0]}
              />
              <Bar 
                dataKey="escalationSteps" 
                fill="#8b5cf6"
                name="Escalation Steps"
                radius={[2, 2, 0, 0]}
              />
              <Bar 
                dataKey="contactMethods" 
                fill="#f59e0b"
                name="Contact Methods"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};