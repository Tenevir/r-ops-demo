import React, { useState } from 'react';
import { useTheme } from '../theme/utils';
import { useAlerts } from '../hooks/useAlerts';
import { Button, Toolbar, ToolbarGroup } from './';

export const BulkActionToolbar: React.FC = () => {
  const theme = useTheme();
  const { 
    selectedAlerts, 
    clearSelection, 
    selectAllAlerts,
    acknowledgeBulk, 
    resolveBulk, 
    escalateBulk,
    alerts 
  } = useAlerts();
  
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const selectedCount = selectedAlerts.size;
  const totalCount = alerts.length;
  const allSelected = selectedCount === totalCount && totalCount > 0;

  if (selectedCount === 0) {
    return null;
  }

  const handleBulkAction = async (action: 'acknowledge' | 'resolve' | 'escalate') => {
    setIsProcessing(action);
    try {
      const selectedIds = Array.from(selectedAlerts);
      let success = false;
      
      switch (action) {
        case 'acknowledge':
          success = await acknowledgeBulk(selectedIds);
          break;
        case 'resolve':
          success = await resolveBulk(selectedIds);
          break;
        case 'escalate':
          success = await escalateBulk(selectedIds);
          break;
      }

      if (success) {
        clearSelection();
      } else {
        console.error(`Failed to ${action} selected alerts`);
      }
    } catch (error) {
      console.error(`Error in bulk ${action}:`, error);
    } finally {
      setIsProcessing(null);
    }
  };

  const toolbarStyle: React.CSSProperties = {
    position: 'sticky',
    top: 0,
    zIndex: 10,
    backgroundColor: theme.colors.surfaceElevated,
    border: `1px solid ${theme.colors.primary}`,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing[3],
    marginBottom: theme.spacing[4],
    boxShadow: theme.elevation.md,
  };

  const selectionInfoStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing[2],
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text,
    fontWeight: theme.typography.fontWeight.medium,
  };

  const selectedIds = Array.from(selectedAlerts);
  const selectedAlertsList = alerts.filter(alert => selectedIds.includes(alert.id));
  
  // Check what actions are available for selected alerts
  const canAcknowledge = selectedAlertsList.some(alert => alert.status === 'active');
  const canResolve = selectedAlertsList.some(alert => 
    alert.status === 'active' || alert.status === 'acknowledged'
  );
  const canEscalate = selectedAlertsList.some(alert => 
    alert.status === 'active' && alert.severity !== 'critical'
  );

  return (
    <div style={toolbarStyle} role="toolbar" aria-label="Bulk actions toolbar">
      <Toolbar>
        <ToolbarGroup label="Selection">
          <div style={selectionInfoStyle}>
            <span>{selectedCount} selected</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={allSelected ? clearSelection : selectAllAlerts}
              aria-label={allSelected ? 'Deselect all alerts' : 'Select all alerts'}
            >
              {allSelected ? 'Deselect All' : 'Select All'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSelection}
              aria-label="Clear selection"
            >
              Clear
            </Button>
          </div>
        </ToolbarGroup>

        <ToolbarGroup label="Bulk Actions">
          {canAcknowledge && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleBulkAction('acknowledge')}
              loading={isProcessing === 'acknowledge'}
              disabled={!!isProcessing}
              aria-label={`Acknowledge ${selectedCount} selected alerts`}
            >
              {isProcessing === 'acknowledge' ? 'Acknowledging...' : `Acknowledge (${selectedCount})`}
            </Button>
          )}
          
          {canResolve && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleBulkAction('resolve')}
              loading={isProcessing === 'resolve'}
              disabled={!!isProcessing}
              aria-label={`Resolve ${selectedCount} selected alerts`}
            >
              {isProcessing === 'resolve' ? 'Resolving...' : `Resolve (${selectedCount})`}
            </Button>
          )}
          
          {canEscalate && (
            <Button
              variant="warning"
              size="sm"
              onClick={() => handleBulkAction('escalate')}
              loading={isProcessing === 'escalate'}
              disabled={!!isProcessing}
              aria-label={`Escalate ${selectedCount} selected alerts`}
            >
              {isProcessing === 'escalate' ? 'Escalating...' : `Escalate (${selectedCount})`}
            </Button>
          )}
        </ToolbarGroup>
      </Toolbar>
    </div>
  );
};