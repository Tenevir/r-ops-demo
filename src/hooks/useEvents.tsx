import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Event, EventType, Alert } from '../types';
import { dataStore } from '../data';
import { webSocketService } from '../services/websocket';
import { useAlerts } from './useAlerts';

interface EventFilters {
  type: EventType[];
  severity: string[];
  timeRange: '1h' | '24h' | '7d' | '30d' | 'all';
  searchQuery: string;
  source: string[];
}

interface EventContextType {
  events: Event[];
  isLoading: boolean;
  selectedEvents: Set<string>;
  selectedEvent: Event | null;
  filters: EventFilters;
  // Event CRUD operations
  createEvent: (eventData: Omit<Event, 'id' | 'createdAt'>) => Promise<Event>;
  updateEvent: (id: string, updates: Partial<Event>) => Promise<Event | null>;
  deleteEvent: (id: string) => Promise<boolean>;
  // Event actions
  promoteToAlert: (eventId: string) => Promise<Alert | null>;
  promoteMultipleToAlert: (eventIds: string[]) => Promise<Alert | null>;
  // Selection management
  selectEvent: (id: string) => void;
  deselectEvent: (id: string) => void;
  selectAllEvents: () => void;
  clearSelection: () => void;
  toggleSelectEvent: (id: string) => void;
  setSelectedEventForDetails: (event: Event | null) => void;
  // Filtering
  setFilters: (filters: Partial<EventFilters>) => void;
  clearFilters: () => void;
  // Batch operations
  deleteMultiple: (eventIds: string[]) => Promise<boolean>;
  tagMultiple: (eventIds: string[], tags: string[]) => Promise<boolean>;
  // Data refresh
  refreshEvents: () => Promise<void>;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const useEvents = (): EventContextType => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEvents must be used within an EventProvider');
  }
  return context;
};

interface EventProviderProps {
  children: ReactNode;
}

