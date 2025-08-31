import { http, HttpResponse } from 'msw';
import type { 
  User, 
  Team, 
  Alert, 
  Event, 
  Rule, 
  ApiResponse, 
  PaginatedResponse,
  LoginCredentials,
  AuthUser,
  AuthToken
} from '../types';
import { dataStore } from '../data';

// Authentication handlers
export const authHandlers = [
  // Login
  http.post<never, LoginCredentials>('/api/auth/login', async ({ request }) => {
    const { password } = await request.json();
    
    // Simple mock authentication
    const user = dataStore.getUserById('user-1'); // For demo, always return admin user
    
    if (!user || password !== 'demo123') {
      return HttpResponse.json(
        { success: false, message: 'Invalid credentials', timestamp: new Date().toISOString() },
        { status: 401 }
      );
    }

    const token: AuthToken = {
      accessToken: 'mock-jwt-token-' + Date.now(),
      refreshToken: 'mock-refresh-token-' + Date.now(),
      expiresIn: 3600,
      tokenType: 'Bearer'
    };

    const response: ApiResponse<AuthUser> = {
      data: { user, token },
      success: true,
      timestamp: new Date().toISOString()
    };

    return HttpResponse.json(response);
  }),

  // Logout
  http.post('/api/auth/logout', () => {
    const response: ApiResponse<null> = {
      data: null,
      success: true,
      message: 'Logged out successfully',
      timestamp: new Date().toISOString()
    };
    return HttpResponse.json(response);
  }),

  // Get current user
  http.get('/api/auth/me', () => {
    const user = dataStore.getUserById('user-1');
    const response: ApiResponse<User> = {
      data: user!,
      success: true,
      timestamp: new Date().toISOString()
    };
    return HttpResponse.json(response);
  }),
];

// User handlers
export const userHandlers = [
  // Get all users
  http.get('/api/users', () => {
    const users = dataStore.getUsers();
    const response: ApiResponse<User[]> = {
      data: users,
      success: true,
      timestamp: new Date().toISOString()
    };
    return HttpResponse.json(response);
  }),

  // Get user by ID
  http.get('/api/users/:id', ({ params }) => {
    const { id } = params;
    const user = dataStore.getUserById(id as string);
    
    if (!user) {
      return HttpResponse.json(
        { success: false, message: 'User not found', timestamp: new Date().toISOString() },
        { status: 404 }
      );
    }

    const response: ApiResponse<User> = {
      data: user,
      success: true,
      timestamp: new Date().toISOString()
    };
    return HttpResponse.json(response);
  }),

  // Update user
  http.put<{ id: string }, Partial<User>>('/api/users/:id', async ({ params, request }) => {
    const { id } = params;
    const updates = await request.json();
    
    const updatedUser = dataStore.updateUser(id, updates);
    
    if (!updatedUser) {
      return HttpResponse.json(
        { success: false, message: 'User not found', timestamp: new Date().toISOString() },
        { status: 404 }
      );
    }

    const response: ApiResponse<User> = {
      data: updatedUser,
      success: true,
      timestamp: new Date().toISOString()
    };
    return HttpResponse.json(response);
  }),
];

// Team handlers
export const teamHandlers = [
  // Get all teams
  http.get('/api/teams', () => {
    const teams = dataStore.getTeams();
    const response: ApiResponse<Team[]> = {
      data: teams,
      success: true,
      timestamp: new Date().toISOString()
    };
    return HttpResponse.json(response);
  }),

  // Get team by ID
  http.get('/api/teams/:id', ({ params }) => {
    const { id } = params;
    const team = dataStore.getTeamById(id as string);
    
    if (!team) {
      return HttpResponse.json(
        { success: false, message: 'Team not found', timestamp: new Date().toISOString() },
        { status: 404 }
      );
    }

    const response: ApiResponse<Team> = {
      data: team,
      success: true,
      timestamp: new Date().toISOString()
    };
    return HttpResponse.json(response);
  }),
];

