import type {
  User,
  Team,
  Alert,
  Event,
  Rule,
  AlertSeverity,
  EventType,
  RuleAuditLog,
  AlertRuleLinkage,
  RulePerformanceMetrics,
  ABTest,
} from '../types';

// Utility function to generate UUIDs for mock data
const generateId = () =>
  Math.random().toString(36).substring(2) + Date.now().toString(36);

// Mock Users
export const mockUsers: User[] = [
  {
    id: 'user-1',
    email: 'admin@company.com',
    name: 'Alex Morgan',
    role: 'admin',
    teams: ['team-1', 'team-2'],
    preferences: {
      theme: 'dark',
      notifications: { email: true, slack: true, sms: false },
      timezone: 'America/New_York',
    },
    createdAt: '2024-01-15T10:00:00Z',
    lastActive: new Date().toISOString(),
  },
  {
    id: 'user-2',
    email: 'operator@company.com',
    name: 'Sarah Chen',
    role: 'operator',
    teams: ['team-1'],
    preferences: {
      theme: 'dark',
      notifications: { email: true, slack: true, sms: true },
      timezone: 'America/Los_Angeles',
    },
    createdAt: '2024-02-01T09:30:00Z',
    lastActive: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'user-3',
    email: 'dev@company.com',
    name: 'Jordan Kim',
    role: 'operator',
    teams: ['team-2'],
    preferences: {
      theme: 'dark',
      notifications: { email: true, slack: false, sms: false },
      timezone: 'Europe/London',
    },
    createdAt: '2024-01-20T14:15:00Z',
    lastActive: new Date(Date.now() - 7200000).toISOString(),
  },
];

// Mock Teams
export const mockTeams: Team[] = [
  {
    id: 'team-1',
    name: 'Infrastructure',
    description:
      'Responsible for system infrastructure and platform reliability',
    members: [
      { userId: 'user-1', role: 'lead', joinedAt: '2024-01-15T10:00:00Z' },
      { userId: 'user-2', role: 'oncall', joinedAt: '2024-02-01T09:30:00Z' },
    ],
    escalationPolicy: {
      id: 'esc-1',
      steps: [
        {
          id: 'step-1',
          order: 1,
          targetType: 'user',
          targetId: 'user-2',
          timeout: 15,
        },
        {
          id: 'step-2',
          order: 2,
          targetType: 'user',
          targetId: 'user-1',
          timeout: 30,
        },
      ],
      timeout: 60,
    },
    onCallSchedule: {
      id: 'oncall-1',
      rotation: [
        {
          id: 'rot-1',
          userId: 'user-2',
          startTime: new Date().toISOString(),
          endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          isActive: true,
        },
      ],
      timezone: 'America/New_York',
    },
    contactMethods: [
      {
        id: 'contact-1',
        type: 'slack',
        value: '#infrastructure-alerts',
        isActive: true,
      },
      {
        id: 'contact-2',
        type: 'email',
        value: 'infra-team@company.com',
        isActive: true,
      },
    ],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'team-2',
    name: 'Application',
    description: 'Application development and maintenance team',
    members: [
      { userId: 'user-1', role: 'member', joinedAt: '2024-01-15T10:00:00Z' },
      { userId: 'user-3', role: 'lead', joinedAt: '2024-01-20T14:15:00Z' },
    ],
    escalationPolicy: {
      id: 'esc-2',
      steps: [
        {
          id: 'step-3',
          order: 1,
          targetType: 'user',
          targetId: 'user-3',
          timeout: 20,
        },
        {
          id: 'step-4',
          order: 2,
          targetType: 'team',
          targetId: 'team-1',
          timeout: 40,
        },
      ],
      timeout: 90,
    },
    onCallSchedule: {
      id: 'oncall-2',
      rotation: [
        {
          id: 'rot-2',
          userId: 'user-3',
          startTime: new Date().toISOString(),
          endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          isActive: true,
        },
      ],
      timezone: 'Europe/London',
    },
    contactMethods: [
      { id: 'contact-3', type: 'slack', value: '#app-alerts', isActive: true },
    ],
    createdAt: '2024-01-20T14:15:00Z',
    updatedAt: new Date().toISOString(),
  },
];

