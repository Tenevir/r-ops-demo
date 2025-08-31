import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Alert, AlertStatus } from '../types';
import { dataStore } from '../data';
import { webSocketService } from '../services/websocket';

interface AlertContextType {
  alerts: Alert[];
  isLoading: boolean;
  selectedAlerts: Set<string>;
  filters: {
    severity: string[];
    status: string[];
    searchQuery: string;
  };
  // Alert CRUD operations
  createAlert: (alertData: Omit<Alert, 'id' | 'createdAt'>) => Promise<Alert>;
  updateAlert: (id: string, updates: Partial<Alert>) => Promise<Alert | null>;
  deleteAlert: (id: string) => Promise<boolean>;
  // Alert actions
  acknowledgeAlert: (id: string) => Promise<boolean>;
  resolveAlert: (id: string) => Promise<boolean>;
  escalateAlert: (id: string) => Promise<boolean>;
  // Bulk operations
  acknowledgeBulk: (ids: string[]) => Promise<boolean>;
  resolveBulk: (ids: string[]) => Promise<boolean>;
  escalateBulk: (ids: string[]) => Promise<boolean>;
  // Selection management
  selectAlert: (id: string) => void;
  deselectAlert: (id: string) => void;
  selectAllAlerts: () => void;
  clearSelection: () => void;
  toggleSelectAlert: (id: string) => void;
  // Filtering
  setFilters: (filters: Partial<AlertContextType['filters']>) => void;
  clearFilters: () => void;
  // Data refresh
  refreshAlerts: () => Promise<void>;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlerts = (): AlertContextType => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlerts must be used within an AlertProvider');
  }
  return context;
};

interface AlertProviderProps {
  children: ReactNode;
}