export const EventProvider: React.FC<EventProviderProps> = ({ children }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set());
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [filters, setFiltersState] = useState<EventFilters>({
    type: [],
    severity: [],
    timeRange: '24h',
    searchQuery: '',
    source: []
  });

  const { createAlert } = useAlerts();

  // Load initial events
  useEffect(() => {
    refreshEvents();
  }, []);

  // Subscribe to real-time event updates
  useEffect(() => {
    const unsubscribeEventCreated = webSocketService.subscribe('event_created', (message) => {
      const newEvent = message.payload as Event;
      setEvents(prev => {
        // Check if event already exists
        const exists = prev.some(event => event.id === newEvent.id);
        if (exists) return prev;
        return [newEvent, ...prev];
      });
    });

    return () => {
      unsubscribeEventCreated();
    };
  }, []);

  const refreshEvents = useCallback(async () => {
    try {
      setIsLoading(true);
      const eventData = dataStore.getEvents();
      // Sort by creation date (newest first)
      const sortedEvents = eventData.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setEvents(sortedEvents);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createEvent = useCallback(async (eventData: Omit<Event, 'id' | 'createdAt'>): Promise<Event> => {
    const newEvent = dataStore.createEvent(eventData);
    setEvents(prev => [newEvent, ...prev]);
    return newEvent;
  }, []);

  const updateEvent = useCallback(async (id: string, updates: Partial<Event>): Promise<Event | null> => {
    const updatedEvent = dataStore.updateEvent(id, updates);
    if (updatedEvent) {
      setEvents(prev => 
        prev.map(event => 
          event.id === id ? updatedEvent : event
        )
      );
      // Update selected event if it's the one being updated
      if (selectedEvent?.id === id) {
        setSelectedEvent(updatedEvent);
      }
    }
    return updatedEvent;
  }, [selectedEvent]);

  const deleteEvent = useCallback(async (id: string): Promise<boolean> => {
    const success = dataStore.deleteEvent(id);
    if (success) {
      setEvents(prev => prev.filter(event => event.id !== id));
      setSelectedEvents(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      // Clear selected event if it's the one being deleted
      if (selectedEvent?.id === id) {
        setSelectedEvent(null);
      }
    }
    return success;
  }, [selectedEvent]);

  const promoteToAlert = useCallback(async (eventId: string): Promise<Alert | null> => {
    const event = events.find(e => e.id === eventId);
    if (!event) return null;

    try {
      const alertData = {
        title: event.summary || `Event: ${event.type}`,
        description: event.description || 'Promoted from event',
        severity: event.severity === 'critical' ? 'critical' as const : 
                 event.severity === 'warning' ? 'warning' as const : 'info' as const,
        status: 'active' as const,
        source: event.source,
        tags: [...event.tags, 'promoted-from-event'],
        updatedAt: new Date().toISOString(),
        relatedEvents: [eventId],
        triggeredByRule: event.ruleId,
        metadata: {
          ...event.metadata,
          originalEventId: eventId,
          promotedAt: new Date().toISOString()
        }
      };

      const alert = await createAlert(alertData);
      
      // Update the event to mark it as promoted
      await updateEvent(eventId, { 
        promoted: true, 
        promotedAlertId: alert.id 
      });

      return alert;
    } catch (error) {
      console.error('Error promoting event to alert:', error);
      return null;
    }
  }, [events, createAlert, updateEvent]);

  const promoteMultipleToAlert = useCallback(async (eventIds: string[]): Promise<Alert | null> => {
    if (eventIds.length === 0) return null;

    try {
      const eventsToPromote = events.filter(e => eventIds.includes(e.id));
      if (eventsToPromote.length === 0) return null;

      // Create a composite alert from multiple events
      const alertData = {
        title: `Multiple Events Alert (${eventsToPromote.length} events)`,
        description: `Alert created from ${eventsToPromote.length} related events: ${eventsToPromote.map(e => e.summary || e.type).join(', ')}`,
        severity: eventsToPromote.some(e => e.severity === 'critical') ? 'critical' as const :
                 eventsToPromote.some(e => e.severity === 'warning') ? 'warning' as const : 'info' as const,
        status: 'active' as const,
        source: 'multiple-events',
        tags: ['promoted-from-events', 'bulk-promotion'],
        updatedAt: new Date().toISOString(),
        relatedEvents: eventIds,
        metadata: {
          eventCount: eventsToPromote.length,
          eventTypes: [...new Set(eventsToPromote.map(e => e.type))],
          promotedAt: new Date().toISOString(),
          originalEventIds: eventIds
        }
      };

      const alert = await createAlert(alertData);
      
      // Update all events to mark them as promoted
      const updatePromises = eventIds.map(id => 
        updateEvent(id, { promoted: true, promotedAlertId: alert.id })
      );
      await Promise.all(updatePromises);

      return alert;
    } catch (error) {
      console.error('Error promoting multiple events to alert:', error);
      return null;
    }
  }, [events, createAlert, updateEvent]);

  const selectEvent = useCallback((id: string) => {
    setSelectedEvents(prev => new Set([...prev, id]));
  }, []);

  const deselectEvent = useCallback((id: string) => {
    setSelectedEvents(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  }, []);

  const selectAllEvents = useCallback(() => {
    const visibleEventIds = events.map(event => event.id);
    setSelectedEvents(new Set(visibleEventIds));
  }, [events]);

  const clearSelection = useCallback(() => {
    setSelectedEvents(new Set());
  }, []);

  const toggleSelectEvent = useCallback((id: string) => {
    setSelectedEvents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const setSelectedEventForDetails = useCallback((event: Event | null) => {
    setSelectedEvent(event);
  }, []);

  const setFilters = useCallback((newFilters: Partial<EventFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersState({
      type: [],
      severity: [],
      timeRange: '24h',
      searchQuery: '',
      source: []
    });
  }, []);

  const deleteMultiple = useCallback(async (eventIds: string[]): Promise<boolean> => {
    try {
      const deletePromises = eventIds.map(id => deleteEvent(id));
      const results = await Promise.all(deletePromises);
      return results.every(result => result);
    } catch (error) {
      console.error('Error in bulk delete:', error);
      return false;
    }
  }, [deleteEvent]);

  const tagMultiple = useCallback(async (eventIds: string[], tags: string[]): Promise<boolean> => {
    try {
      const updatePromises = eventIds.map(id => {
        const event = events.find(e => e.id === id);
        if (!event) return Promise.resolve(null);
        
        const newTags = [...new Set([...event.tags, ...tags])];
        return updateEvent(id, { tags: newTags });
      });
      
      const results = await Promise.all(updatePromises);
      return results.every(result => result !== null);
    } catch (error) {
      console.error('Error in bulk tagging:', error);
      return false;
    }
  }, [events, updateEvent]);

  const value: EventContextType = {
    events,
    isLoading,
    selectedEvents,
    selectedEvent,
    filters,
    createEvent,
    updateEvent,
    deleteEvent,
    promoteToAlert,
    promoteMultipleToAlert,
    selectEvent,
    deselectEvent,
    selectAllEvents,
    clearSelection,
    toggleSelectEvent,
    setSelectedEventForDetails,
    setFilters,
    clearFilters,
    deleteMultiple,
    tagMultiple,
    refreshEvents,
  };

  return <EventContext.Provider value={value}>{children}</EventContext.Provider>;
};