// Mock Alerts
export const mockAlerts: Alert[] = [
  {
    id: 'alert-1',
    title: 'Database Connection Lost',
    description:
      'Primary database connection has been lost. Automatic failover initiated.',
    severity: 'critical',
    status: 'active',
    source: 'database-monitor',
    tags: ['database', 'connectivity', 'failover'],
    assignedTeam: 'team-1',
    metadata: {
      database: 'postgres-primary',
      lastConnectionTime: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      failoverStatus: 'initiated',
    },
    relatedEvents: ['event-1', 'event-2'],
    triggeredByRule: 'rule-1',
    createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
  },
  {
    id: 'alert-2',
    title: 'High CPU Usage',
    description: 'Server CPU usage has exceeded 85% for the past 15 minutes.',
    severity: 'warning',
    status: 'acknowledged',
    source: 'system-monitor',
    tags: ['performance', 'cpu', 'server-01'],
    assignedTeam: 'team-1',
    assignedUser: 'user-2',
    acknowledgedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    acknowledgedBy: 'user-2',
    metadata: {
      server: 'server-01',
      currentCpuUsage: 87.5,
      threshold: 85.0,
      duration: 15,
    },
    relatedEvents: ['event-3', 'event-4'],
    triggeredByRule: 'rule-2',
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: 'alert-3',
    title: 'Deployment Completed',
    description:
      'Application version 2.1.4 has been successfully deployed to production.',
    severity: 'info',
    status: 'resolved',
    source: 'deployment-pipeline',
    tags: ['deployment', 'success', 'v2.1.4'],
    assignedTeam: 'team-2',
    assignedUser: 'user-3',
    acknowledgedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    acknowledgedBy: 'user-3',
    resolvedAt: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
    resolvedBy: 'user-3',
    metadata: {
      version: '2.1.4',
      environment: 'production',
      deploymentTime: '4m 32s',
      rollbackAvailable: true,
    },
    relatedEvents: ['event-5'],
    triggeredByRule: 'rule-3',
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
  },
];

