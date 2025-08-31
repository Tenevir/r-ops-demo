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
  Legend,
} from 'recharts';
import type { Rule } from '../types';
import { useTheme } from '../theme/utils';
import { Card, CardHeader, CardTitle, CardContent } from './';

interface RuleAnalyticsProps {
  rules: Rule[];
  selectedRule?: Rule | null;
  height?: number;
}

export const RuleAnalytics: React.FC<RuleAnalyticsProps> = ({
  rules,
  selectedRule,
  height = 300,
}) => {
  const theme = useTheme();

  // Use selected rule for potential future filtering (currently unused)
  void selectedRule;

  const analyticsData = useMemo(() => {
    return rules.map((rule) => ({
      name:
        rule.name.length > 15 ? rule.name.substring(0, 15) + '...' : rule.name,
      fullName: rule.name,
      triggered: rule.statistics.timesTriggered,
      alertsCreated: rule.statistics.alertsCreated,
      successRate: rule.statistics.successRate,
      avgExecutionTime: rule.statistics.averageExecutionTime,
      isActive: rule.isActive,
    }));
  }, [rules]);

  const triggersOverTimeData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((day) => {
      const dayData: { day: string; [key: string]: number | string } = { day };
      rules.forEach((rule) => {
        // Mock data for demonstration - in real app this would come from time series data
        dayData[rule.name] = Math.floor(
          (Math.random() * rule.statistics.timesTriggered) / 7
        );
      });
      return dayData;
    });
  }, [rules]);

  const ruleEffectivenessData = useMemo(() => {
    return rules.map((rule) => ({
      name: rule.name,
      successRate: rule.statistics.successRate,
      triggered: rule.statistics.timesTriggered,
      alertsCreated: rule.statistics.alertsCreated,
      efficiency:
        rule.statistics.alertsCreated /
        Math.max(rule.statistics.timesTriggered, 1),
    }));
  }, [rules]);

  const executionTimeData = useMemo(() => {
    return rules.map((rule) => ({
      name:
        rule.name.length > 12 ? rule.name.substring(0, 12) + '...' : rule.name,
      executionTime: rule.statistics.averageExecutionTime,
      triggered: rule.statistics.timesTriggered,
    }));
  }, [rules]);

  const getRuleColor = (index: number): string => {
    const colors = [
      '#3b82f6',
      '#8b5cf6',
      '#f59e0b',
      '#ef4444',
      '#10b981',
      '#6366f1',
    ];
    return colors[index % colors.length];
  };

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{ name: string; value: number; color: string }>;
    label?: string;
  }) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div
        style={{
          backgroundColor: theme.colors.surfaceElevated,
          padding: theme.spacing[3],
          borderRadius: theme.borderRadius.md,
          border: `1px solid ${theme.colors.border}`,
          fontSize: theme.typography.fontSize.sm,
          boxShadow: theme.elevation.md,
        }}
      >
        <div
          style={{
            fontWeight: theme.typography.fontWeight.semibold,
            marginBottom: theme.spacing[1],
            color: theme.colors.text,
          }}
        >
          {label}
        </div>
        {payload.map(
          (
            entry: { name: string; value: number | string; color: string },
            index: number
          ) => (
            <div
              key={index}
              style={{
                color: entry.color,
                fontSize: theme.typography.fontSize.xs,
              }}
            >
              {entry.name}:{' '}
              {typeof entry.value === 'number'
                ? entry.value.toFixed(1)
                : entry.value}
              {entry.name.includes('Rate') && '%'}
              {entry.name.includes('Time') && 'ms'}
            </div>
          )
        )}
      </div>
    );
  };

  if (!rules || rules.length === 0) {
    return (
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Rule Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            style={{
              textAlign: 'center',
              padding: theme.spacing[8],
              color: theme.colors.textMuted,
            }}
          >
            <div
              style={{
                fontSize: theme.typography.fontSize.xl,
                marginBottom: theme.spacing[2],
              }}
            >
              📊
            </div>
            <div
              style={{
                fontSize: theme.typography.fontSize.lg,
                fontWeight: theme.typography.fontWeight.medium,
                marginBottom: theme.spacing[2],
              }}
            >
              No Rule Data Available
            </div>
            <div>Create rules to view performance analytics.</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: theme.spacing[6],
      }}
    >
      {/* Rule Triggers Comparison */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Rule Triggers Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={analyticsData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={theme.colors.border}
              />
              <XAxis
                dataKey="name"
                stroke={theme.colors.textMuted}
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis
                stroke={theme.colors.textMuted}
                fontSize={12}
                label={{ value: 'Count', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="triggered"
                fill={theme.colors.primary}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Rule Triggers Over Time */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Rule Triggers Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={triggersOverTimeData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={theme.colors.border}
              />
              <XAxis
                dataKey="day"
                stroke={theme.colors.textMuted}
                fontSize={12}
              />
              <YAxis
                stroke={theme.colors.textMuted}
                fontSize={12}
                label={{
                  value: 'Triggers',
                  angle: -90,
                  position: 'insideLeft',
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {rules.map((rule, index) => (
                <Line
                  key={rule.id}
                  type="monotone"
                  dataKey={rule.name}
                  stroke={getRuleColor(index)}
                  strokeWidth={2}
                  dot={{ fill: getRuleColor(index), strokeWidth: 0, r: 4 }}
                  activeDot={{
                    r: 6,
                    stroke: getRuleColor(index),
                    strokeWidth: 2,
                  }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Success Rate Distribution */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Rule Success Rates</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={ruleEffectivenessData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={40}
                paddingAngle={2}
                dataKey="successRate"
                label={({ name, successRate }) => `${name}: ${successRate}%`}
                labelLine={false}
              >
                {ruleEffectivenessData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={getRuleColor(index)} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Execution Performance */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Execution Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={executionTimeData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={theme.colors.border}
              />
              <XAxis
                dataKey="name"
                stroke={theme.colors.textMuted}
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis
                stroke={theme.colors.textMuted}
                fontSize={12}
                label={{
                  value: 'Milliseconds',
                  angle: -90,
                  position: 'insideLeft',
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="executionTime"
                fill="#8b5cf6"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Rule Status Overview */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Rule Status Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: theme.spacing[4],
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: theme.typography.fontSize['2xl'],
                  fontWeight: theme.typography.fontWeight.bold,
                  color: theme.colors.primary,
                  marginBottom: theme.spacing[1],
                }}
              >
                {rules.length}
              </div>
              <div
                style={{
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.textMuted,
                }}
              >
                Total Rules
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: theme.typography.fontSize['2xl'],
                  fontWeight: theme.typography.fontWeight.bold,
                  color: theme.colors.success,
                  marginBottom: theme.spacing[1],
                }}
              >
                {rules.filter((r) => r.isActive).length}
              </div>
              <div
                style={{
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.textMuted,
                }}
              >
                Active Rules
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: theme.typography.fontSize['2xl'],
                  fontWeight: theme.typography.fontWeight.bold,
                  color: theme.colors.info,
                  marginBottom: theme.spacing[1],
                }}
              >
                {Math.round(
                  rules.reduce((sum, r) => sum + r.statistics.successRate, 0) /
                    rules.length
                )}
                %
              </div>
              <div
                style={{
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.textMuted,
                }}
              >
                Avg Success Rate
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: theme.typography.fontSize['2xl'],
                  fontWeight: theme.typography.fontWeight.bold,
                  color: theme.colors.warning,
                  marginBottom: theme.spacing[1],
                }}
              >
                {rules.reduce((sum, r) => sum + r.statistics.timesTriggered, 0)}
              </div>
              <div
                style={{
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.textMuted,
                }}
              >
                Total Triggers
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
