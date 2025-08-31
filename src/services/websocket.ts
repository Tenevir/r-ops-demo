import type { WebSocketMessage, Alert, Event } from '../types';
import { dataStore } from '../data';

// WebSocket Event Types
export type WebSocketEventType = 
  | 'alert_created' 
  | 'alert_updated' 
  | 'event_created' 
  | 'rule_triggered' 
  | 'user_action'
  | 'connection';

// WebSocket simulation class
export class MockWebSocketService {
  private subscribers: Map<string, Set<(message: WebSocketMessage) => void>> = new Map();
  private isConnected: boolean = false;
  private simulationInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startSimulation();
  }

  // Connect to the mock WebSocket
  connect(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.isConnected = true;
        console.log('🔌 Mock WebSocket connected');
        this.emit('connection', { status: 'connected', timestamp: new Date().toISOString() });
        resolve();
      }, 100); // Simulate connection delay
    });
  }

  // Disconnect from the mock WebSocket
  disconnect(): void {
    this.isConnected = false;
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
    console.log('🔌 Mock WebSocket disconnected');
  }

  // Subscribe to specific event types
  subscribe(eventType: WebSocketEventType, callback: (message: WebSocketMessage) => void): () => void {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set());
    }
    
    this.subscribers.get(eventType)!.add(callback);

    // Return unsubscribe function
    return () => {
      const subscribers = this.subscribers.get(eventType);
      if (subscribers) {
        subscribers.delete(callback);
        if (subscribers.size === 0) {
          this.subscribers.delete(eventType);
        }
      }
    };
  }

  // Subscribe to all events
  subscribeToAll(callback: (message: WebSocketMessage) => void): () => void {
    const unsubscribeFunctions: (() => void)[] = [];
    
    const eventTypes: WebSocketEventType[] = [
      'alert_created',
      'alert_updated', 
      'event_created',
      'rule_triggered',
      'user_action'
    ];

    eventTypes.forEach(eventType => {
      unsubscribeFunctions.push(this.subscribe(eventType, callback));
    });

    // Return function to unsubscribe from all
    return () => {
      unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
    };
  }

  // Emit event to subscribers
  private emit(eventType: WebSocketEventType, payload: any): void {
    if (!this.isConnected) return;

    const message: WebSocketMessage = {
      type: eventType,
      payload,
      timestamp: new Date().toISOString(),
      userId: 'user-1' // Mock current user
    };

    const subscribers = this.subscribers.get(eventType);
    if (subscribers) {
      subscribers.forEach(callback => {
        try {
          callback(message);
        } catch (error) {
          console.error('Error in WebSocket subscriber:', error);
        }
      });
    }
  }

  // Manually emit events (for testing or manual triggers)
  emitAlertCreated(alert: Alert): void {
    this.emit('alert_created', alert);
  }

  emitAlertUpdated(alert: Alert): void {
    this.emit('alert_updated', alert);
  }

  emitEventCreated(event: Event): void {
    this.emit('event_created', event);
  }

  emitRuleTriggered(ruleId: string, eventId: string): void {
    this.emit('rule_triggered', { ruleId, eventId, timestamp: new Date().toISOString() });
  }

  emitUserAction(action: string, userId: string, details: any): void {
    this.emit('user_action', { action, userId, details, timestamp: new Date().toISOString() });
  }

  // Start automatic simulation of events
  private startSimulation(): void {
    // Generate random events every 10-30 seconds
    this.simulationInterval = setInterval(() => {
      if (!this.isConnected) return;

      const randomActions = [
        () => this.simulateNewEvent(),
        () => this.simulateAlertUpdate(),
        () => this.simulateUserAction(),
      ];

      // 30% chance of generating a random event
      if (Math.random() < 0.3) {
        const randomAction = randomActions[Math.floor(Math.random() * randomActions.length)];
        randomAction();
      }
    }, Math.random() * 20000 + 10000); // 10-30 seconds
  }

  private simulateNewEvent(): void {
    const eventTypes = ['system', 'application', 'security', 'performance'] as const;
    const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    
    const newEvent = dataStore.generateRandomEvent(randomType);
    this.emitEventCreated(newEvent);

    // 20% chance the event triggers an alert
    if (Math.random() < 0.2) {
      setTimeout(() => {
        const newAlert = dataStore.generateRandomAlert();
        dataStore.updateEvent(newEvent.id, { 
          promoted: true, 
          promotedAlertId: newAlert.id 
        });
        this.emitAlertCreated(newAlert);
      }, 1000); // Delay to simulate rule processing
    }
  }

  private simulateAlertUpdate(): void {
    const alerts = dataStore.getAlerts().filter(alert => alert.status === 'active');
    if (alerts.length === 0) return;

    const randomAlert = alerts[Math.floor(Math.random() * alerts.length)];
    const statuses = ['acknowledged', 'resolved'];
    const newStatus = statuses[Math.floor(Math.random() * statuses.length)];

    const updatedAlert = dataStore.updateAlert(randomAlert.id, {
      status: newStatus as any,
      [`${newStatus}At`]: new Date().toISOString(),
      [`${newStatus}By`]: 'user-2'
    });

    if (updatedAlert) {
      this.emitAlertUpdated(updatedAlert);
    }
  }

  private simulateUserAction(): void {
    const actions = ['login', 'logout', 'view_dashboard', 'acknowledge_alert', 'create_rule'];
    const randomAction = actions[Math.floor(Math.random() * actions.length)];
    
    this.emitUserAction(randomAction, 'user-2', {
      timestamp: new Date().toISOString(),
      simulated: true
    });
  }

  // Get connection status
  get connected(): boolean {
    return this.isConnected;
  }
}

// Global WebSocket service instance
export const webSocketService = new MockWebSocketService();

// React hook for WebSocket subscriptions
export const useWebSocket = () => {
  return {
    subscribe: webSocketService.subscribe.bind(webSocketService),
    subscribeToAll: webSocketService.subscribeToAll.bind(webSocketService),
    emit: {
      alertCreated: webSocketService.emitAlertCreated.bind(webSocketService),
      alertUpdated: webSocketService.emitAlertUpdated.bind(webSocketService),
      eventCreated: webSocketService.emitEventCreated.bind(webSocketService),
      ruleTriggered: webSocketService.emitRuleTriggered.bind(webSocketService),
      userAction: webSocketService.emitUserAction.bind(webSocketService),
    },
    connected: webSocketService.connected,
    connect: webSocketService.connect.bind(webSocketService),
    disconnect: webSocketService.disconnect.bind(webSocketService),
  };
};