// Mock Events
export const mockEvents: Event[] = [
  {
    id: 'event-1',
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    type: 'system',
    source: 'database-monitor',
    title: 'Database Connection Timeout',
    summary: 'Database connection timed out',
    description: 'Connection to postgres-primary timed out after 30 seconds',
    payload: {
      database: 'postgres-primary',
      timeout: 30000,
      connectionPool: 'primary',
      errorCode: 'ETIMEDOUT',
    },
    metadata: {
      database: 'postgres-primary',
      timeout: 30000,
      connectionPool: 'primary',
      errorCode: 'ETIMEDOUT',
    },
    tags: ['database', 'timeout', 'connectivity'],
    correlationId: 'corr-1',
    ruleId: 'rule-1',
    severity: 'critical',
    promoted: true,
    promotedAlertId: 'alert-1',
    createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
  },
  {
    id: 'event-2',
    timestamp: new Date(Date.now() - 90 * 1000).toISOString(),
    type: 'system',
    source: 'database-monitor',
    title: 'Failover Initiated',
    summary: 'Database failover completed',
    description: 'Automatic failover to postgres-secondary initiated',
    payload: {
      primaryDatabase: 'postgres-primary',
      secondaryDatabase: 'postgres-secondary',
      failoverTime: '2.1s',
    },
    metadata: {
      primaryDatabase: 'postgres-primary',
      secondaryDatabase: 'postgres-secondary',
      failoverTime: '2.1s',
    },
    tags: ['database', 'failover', 'recovery'],
    correlationId: 'corr-1',
    ruleId: 'rule-1',
    severity: 'warning',
    promoted: false,
    createdAt: new Date(Date.now() - 90 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 90 * 1000).toISOString(),
  },
  {
    id: 'event-3',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    type: 'performance',
    source: 'system-monitor',
    title: 'High CPU Usage Detected',
    summary: 'CPU usage exceeded threshold',
    description: 'CPU usage on server-01 exceeded threshold',
    payload: {
      server: 'server-01',
      cpuUsage: 87.5,
      threshold: 85.0,
      duration: '15m',
    },
    metadata: {
      server: 'server-01',
      cpuUsage: 87.5,
      threshold: 85.0,
      processes: ['node-app', 'postgres', 'nginx'],
    },
    tags: ['performance', 'cpu', 'server-01'],
    ruleId: 'rule-2',
    severity: 'warning',
    promoted: true,
    promotedAlertId: 'alert-2',
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: 'event-4',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    type: 'auth',
    source: 'auth-service',
    title: 'User Login Successful',
    summary: 'User successfully logged in',
    description: 'User admin@company.com successfully logged in',
    payload: {
      userId: 'user-1',
      email: 'admin@company.com',
      ipAddress: '192.168.1.100',
      loginMethod: 'password',
    },
    metadata: {
      userId: 'user-1',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      sessionId: 'sess-' + generateId(),
    },
    tags: ['auth', 'login', 'success'],
    userId: 'user-1',
    sessionId: 'sess-' + generateId(),
    ruleId: 'rule-2',
    severity: 'info',
    promoted: false,
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: 'event-5',
    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    type: 'application',
    source: 'deployment-pipeline',
    title: 'Deployment Started',
    summary: 'Production deployment initiated',
    description: 'Deployment of version 2.1.4 started',
    payload: {
      version: '2.1.4',
      environment: 'production',
      triggeredBy: 'user-3',
      branch: 'main',
      commit: '8f3e2a1',
      deploymentId: 'dep-' + generateId(),
    },
    metadata: {
      version: '2.1.4',
      environment: 'production',
      triggeredBy: 'user-3',
      branch: 'main',
      commit: '8f3e2a1',
    },
    tags: ['deployment', 'production', 'v2.1.4'],
    userId: 'user-3',
    ruleId: 'rule-3',
    severity: 'info',
    promoted: true,
    promotedAlertId: 'alert-3',
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
];

// Mock Rules
export const mockRules: Rule[] = [
  {
    id: 'rule-1',
    name: 'Database Connection Alert',
    description: 'Create critical alert when database connection fails',
    isActive: true,
    conditions: [
      {
        id: 'cond-1',
        field: 'source',
        operator: 'equals',
        value: 'database-monitor',
        logicalOperator: 'AND',
      },
      {
        id: 'cond-2',
        field: 'title',
        operator: 'contains',
        value: 'Connection',
        logicalOperator: 'AND',
      },
      {
        id: 'cond-3',
        field: 'metadata.errorCode',
        operator: 'equals',
        value: 'ETIMEDOUT',
      },
    ],
    actions: [
      {
        id: 'action-1',
        type: 'create_alert',
        config: {
          severity: 'critical',
          assignToTeam: 'team-1',
          title: 'Database Connection Lost',
          escalateAfter: 300, // 5 minutes
        },
      },
      {
        id: 'action-2',
        type: 'send_notification',
        config: {
          channels: ['slack', 'email'],
          recipients: ['team-1'],
        },
      },
    ],
    priority: 1,
    tags: ['database', 'critical', 'infrastructure'],
    createdBy: 'user-1',
    lastModifiedBy: 'user-1',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T15:30:00Z',
    statistics: {
      timesTriggered: 3,
      alertsCreated: 3,
      lastTriggered: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      averageExecutionTime: 45,
      successRate: 100,
      evaluationCount: 47,
      falsePosiveRate: 2.1,
      performanceImpactScore: 7,
    },
  },
  {
    id: 'rule-2',
    name: 'High Resource Usage',
    description: 'Monitor system resources and create alerts for high usage',
    isActive: true,
    conditions: [
      {
        id: 'cond-4',
        field: 'type',
        operator: 'equals',
        value: 'performance',
        logicalOperator: 'AND',
      },
      {
        id: 'cond-5',
        field: 'metadata.cpuUsage',
        operator: 'greater_than',
        value: 85,
      },
    ],
    actions: [
      {
        id: 'action-3',
        type: 'create_alert',
        config: {
          severity: 'warning',
          assignToTeam: 'team-1',
        },
      },
    ],
    priority: 2,
    tags: ['performance', 'monitoring', 'system'],
    createdBy: 'user-1',
    lastModifiedBy: 'user-2',
    createdAt: '2024-01-16T11:00:00Z',
    updatedAt: '2024-02-01T10:00:00Z',
    statistics: {
      timesTriggered: 12,
      alertsCreated: 8,
      lastTriggered: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      averageExecutionTime: 23,
      successRate: 95.5,
      evaluationCount: 25,
      falsePosiveRate: 4.5,
      performanceImpactScore: 92,
    },
  },
  {
    id: 'rule-3',
    name: 'Deployment Notifications',
    description: 'Notify teams about deployment status changes',
    isActive: true,
    conditions: [
      {
        id: 'cond-6',
        field: 'source',
        operator: 'equals',
        value: 'deployment-pipeline',
        logicalOperator: 'AND',
      },
      {
        id: 'cond-7',
        field: 'type',
        operator: 'equals',
        value: 'application',
      },
    ],
    actions: [
      {
        id: 'action-4',
        type: 'create_alert',
        config: {
          severity: 'info',
          assignToTeam: 'team-2',
        },
      },
      {
        id: 'action-5',
        type: 'send_notification',
        config: {
          channels: ['slack'],
          recipients: ['team-2'],
        },
      },
    ],
    priority: 3,
    tags: ['deployment', 'notifications', 'application'],
    createdBy: 'user-3',
    lastModifiedBy: 'user-3',
    createdAt: '2024-01-25T09:00:00Z',
    updatedAt: '2024-01-25T09:00:00Z',
    statistics: {
      timesTriggered: 24,
      alertsCreated: 24,
      lastTriggered: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      averageExecutionTime: 12,
      successRate: 100,
      evaluationCount: 156,
      falsePosiveRate: 4.2,
      performanceImpactScore: 5,
    },
  },
];

// Mock Audit Logs
export const mockRuleAuditLogs: RuleAuditLog[] = [
  {
    id: 'audit-1',
    ruleId: 'rule-1',
    action: 'created',
    userId: 'user-1',
    timestamp: '2024-01-15T10:00:00Z',
    metadata: {
      reason: 'Initial database monitoring rule setup',
    },
  },
  {
    id: 'audit-2',
    ruleId: 'rule-1',
    action: 'modified',
    userId: 'user-1',
    timestamp: '2024-01-20T15:30:00Z',
    changes: {
      field: 'conditions[0].value',
      oldValue: 'database',
      newValue: 'database-monitor',
      reason: 'Updated source field to be more specific',
    },
    impactedAlerts: ['alert-1', 'alert-2'],
  },
  {
    id: 'audit-3',
    ruleId: 'rule-1',
    action: 'triggered',
    userId: 'system',
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    metadata: {
      eventId: 'event-1',
      executionTime: 45,
    },
  },
  {
    id: 'audit-4',
    ruleId: 'rule-2',
    action: 'created',
    userId: 'user-3',
    timestamp: '2024-01-25T09:00:00Z',
  },
  {
    id: 'audit-5',
    ruleId: 'rule-1',
    action: 'ab_test_started',
    userId: 'user-1',
    timestamp: '2024-01-28T14:00:00Z',
    metadata: {
      testId: 'test-1',
      variants: ['variant-1', 'variant-2'],
    },
  },
];

// Mock Alert-Rule Linkages
export const mockAlertRuleLinkages: AlertRuleLinkage[] = [
  {
    alertId: 'alert-1',
    ruleId: 'rule-1',
    linkageType: 'triggered_by',
    confidence: 1.0,
    context: {
      eventId: 'event-1',
      executionTime: 45,
    },
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
  },
  {
    alertId: 'alert-2',
    ruleId: 'rule-1',
    linkageType: 'triggered_by',
    confidence: 1.0,
    context: {
      eventId: 'event-2',
      executionTime: 42,
    },
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    alertId: 'alert-3',
    ruleId: 'rule-2',
    linkageType: 'triggered_by',
    confidence: 0.95,
    context: {
      eventId: 'event-3',
      executionTime: 15,
    },
    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
];

// Mock Performance Metrics
export const mockRulePerformanceMetrics: RulePerformanceMetrics[] = [
  {
    ruleId: 'rule-1',
    evaluationCount: 47,
    avgExecutionTime: 45,
    memoryUsage: 2048, // 2KB
    cpuUsage: 1.2,
    alertsGenerated: 3,
    falsePositives: 1,
    truePositives: 2,
    lastCalculated: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    ruleId: 'rule-2',
    evaluationCount: 156,
    avgExecutionTime: 12,
    memoryUsage: 1024, // 1KB
    cpuUsage: 0.8,
    alertsGenerated: 24,
    falsePositives: 1,
    truePositives: 23,
    lastCalculated: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
];

// Mock A/B Tests
export const mockABTests: ABTest[] = [
  {
    id: 'test-1',
    name: 'Database Alert Threshold Optimization',
    description:
      'Testing different timeout thresholds for database connection alerts',
    baseRuleId: 'rule-1',
    variants: [
      {
        id: 'variant-1',
        name: 'Control (30s)',
        ruleId: 'rule-1',
        configuration: {
          conditions: [
            {
              id: 'cond-1',
              field: 'metadata.timeout',
              operator: 'greater_than',
              value: '30000',
            },
          ],
        },
        isControl: true,
        trafficPercentage: 50,
        status: 'running',
        createdAt: '2024-01-28T14:00:00Z',
        startedAt: '2024-01-28T14:00:00Z',
      },
      {
        id: 'variant-2',
        name: 'Test (15s)',
        ruleId: 'rule-1-variant',
        configuration: {
          conditions: [
            {
              id: 'cond-1',
              field: 'metadata.timeout',
              operator: 'greater_than',
              value: '15000',
            },
          ],
        },
        isControl: false,
        trafficPercentage: 50,
        status: 'running',
        createdAt: '2024-01-28T14:00:00Z',
        startedAt: '2024-01-28T14:00:00Z',
      },
    ],
    results: [
      {
        testId: 'test-1',
        variantId: 'variant-1',
        metrics: {
          alertsGenerated: 3,
          falsePositiveRate: 33.3,
          truePositiveRate: 66.7,
          avgExecutionTime: 45,
          userSatisfactionScore: 7.2,
        },
        statisticalSignificance: 0.12,
        confidenceInterval: { lower: 0.45, upper: 0.89 },
        calculatedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      },
      {
        testId: 'test-1',
        variantId: 'variant-2',
        metrics: {
          alertsGenerated: 8,
          falsePositiveRate: 62.5,
          truePositiveRate: 37.5,
          avgExecutionTime: 43,
          userSatisfactionScore: 5.8,
        },
        statisticalSignificance: 0.12,
        confidenceInterval: { lower: 0.22, upper: 0.53 },
        calculatedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      },
    ],
    status: 'running',
    hypothesis:
      'Lowering timeout threshold to 15s will catch issues faster without significant false positive increase',
    successMetric: 'falsePositiveRate',
    minimumSampleSize: 100,
    currentSampleSize: 47,
    createdBy: 'user-1',
    createdAt: '2024-01-28T14:00:00Z',
    startedAt: '2024-01-28T14:00:00Z',
  },
];

// In-memory data store with CRUD operations
export class MockDataStore {
  private users: User[] = [...mockUsers];
  private teams: Team[] = [...mockTeams];
  private alerts: Alert[] = [...mockAlerts];
  private events: Event[] = [...mockEvents];
  private rules: Rule[] = [...mockRules];
  private ruleAuditLogs: RuleAuditLog[] = [...mockRuleAuditLogs];
  private alertRuleLinkages: AlertRuleLinkage[] = [...mockAlertRuleLinkages];
  private rulePerformanceMetrics: RulePerformanceMetrics[] = [
    ...mockRulePerformanceMetrics,
  ];
  private abTests: ABTest[] = [...mockABTests];

  // User operations
  getUsers(): User[] {
    return [...this.users];
  }

  getUserById(id: string): User | undefined {
    return this.users.find((user) => user.id === id);
  }

  createUser(user: Omit<User, 'id' | 'createdAt'>): User {
    const newUser: User = {
      ...user,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    this.users.push(newUser);
    return newUser;
  }

  updateUser(id: string, updates: Partial<User>): User | null {
    const userIndex = this.users.findIndex((user) => user.id === id);
    if (userIndex === -1) return null;

    this.users[userIndex] = { ...this.users[userIndex], ...updates };
    return this.users[userIndex];
  }

  deleteUser(id: string): boolean {
    const userIndex = this.users.findIndex((user) => user.id === id);
    if (userIndex === -1) return false;

    this.users.splice(userIndex, 1);
    return true;
  }

  // Team operations
  getTeams(): Team[] {
    return [...this.teams];
  }

  getTeamById(id: string): Team | undefined {
    return this.teams.find((team) => team.id === id);
  }

  createTeam(team: Omit<Team, 'id' | 'createdAt' | 'updatedAt'>): Team {
    const newTeam: Team = {
      ...team,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.teams.push(newTeam);
    return newTeam;
  }

  updateTeam(id: string, updates: Partial<Team>): Team | null {
    const teamIndex = this.teams.findIndex((team) => team.id === id);
    if (teamIndex === -1) return null;

    this.teams[teamIndex] = {
      ...this.teams[teamIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return this.teams[teamIndex];
  }

  deleteTeam(id: string): boolean {
    const teamIndex = this.teams.findIndex((team) => team.id === id);
    if (teamIndex === -1) return false;

    this.teams.splice(teamIndex, 1);
    return true;
  }

  // Alert operations
  getAlerts(): Alert[] {
    return [...this.alerts];
  }

  getAlertById(id: string): Alert | undefined {
    return this.alerts.find((alert) => alert.id === id);
  }

  createAlert(alert: Omit<Alert, 'id' | 'createdAt' | 'updatedAt'>): Alert {
    const newAlert: Alert = {
      ...alert,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.alerts.push(newAlert);
    return newAlert;
  }

  updateAlert(id: string, updates: Partial<Alert>): Alert | null {
    const alertIndex = this.alerts.findIndex((alert) => alert.id === id);
    if (alertIndex === -1) return null;

    this.alerts[alertIndex] = {
      ...this.alerts[alertIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return this.alerts[alertIndex];
  }

  deleteAlert(id: string): boolean {
    const alertIndex = this.alerts.findIndex((alert) => alert.id === id);
    if (alertIndex === -1) return false;

    this.alerts.splice(alertIndex, 1);
    return true;
  }

  // Event operations
  getEvents(): Event[] {
    return [...this.events];
  }

  getEventById(id: string): Event | undefined {
    return this.events.find((event) => event.id === id);
  }

  createEvent(event: Omit<Event, 'id' | 'createdAt'>): Event {
    const newEvent: Event = {
      ...event,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    this.events.push(newEvent);
    return newEvent;
  }

  updateEvent(id: string, updates: Partial<Event>): Event | null {
    const eventIndex = this.events.findIndex((event) => event.id === id);
    if (eventIndex === -1) return null;

    this.events[eventIndex] = { ...this.events[eventIndex], ...updates };
    return this.events[eventIndex];
  }

  deleteEvent(id: string): boolean {
    const eventIndex = this.events.findIndex((event) => event.id === id);
    if (eventIndex === -1) return false;

    this.events.splice(eventIndex, 1);
    return true;
  }

  // Rule operations
  getRules(): Rule[] {
    return [...this.rules];
  }

  getRuleById(id: string): Rule | undefined {
    return this.rules.find((rule) => rule.id === id);
  }

  createRule(
    rule: Omit<Rule, 'id' | 'createdAt' | 'updatedAt' | 'statistics'>
  ): Rule {
    const newRule: Rule = {
      ...rule,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      statistics: {
        timesTriggered: 0,
        alertsCreated: 0,
        averageExecutionTime: 0,
        successRate: 100,
        evaluationCount: 0,
        falsePosiveRate: 0,
        performanceImpactScore: 100,
      },
    };
    this.rules.push(newRule);
    return newRule;
  }

  updateRule(id: string, updates: Partial<Rule>): Rule | null {
    const ruleIndex = this.rules.findIndex((rule) => rule.id === id);
    if (ruleIndex === -1) return null;

    this.rules[ruleIndex] = {
      ...this.rules[ruleIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return this.rules[ruleIndex];
  }

  deleteRule(id: string): boolean {
    const ruleIndex = this.rules.findIndex((rule) => rule.id === id);
    if (ruleIndex === -1) return false;

    this.rules.splice(ruleIndex, 1);
    return true;
  }

  // Utility methods
  reset(): void {
    this.users = [...mockUsers];
    this.teams = [...mockTeams];
    this.alerts = [...mockAlerts];
    this.events = [...mockEvents];
    this.rules = [...mockRules];
    this.ruleAuditLogs = [...mockRuleAuditLogs];
    this.alertRuleLinkages = [...mockAlertRuleLinkages];
    this.rulePerformanceMetrics = [...mockRulePerformanceMetrics];
    this.abTests = [...mockABTests];
  }

  // Generate additional mock data for testing
  generateRandomEvent(type: EventType = 'system'): Event {
    const sources = [
      'system-monitor',
      'api-gateway',
      'database-monitor',
      'auth-service',
    ];
    const titles = [
      'Service Health Check',
      'Memory Usage Normal',
      'Request Rate Updated',
      'Cache Cleared',
      'Background Job Completed',
    ];

    return this.createEvent({
      timestamp: new Date().toISOString(),
      type,
      source: sources[Math.floor(Math.random() * sources.length)],
      title: titles[Math.floor(Math.random() * titles.length)],
      summary: `${type} event generated`,
      description: `Auto-generated ${type} event for testing purposes`,
      payload: {
        generated: true,
        eventType: type,
        timestamp: new Date().toISOString(),
      },
      metadata: {
        generated: true,
        randomValue: Math.random() * 100,
      },
      tags: [type, 'generated'],
      ruleId: 'rule-auto-gen',
      severity: 'info',
      promoted: false,
      updatedAt: new Date().toISOString(),
    });
  }

  generateRandomAlert(severity: AlertSeverity = 'warning'): Alert {
    const sources = ['monitoring', 'security', 'performance', 'application'];
    const titles = [
      'System Health Alert',
      'Performance Degradation',
      'Security Event Detected',
      'Service Unavailable',
    ];

    return this.createAlert({
      title: titles[Math.floor(Math.random() * titles.length)],
      description: `Auto-generated ${severity} alert for testing purposes`,
      severity,
      status: 'active',
      source: sources[Math.floor(Math.random() * sources.length)],
      tags: [severity, 'generated'],
      assignedTeam: 'team-1',
      metadata: {
        generated: true,
        randomValue: Math.random() * 100,
      },
      relatedEvents: [],
    });
  }

  // Rule Audit Log operations
  getRuleAuditLogs(ruleId?: string): RuleAuditLog[] {
    if (ruleId) {
      return this.ruleAuditLogs.filter((log) => log.ruleId === ruleId);
    }
    return [...this.ruleAuditLogs];
  }

  createRuleAuditLog(
    log: Omit<RuleAuditLog, 'id' | 'timestamp'>
  ): RuleAuditLog {
    const newLog: RuleAuditLog = {
      ...log,
      id: generateId(),
      timestamp: new Date().toISOString(),
    };
    this.ruleAuditLogs.push(newLog);
    return newLog;
  }

  // Alert-Rule Linkage operations
  getAlertRuleLinkages(alertId?: string, ruleId?: string): AlertRuleLinkage[] {
    let linkages = [...this.alertRuleLinkages];
    if (alertId) {
      linkages = linkages.filter((link) => link.alertId === alertId);
    }
    if (ruleId) {
      linkages = linkages.filter((link) => link.ruleId === ruleId);
    }
    return linkages;
  }

  createAlertRuleLinkage(
    linkage: Omit<AlertRuleLinkage, 'timestamp'>
  ): AlertRuleLinkage {
    const newLinkage: AlertRuleLinkage = {
      ...linkage,
      timestamp: new Date().toISOString(),
    };
    this.alertRuleLinkages.push(newLinkage);
    return newLinkage;
  }

  // Rule Performance Metrics operations
  getRulePerformanceMetrics(ruleId?: string): RulePerformanceMetrics[] {
    if (ruleId) {
      return this.rulePerformanceMetrics.filter(
        (metrics) => metrics.ruleId === ruleId
      );
    }
    return [...this.rulePerformanceMetrics];
  }

  updateRulePerformanceMetrics(
    ruleId: string,
    metrics: Partial<RulePerformanceMetrics>
  ): RulePerformanceMetrics | undefined {
    const index = this.rulePerformanceMetrics.findIndex(
      (m) => m.ruleId === ruleId
    );
    if (index !== -1) {
      this.rulePerformanceMetrics[index] = {
        ...this.rulePerformanceMetrics[index],
        ...metrics,
        lastCalculated: new Date().toISOString(),
      };
      return this.rulePerformanceMetrics[index];
    }
    return undefined;
  }

  // A/B Test operations
  getABTests(ruleId?: string): ABTest[] {
    if (ruleId) {
      return this.abTests.filter((test) => test.baseRuleId === ruleId);
    }
    return [...this.abTests];
  }

  getABTestById(testId: string): ABTest | undefined {
    return this.abTests.find((test) => test.id === testId);
  }

  createABTest(test: Omit<ABTest, 'id' | 'createdAt'>): ABTest {
    const newTest: ABTest = {
      ...test,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    this.abTests.push(newTest);
    return newTest;
  }

  updateABTest(testId: string, updates: Partial<ABTest>): ABTest | undefined {
    const index = this.abTests.findIndex((test) => test.id === testId);
    if (index !== -1) {
      this.abTests[index] = { ...this.abTests[index], ...updates };
      return this.abTests[index];
    }
    return undefined;
  }

  // Navigation helper methods
  getAlertsTriggeredByRule(ruleId: string): Alert[] {
    return this.alerts.filter((alert) => alert.triggeredByRule === ruleId);
  }

  getRulesThatTriggeredAlert(alertId: string): Rule[] {
    const alert = this.getAlertById(alertId);
    if (!alert?.triggeredByRule) return [];

    const rule = this.getRuleById(alert.triggeredByRule);
    return rule ? [rule] : [];
  }
}

// Global data store instance
export const dataStore = new MockDataStore();