// Alert handlers
export const alertHandlers = [
  // Get all alerts with optional filtering
  http.get('/api/alerts', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const severity = url.searchParams.get('severity');
    const status = url.searchParams.get('status');
    const search = url.searchParams.get('search');

    let alerts = dataStore.getAlerts();

    // Apply filters
    if (severity) {
      const severities = severity.split(',');
      alerts = alerts.filter(alert => severities.includes(alert.severity));
    }

    if (status) {
      const statuses = status.split(',');
      alerts = alerts.filter(alert => statuses.includes(alert.status));
    }

    if (search) {
      const searchLower = search.toLowerCase();
      alerts = alerts.filter(alert => 
        alert.title.toLowerCase().includes(searchLower) ||
        alert.description.toLowerCase().includes(searchLower) ||
        alert.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Sort by creation date (newest first)
    alerts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedAlerts = alerts.slice(startIndex, endIndex);

    const response: PaginatedResponse<Alert> = {
      data: paginatedAlerts,
      pagination: {
        page,
        limit,
        total: alerts.length,
        hasNext: endIndex < alerts.length,
        hasPrev: page > 1
      },
      success: true,
      timestamp: new Date().toISOString()
    };

    return HttpResponse.json(response);
  }),

  // Get alert by ID
  http.get('/api/alerts/:id', ({ params }) => {
    const { id } = params;
    const alert = dataStore.getAlertById(id as string);
    
    if (!alert) {
      return HttpResponse.json(
        { success: false, message: 'Alert not found', timestamp: new Date().toISOString() },
        { status: 404 }
      );
    }

    const response: ApiResponse<Alert> = {
      data: alert,
      success: true,
      timestamp: new Date().toISOString()
    };
    return HttpResponse.json(response);
  }),

  // Create alert
  http.post<never, Omit<Alert, 'id' | 'createdAt' | 'updatedAt'>>('/api/alerts', async ({ request }) => {
    const alertData = await request.json();
    const newAlert = dataStore.createAlert(alertData);

    const response: ApiResponse<Alert> = {
      data: newAlert,
      success: true,
      timestamp: new Date().toISOString()
    };

    return HttpResponse.json(response, { status: 201 });
  }),

  // Update alert
  http.put<{ id: string }, Partial<Alert>>('/api/alerts/:id', async ({ params, request }) => {
    const { id } = params;
    const updates = await request.json();
    
    const updatedAlert = dataStore.updateAlert(id, updates);
    
    if (!updatedAlert) {
      return HttpResponse.json(
        { success: false, message: 'Alert not found', timestamp: new Date().toISOString() },
        { status: 404 }
      );
    }

    const response: ApiResponse<Alert> = {
      data: updatedAlert,
      success: true,
      timestamp: new Date().toISOString()
    };
    return HttpResponse.json(response);
  }),

  // Delete alert
  http.delete('/api/alerts/:id', ({ params }) => {
    const { id } = params;
    const deleted = dataStore.deleteAlert(id as string);
    
    if (!deleted) {
      return HttpResponse.json(
        { success: false, message: 'Alert not found', timestamp: new Date().toISOString() },
        { status: 404 }
      );
    }

    const response: ApiResponse<null> = {
      data: null,
      success: true,
      message: 'Alert deleted successfully',
      timestamp: new Date().toISOString()
    };
    return HttpResponse.json(response);
  }),
];

// Event handlers
export const eventHandlers = [
  // Get all events with optional filtering
  http.get('/api/events', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const type = url.searchParams.get('type');
    const source = url.searchParams.get('source');
    const search = url.searchParams.get('search');

    let events = dataStore.getEvents();

    // Apply filters
    if (type) {
      const types = type.split(',');
      events = events.filter(event => types.includes(event.type));
    }

    if (source) {
      const sources = source.split(',');
      events = events.filter(event => sources.includes(event.source));
    }

    if (search) {
      const searchLower = search.toLowerCase();
      events = events.filter(event => 
        event.title.toLowerCase().includes(searchLower) ||
        event.description.toLowerCase().includes(searchLower) ||
        event.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Sort by timestamp (newest first)
    events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedEvents = events.slice(startIndex, endIndex);

    const response: PaginatedResponse<Event> = {
      data: paginatedEvents,
      pagination: {
        page,
        limit,
        total: events.length,
        hasNext: endIndex < events.length,
        hasPrev: page > 1
      },
      success: true,
      timestamp: new Date().toISOString()
    };

    return HttpResponse.json(response);
  }),

  // Get event by ID
  http.get('/api/events/:id', ({ params }) => {
    const { id } = params;
    const event = dataStore.getEventById(id as string);
    
    if (!event) {
      return HttpResponse.json(
        { success: false, message: 'Event not found', timestamp: new Date().toISOString() },
        { status: 404 }
      );
    }

    const response: ApiResponse<Event> = {
      data: event,
      success: true,
      timestamp: new Date().toISOString()
    };
    return HttpResponse.json(response);
  }),

  // Create event
  http.post<never, Omit<Event, 'id' | 'createdAt'>>('/api/events', async ({ request }) => {
    const eventData = await request.json();
    const newEvent = dataStore.createEvent(eventData);

    const response: ApiResponse<Event> = {
      data: newEvent,
      success: true,
      timestamp: new Date().toISOString()
    };

    return HttpResponse.json(response, { status: 201 });
  }),

  // Promote event to alert
  http.post('/api/events/:id/promote', ({ params }) => {
    const { id } = params;
    const event = dataStore.getEventById(id as string);
    
    if (!event) {
      return HttpResponse.json(
        { success: false, message: 'Event not found', timestamp: new Date().toISOString() },
        { status: 404 }
      );
    }

    // Create alert from event
    const newAlert = dataStore.createAlert({
      title: event.title,
      description: event.description,
      severity: event.severity || 'warning',
      status: 'active',
      source: event.source,
      tags: event.tags,
      assignedTeam: 'team-1', // Default assignment
      metadata: event.metadata,
      relatedEvents: [event.id],
    });

    // Update event to mark as promoted
    dataStore.updateEvent(id as string, { 
      promoted: true, 
      promotedAlertId: newAlert.id 
    });

    const response: ApiResponse<Alert> = {
      data: newAlert,
      success: true,
      message: 'Event promoted to alert successfully',
      timestamp: new Date().toISOString()
    };

    return HttpResponse.json(response, { status: 201 });
  }),
];

// Rule handlers
export const ruleHandlers = [
  // Get all rules
  http.get('/api/rules', () => {
    const rules = dataStore.getRules();
    const response: ApiResponse<Rule[]> = {
      data: rules,
      success: true,
      timestamp: new Date().toISOString()
    };
    return HttpResponse.json(response);
  }),

  // Get rule by ID
  http.get('/api/rules/:id', ({ params }) => {
    const { id } = params;
    const rule = dataStore.getRuleById(id as string);
    
    if (!rule) {
      return HttpResponse.json(
        { success: false, message: 'Rule not found', timestamp: new Date().toISOString() },
        { status: 404 }
      );
    }

    const response: ApiResponse<Rule> = {
      data: rule,
      success: true,
      timestamp: new Date().toISOString()
    };
    return HttpResponse.json(response);
  }),

  // Create rule
  http.post<never, Omit<Rule, 'id' | 'createdAt' | 'updatedAt' | 'statistics'>>('/api/rules', async ({ request }) => {
    const ruleData = await request.json();
    const newRule = dataStore.createRule(ruleData);

    const response: ApiResponse<Rule> = {
      data: newRule,
      success: true,
      timestamp: new Date().toISOString()
    };

    return HttpResponse.json(response, { status: 201 });
  }),

  // Update rule
  http.put<{ id: string }, Partial<Rule>>('/api/rules/:id', async ({ params, request }) => {
    const { id } = params;
    const updates = await request.json();
    
    const updatedRule = dataStore.updateRule(id, updates);
    
    if (!updatedRule) {
      return HttpResponse.json(
        { success: false, message: 'Rule not found', timestamp: new Date().toISOString() },
        { status: 404 }
      );
    }

    const response: ApiResponse<Rule> = {
      data: updatedRule,
      success: true,
      timestamp: new Date().toISOString()
    };
    return HttpResponse.json(response);
  }),

  // Delete rule
  http.delete('/api/rules/:id', ({ params }) => {
    const { id } = params;
    const deleted = dataStore.deleteRule(id as string);
    
    if (!deleted) {
      return HttpResponse.json(
        { success: false, message: 'Rule not found', timestamp: new Date().toISOString() },
        { status: 404 }
      );
    }

    const response: ApiResponse<null> = {
      data: null,
      success: true,
      message: 'Rule deleted successfully',
      timestamp: new Date().toISOString()
    };
    return HttpResponse.json(response);
  }),

  // Test rule against sample data
  http.post('/api/rules/:id/test', async ({ params, request }) => {
    const { id } = params;
    const { sampleEvent } = await request.json() as { sampleEvent: Event };
    
    const rule = dataStore.getRuleById(id as string);
    
    if (!rule) {
      return HttpResponse.json(
        { success: false, message: 'Rule not found', timestamp: new Date().toISOString() },
        { status: 404 }
      );
    }

    // Simple rule evaluation simulation
    const matches = rule.conditions.every(condition => {
      const fieldValue = sampleEvent.metadata[condition.field] || sampleEvent[condition.field as keyof Event];
      
      switch (condition.operator) {
        case 'equals':
          return fieldValue === condition.value;
        case 'contains':
          return String(fieldValue).includes(String(condition.value));
        case 'greater_than':
          return Number(fieldValue) > Number(condition.value);
        case 'less_than':
          return Number(fieldValue) < Number(condition.value);
        default:
          return false;
      }
    });

    const response: ApiResponse<{ matches: boolean; rule: Rule; event: Event }> = {
      data: { matches, rule, event: sampleEvent },
      success: true,
      timestamp: new Date().toISOString()
    };

    return HttpResponse.json(response);
  }),
];

// Analytics handlers
export const analyticsHandlers = [
  // Get dashboard analytics
  http.get('/api/analytics/dashboard', () => {
    const alerts = dataStore.getAlerts();
    const events = dataStore.getEvents();
    const teams = dataStore.getTeams();
    const rules = dataStore.getRules();

    const alertAnalytics = {
      totalAlerts: alerts.length,
      alertsBySeverity: alerts.reduce((acc, alert) => {
        acc[alert.severity] = (acc[alert.severity] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      alertsByStatus: alerts.reduce((acc, alert) => {
        acc[alert.status] = (acc[alert.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      averageResolutionTime: 45, // Mock average
      escalationRate: 12.5,
      trendsOverTime: Array.from({ length: 24 }, (_, i) => ({
        timestamp: new Date(Date.now() - (23 - i) * 60 * 60 * 1000).toISOString(),
        value: Math.floor(Math.random() * 20) + 5,
        label: `${23 - i}h ago`
      }))
    };

    const eventAnalytics = {
      totalEvents: events.length,
      eventsByType: events.reduce((acc, event) => {
        acc[event.type] = (acc[event.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      eventsBySource: Object.entries(
        events.reduce((acc, event) => {
          acc[event.source] = (acc[event.source] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      ).map(([source, count]) => ({
        source,
        count,
        percentage: (count / events.length) * 100
      })),
      promotionRate: (events.filter(e => e.promoted).length / events.length) * 100,
      trendsOverTime: Array.from({ length: 24 }, (_, i) => ({
        timestamp: new Date(Date.now() - (23 - i) * 60 * 60 * 1000).toISOString(),
        value: Math.floor(Math.random() * 100) + 20,
        label: `${23 - i}h ago`
      }))
    };

    const response: ApiResponse<{
      alerts: typeof alertAnalytics;
      events: typeof eventAnalytics;
      teams: { totalTeams: number };
      rules: { totalRules: number; activeRules: number };
    }> = {
      data: {
        alerts: alertAnalytics,
        events: eventAnalytics,
        teams: { totalTeams: teams.length },
        rules: { 
          totalRules: rules.length, 
          activeRules: rules.filter(r => r.isActive).length 
        }
      },
      success: true,
      timestamp: new Date().toISOString()
    };

    return HttpResponse.json(response);
  }),
];

// Combined handlers export
export const handlers = [
  ...authHandlers,
  ...userHandlers,
  ...teamHandlers,
  ...alertHandlers,
  ...eventHandlers,
  ...ruleHandlers,
  ...analyticsHandlers,
];