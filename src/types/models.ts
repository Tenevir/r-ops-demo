// Core model interfaces for the R-Ops application

export type AlertSeverity = 'critical' | 'warning' | 'info' | 'low';
export type AlertStatus = 'active' | 'acknowledged' | 'resolved' | 'closed';
export type EventType = 'system' | 'application' | 'security' | 'performance' | 'auth';
export type UserRole = 'admin' | 'operator' | 'viewer';
export type TeamRole = 'lead' | 'member' | 'oncall';

// User Model
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  teams: string[]; // Array of team IDs
  preferences: {
    theme: 'light' | 'dark';
    notifications: {
      email: boolean;
      slack: boolean;
      sms: boolean;
    };
    timezone: string;
  };
  createdAt: string;
  lastActive: string;
}

// Team Model
export interface Team {
  id: string;
  name: string;
  description: string;
  members: TeamMember[];
  escalationPolicy: EscalationPolicy;
  onCallSchedule: OnCallSchedule;
  contactMethods: ContactMethod[];
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  userId: string;
  role: TeamRole;
  joinedAt: string;
}

export interface EscalationPolicy {
  id: string;
  steps: EscalationStep[];
  timeout: number; // minutes
}

export interface EscalationStep {
  id: string;
  order: number;
  targetType: 'user' | 'team';
  targetId: string;
  timeout: number; // minutes
}

export interface OnCallSchedule {
  id: string;
  rotation: RotationPeriod[];
  timezone: string;
}

export interface RotationPeriod {
  id: string;
  userId: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface ContactMethod {
  id: string;
  type: 'email' | 'slack' | 'sms' | 'webhook';
  value: string;
  isActive: boolean;
}

// Alert Model
export interface Alert {
  id: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  status: AlertStatus;
  source: string;
  tags: string[];
  assignedTeam?: string;
  assignedUser?: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  escalatedAt?: string;
  metadata: Record<string, any>;
  relatedEvents: string[]; // Array of event IDs
  triggeredByRule?: string; // Rule ID that created this alert
  createdAt: string;
  updatedAt: string;
}

// Event Model
export interface Event {
  id: string;
  timestamp: string;
  type: EventType;
  source: string;
  title: string;
  summary?: string; // Brief event summary
  description: string;
  payload?: Record<string, any>; // Raw event data
  metadata: Record<string, any>;
  tags: string[];
  correlationId?: string;
  userId?: string;
  sessionId?: string;
  ruleId?: string; // ID of rule that generated this event
  severity: AlertSeverity; // Make severity required
  promoted?: boolean; // Whether this event was promoted to an alert
  promotedAlertId?: string;
  createdAt: string;
  updatedAt: string; // When event was last modified
}

// Rule Model
export interface Rule {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  conditions: RuleCondition[];
  actions: RuleAction[];
  priority: number; // Execution order
  tags: string[];
  createdBy: string;
  lastModifiedBy: string;
  createdAt: string;
  updatedAt: string;
  statistics: RuleStatistics;
}

export interface RuleCondition {
  id: string;
  field: string; // Event field to check
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'regex' | 'in';
  value: any;
  logicalOperator?: 'AND' | 'OR'; // How to combine with next condition
}

export interface RuleAction {
  id: string;
  type: 'create_alert' | 'send_notification' | 'escalate' | 'tag_event' | 'webhook';
  config: Record<string, any>; // Action-specific configuration
}

export interface RuleStatistics {
  timesTriggered: number;
  alertsCreated: number;
  lastTriggered?: string;
  averageExecutionTime: number; // milliseconds
  successRate: number; // percentage
}

// API Response Wrappers
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  success: boolean;
  timestamp: string;
}

// WebSocket Message Types
export interface WebSocketMessage<T = any> {
  type: 'alert_created' | 'alert_updated' | 'event_created' | 'rule_triggered' | 'user_action' | 'connection';
  payload: T;
  timestamp: string;
  userId?: string;
}

// Authentication Models
export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthUser {
  user: User;
  token: AuthToken;
}

// Filter and Search Models
export interface AlertFilters {
  severity?: AlertSeverity[];
  status?: AlertStatus[];
  assignedTeam?: string[];
  assignedUser?: string[];
  tags?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  search?: string;
}

export interface EventFilters {
  type?: EventType[];
  source?: string[];
  severity?: AlertSeverity[];
  tags?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  search?: string;
  promoted?: boolean;
}

// Dashboard Analytics Models
export interface AlertAnalytics {
  totalAlerts: number;
  alertsBySeverity: Record<AlertSeverity, number>;
  alertsByStatus: Record<AlertStatus, number>;
  averageResolutionTime: number; // minutes
  escalationRate: number; // percentage
  trendsOverTime: TimeSeriesData[];
}

export interface EventAnalytics {
  totalEvents: number;
  eventsByType: Record<EventType, number>;
  eventsBySource: Array<{ source: string; count: number; percentage: number }>;
  promotionRate: number; // percentage of events promoted to alerts
  trendsOverTime: TimeSeriesData[];
}

export interface TeamAnalytics {
  totalTeams: number;
  averageResponseTime: number; // minutes
  alertsHandled: number;
  escalationFrequency: number;
  performanceMetrics: Array<{
    teamId: string;
    teamName: string;
    responseTime: number;
    resolutionRate: number;
    alertsHandled: number;
  }>;
}

export interface RuleAnalytics {
  totalRules: number;
  activeRules: number;
  totalExecutions: number;
  averageExecutionTime: number;
  successRate: number;
  topPerformingRules: Array<{
    ruleId: string;
    ruleName: string;
    timesTriggered: number;
    successRate: number;
  }>;
}

export interface TimeSeriesData {
  timestamp: string;
  value: number;
  label?: string;
}

// Error Models
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
}