export const AlertProvider: React.FC<AlertProviderProps> = ({ children }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAlerts, setSelectedAlerts] = useState<Set<string>>(new Set());
  const [filters, setFiltersState] = useState({
    severity: [] as string[],
    status: [] as string[],
    searchQuery: ''
  });

  // Load initial alerts
  useEffect(() => {
    refreshAlerts();
  }, []);

  // Subscribe to real-time alert updates
  useEffect(() => {
    const unsubscribeAlertCreated = webSocketService.subscribe('alert_created', (message) => {
      const newAlert = message.payload as Alert;
      setAlerts(prev => {
        // Check if alert already exists
        const exists = prev.some(alert => alert.id === newAlert.id);
        if (exists) return prev;
        return [newAlert, ...prev];
      });
    });

    const unsubscribeAlertUpdated = webSocketService.subscribe('alert_updated', (message) => {
      const updatedAlert = message.payload as Alert;
      setAlerts(prev => 
        prev.map(alert => 
          alert.id === updatedAlert.id ? updatedAlert : alert
        )
      );
    });

    return () => {
      unsubscribeAlertCreated();
      unsubscribeAlertUpdated();
    };
  }, []);

  const refreshAlerts = useCallback(async () => {
    try {
      setIsLoading(true);
      const alertData = dataStore.getAlerts();
      setAlerts(alertData);
    } catch (error) {
      console.error('Error loading alerts:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createAlert = useCallback(async (alertData: Omit<Alert, 'id' | 'createdAt'>): Promise<Alert> => {
    const newAlert = dataStore.createAlert(alertData);
    setAlerts(prev => [newAlert, ...prev]);
    return newAlert;
  }, []);

  const updateAlert = useCallback(async (id: string, updates: Partial<Alert>): Promise<Alert | null> => {
    const updatedAlert = dataStore.updateAlert(id, updates);
    if (updatedAlert) {
      setAlerts(prev => 
        prev.map(alert => 
          alert.id === id ? updatedAlert : alert
        )
      );
    }
    return updatedAlert;
  }, []);

  const deleteAlert = useCallback(async (id: string): Promise<boolean> => {
    const success = dataStore.deleteAlert(id);
    if (success) {
      setAlerts(prev => prev.filter(alert => alert.id !== id));
      setSelectedAlerts(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
    return success;
  }, []);

  const acknowledgeAlert = useCallback(async (id: string): Promise<boolean> => {
    const updatedAlert = await updateAlert(id, {
      status: 'acknowledged' as AlertStatus,
      acknowledgedAt: new Date().toISOString(),
      acknowledgedBy: 'current-user' // TODO: Get from auth context
    });
    return !!updatedAlert;
  }, [updateAlert]);

  const resolveAlert = useCallback(async (id: string): Promise<boolean> => {
    const updatedAlert = await updateAlert(id, {
      status: 'resolved' as AlertStatus,
      resolvedAt: new Date().toISOString(),
      resolvedBy: 'current-user' // TODO: Get from auth context
    });
    return !!updatedAlert;
  }, [updateAlert]);

  const escalateAlert = useCallback(async (id: string): Promise<boolean> => {
    const alert = alerts.find(a => a.id === id);
    if (!alert) return false;

    // Escalate by increasing severity
    const severityLevels = ['low', 'info', 'warning', 'critical'] as const;
    const currentIndex = severityLevels.indexOf(alert.severity);
    const newSeverity = currentIndex < severityLevels.length - 1 
      ? severityLevels[currentIndex + 1] 
      : alert.severity;

    const updatedAlert = await updateAlert(id, {
      severity: newSeverity,
      escalatedAt: new Date().toISOString()
    });
    return !!updatedAlert;
  }, [alerts, updateAlert]);

  const acknowledgeBulk = useCallback(async (ids: string[]): Promise<boolean> => {
    try {
      const promises = ids.map(id => acknowledgeAlert(id));
      const results = await Promise.all(promises);
      return results.every(result => result);
    } catch (error) {
      console.error('Error in bulk acknowledge:', error);
      return false;
    }
  }, [acknowledgeAlert]);

  const resolveBulk = useCallback(async (ids: string[]): Promise<boolean> => {
    try {
      const promises = ids.map(id => resolveAlert(id));
      const results = await Promise.all(promises);
      return results.every(result => result);
    } catch (error) {
      console.error('Error in bulk resolve:', error);
      return false;
    }
  }, [resolveAlert]);

  const escalateBulk = useCallback(async (ids: string[]): Promise<boolean> => {
    try {
      const promises = ids.map(id => escalateAlert(id));
      const results = await Promise.all(promises);
      return results.every(result => result);
    } catch (error) {
      console.error('Error in bulk escalate:', error);
      return false;
    }
  }, [escalateAlert]);

  const selectAlert = useCallback((id: string) => {
    setSelectedAlerts(prev => new Set([...prev, id]));
  }, []);

  const deselectAlert = useCallback((id: string) => {
    setSelectedAlerts(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  }, []);

  const selectAllAlerts = useCallback(() => {
    const visibleAlertIds = alerts.map(alert => alert.id);
    setSelectedAlerts(new Set(visibleAlertIds));
  }, [alerts]);

  const clearSelection = useCallback(() => {
    setSelectedAlerts(new Set());
  }, []);

  const toggleSelectAlert = useCallback((id: string) => {
    setSelectedAlerts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const setFilters = useCallback((newFilters: Partial<AlertContextType['filters']>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersState({
      severity: [],
      status: [],
      searchQuery: ''
    });
  }, []);

  const value: AlertContextType = {
    alerts,
    isLoading,
    selectedAlerts,
    filters,
    createAlert,
    updateAlert,
    deleteAlert,
    acknowledgeAlert,
    resolveAlert,
    escalateAlert,
    acknowledgeBulk,
    resolveBulk,
    escalateBulk,
    selectAlert,
    deselectAlert,
    selectAllAlerts,
    clearSelection,
    toggleSelectAlert,
    setFilters,
    clearFilters,
    refreshAlerts,
  };

  return <AlertContext.Provider value={value}>{children}</AlertContext.Provider>;
};