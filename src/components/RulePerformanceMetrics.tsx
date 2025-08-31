import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import type { Rule } from '../types';
import { useTheme } from '../theme/utils';
import { Card, CardHeader, CardTitle, CardContent } from './';
import { dataStore } from '../data';

interface RulePerformanceMetricsProps {
  rules: Rule[];
  selectedRule?: Rule | null;
  height?: number;
}

export const RulePerformanceMetrics: React.FC<RulePerformanceMetricsProps> = ({
  rules,
  selectedRule,
  height = 300,
}) => {
  const theme = useTheme();

  const performanceData = useMemo(() => {
    return rules.map((rule) => {
      const metrics = dataStore.getRulePerformanceMetrics(rule.id)[0];
      return {
        ruleName:
          rule.name.length > 15
            ? rule.name.substring(0, 15) + '...'
            : rule.name,
        fullName: rule.name,
        ruleId: rule.id,
        executionTime: metrics?.avgExecutionTime || 0,
        evaluationCount: metrics?.evaluationCount || 0,
        alertsGenerated: metrics?.alertsGenerated || 0,
        falsePositiveRate:
          ((metrics?.falsePositives || 0) /
            Math.max(metrics?.alertsGenerated || 1, 1)) *
          100,
        truePositiveRate:
          ((metrics?.truePositives || 0) /
            Math.max(metrics?.alertsGenerated || 1, 1)) *
          100,
        cpuUsage: metrics?.cpuUsage || 0,
        memoryUsage: (metrics?.memoryUsage || 0) / 1024, // Convert to KB
        performanceScore: rule.statistics.performanceImpactScore,
        successRate: rule.statistics.successRate,
      };
    });
  }, [rules]);

  const detailedMetrics = useMemo(() => {
    if (!selectedRule) return null;

    const metrics = dataStore.getRulePerformanceMetrics(selectedRule.id)[0];
    if (!metrics) return null;

    return {
      rule: selectedRule,
      metrics,
      accuracy: (
        (metrics.truePositives / Math.max(metrics.alertsGenerated, 1)) *
        100
      ).toFixed(1),
      precision: (
        (metrics.truePositives /
          Math.max(metrics.truePositives + metrics.falsePositives, 1)) *
        100
      ).toFixed(1),
      efficiency: (
        metrics.evaluationCount / Math.max(metrics.avgExecutionTime, 1)
      ).toFixed(2),
      reliability: (
        ((metrics.evaluationCount - metrics.falsePositives * 2) /
          Math.max(metrics.evaluationCount, 1)) *
        100
      ).toFixed(1),
    };
  }, [selectedRule]);

  const getPerformanceColor = (score: number): string => {
    if (score >= 8) return '#10b981'; // Green
    if (score >= 6) return '#f59e0b'; // Yellow
    if (score >= 4) return '#f97316'; // Orange
    return '#ef4444'; // Red
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
        {payload.map((entry, index) => (
          <div
            key={index}
            style={{
              color: entry.color,
              fontSize: theme.typography.fontSize.xs,
            }}
          >
            {entry.name}: {entry.value.toFixed(2)}
            {entry.name.includes('Rate') && '%'}
            {entry.name.includes('Time') && 'ms'}
            {entry.name.includes('Memory') && 'KB'}
            {entry.name.includes('CPU') && '%'}
          </div>
        ))}
      </div>
    );
  };

  const chartContainerStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: selectedRule
      ? '1fr 1fr'
      : 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: theme.spacing[6],
  };

  if (!rules || rules.length === 0) {
    return (
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Rule Performance Metrics</CardTitle>
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
              No Performance Data Available
            </div>
            <div>
              Create some rules to view performance metrics and analytics.
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div style={chartContainerStyle}>
      {/* Execution Time Comparison */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Execution Time Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={performanceData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={theme.colors.border}
              />
              <XAxis
                dataKey="ruleName"
                stroke={theme.colors.textMuted}
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
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
                fill={theme.colors.primary}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Alert Generation vs False Positives */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Alert Generation Accuracy</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={performanceData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={theme.colors.border}
              />
              <XAxis
                dataKey="ruleName"
                stroke={theme.colors.textMuted}
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis
                stroke={theme.colors.textMuted}
                fontSize={12}
                label={{
                  value: 'Percentage',
                  angle: -90,
                  position: 'insideLeft',
                }}
                domain={[0, 100]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="truePositiveRate"
                fill="#10b981"
                name="True Positive Rate"
              />
              <Bar
                dataKey="falsePositiveRate"
                fill="#ef4444"
                name="False Positive Rate"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Resource Usage */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Resource Usage Impact</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={performanceData} layout="horizontal">
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={theme.colors.border}
              />
              <XAxis
                type="number"
                stroke={theme.colors.textMuted}
                fontSize={12}
              />
              <YAxis
                type="category"
                dataKey="ruleName"
                stroke={theme.colors.textMuted}
                fontSize={12}
                width={120}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="cpuUsage" fill="#f59e0b" name="CPU Usage %" />
              <Bar
                dataKey="memoryUsage"
                fill="#8b5cf6"
                name="Memory Usage (KB)"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Performance Impact Score */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Performance Impact Scores</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={performanceData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={40}
                paddingAngle={2}
                dataKey="performanceScore"
                label={({ name, value }) => `${name}: ${value}`}
                labelLine={false}
              >
                {performanceData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={getPerformanceColor(entry.performanceScore)}
                  />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null;
                  const data = payload[0].payload;
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
                        }}
                      >
                        {data.fullName}
                      </div>
                      <div>Impact Score: {data.performanceScore}/10</div>
                      <div>Success Rate: {data.successRate}%</div>
                      <div>Alerts Generated: {data.alertsGenerated}</div>
                    </div>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Metrics for Selected Rule */}
      {detailedMetrics && (
        <Card variant="elevated" style={{ gridColumn: '1 / -1' }}>
          <CardHeader>
            <CardTitle>
              Detailed Metrics - {detailedMetrics.rule.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: theme.spacing[4],
              }}
            >
              <div
                style={{
                  padding: theme.spacing[4],
                  backgroundColor: theme.colors.surface,
                  borderRadius: theme.borderRadius.md,
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    fontSize: theme.typography.fontSize['2xl'],
                    fontWeight: theme.typography.fontWeight.bold,
                    color: theme.colors.primary,
                    marginBottom: theme.spacing[1],
                  }}
                >
                  {detailedMetrics.metrics.evaluationCount.toLocaleString()}
                </div>
                <div
                  style={{
                    fontSize: theme.typography.fontSize.sm,
                    color: theme.colors.textMuted,
                  }}
                >
                  Total Evaluations
                </div>
              </div>

              <div
                style={{
                  padding: theme.spacing[4],
                  backgroundColor: theme.colors.surface,
                  borderRadius: theme.borderRadius.md,
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    fontSize: theme.typography.fontSize['2xl'],
                    fontWeight: theme.typography.fontWeight.bold,
                    color:
                      detailedMetrics.metrics.avgExecutionTime > 50
                        ? '#ef4444'
                        : '#10b981',
                    marginBottom: theme.spacing[1],
                  }}
                >
                  {detailedMetrics.metrics.avgExecutionTime}ms
                </div>
                <div
                  style={{
                    fontSize: theme.typography.fontSize.sm,
                    color: theme.colors.textMuted,
                  }}
                >
                  Avg Execution Time
                </div>
              </div>

              <div
                style={{
                  padding: theme.spacing[4],
                  backgroundColor: theme.colors.surface,
                  borderRadius: theme.borderRadius.md,
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    fontSize: theme.typography.fontSize['2xl'],
                    fontWeight: theme.typography.fontWeight.bold,
                    color:
                      parseFloat(detailedMetrics.accuracy) > 80
                        ? '#10b981'
                        : '#ef4444',
                    marginBottom: theme.spacing[1],
                  }}
                >
                  {detailedMetrics.accuracy}%
                </div>
                <div
                  style={{
                    fontSize: theme.typography.fontSize.sm,
                    color: theme.colors.textMuted,
                  }}
                >
                  Accuracy
                </div>
              </div>

              <div
                style={{
                  padding: theme.spacing[4],
                  backgroundColor: theme.colors.surface,
                  borderRadius: theme.borderRadius.md,
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    fontSize: theme.typography.fontSize['2xl'],
                    fontWeight: theme.typography.fontWeight.bold,
                    color:
                      parseFloat(detailedMetrics.precision) > 85
                        ? '#10b981'
                        : '#f59e0b',
                    marginBottom: theme.spacing[1],
                  }}
                >
                  {detailedMetrics.precision}%
                </div>
                <div
                  style={{
                    fontSize: theme.typography.fontSize.sm,
                    color: theme.colors.textMuted,
                  }}
                >
                  Precision
                </div>
              </div>

              <div
                style={{
                  padding: theme.spacing[4],
                  backgroundColor: theme.colors.surface,
                  borderRadius: theme.borderRadius.md,
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    fontSize: theme.typography.fontSize['2xl'],
                    fontWeight: theme.typography.fontWeight.bold,
                    color: theme.colors.primary,
                    marginBottom: theme.spacing[1],
                  }}
                >
                  {detailedMetrics.efficiency}
                </div>
                <div
                  style={{
                    fontSize: theme.typography.fontSize.sm,
                    color: theme.colors.textMuted,
                  }}
                >
                  Efficiency Score
                </div>
              </div>

              <div
                style={{
                  padding: theme.spacing[4],
                  backgroundColor: theme.colors.surface,
                  borderRadius: theme.borderRadius.md,
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    fontSize: theme.typography.fontSize['2xl'],
                    fontWeight: theme.typography.fontWeight.bold,
                    color:
                      parseFloat(detailedMetrics.reliability) > 90
                        ? '#10b981'
                        : '#f59e0b',
                    marginBottom: theme.spacing[1],
                  }}
                >
                  {detailedMetrics.reliability}%
                </div>
                <div
                  style={{
                    fontSize: theme.typography.fontSize.sm,
                    color: theme.colors.textMuted,
                  }}
                >
                  Reliability
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: theme.spacing[6],
                padding: theme.spacing[4],
                backgroundColor: theme.colors.surface,
                borderRadius: theme.borderRadius.md,
              }}
            >
              <h4
                style={{
                  margin: `0 0 ${theme.spacing[3]} 0`,
                  fontSize: theme.typography.fontSize.base,
                  fontWeight: theme.typography.fontWeight.semibold,
                }}
              >
                Performance Summary
              </h4>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: theme.spacing[4],
                  fontSize: theme.typography.fontSize.sm,
                }}
              >
                <div>
                  <strong>Resource Impact:</strong>{' '}
                  {detailedMetrics.rule.statistics.performanceImpactScore}/10
                  <br />
                  <strong>Memory Usage:</strong>{' '}
                  {(detailedMetrics.metrics.memoryUsage / 1024).toFixed(2)} KB
                  <br />
                  <strong>CPU Usage:</strong> {detailedMetrics.metrics.cpuUsage}
                  %
                </div>
                <div>
                  <strong>Alert Quality:</strong>
                  <br />
                  <span style={{ color: '#10b981' }}>
                    ✓ True Positives: {detailedMetrics.metrics.truePositives}
                  </span>
                  <br />
                  <span style={{ color: '#ef4444' }}>
                    ✗ False Positives: {detailedMetrics.metrics.falsePositives}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
