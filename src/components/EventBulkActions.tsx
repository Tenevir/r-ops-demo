import React, { useState } from 'react';
import { useTheme } from '../theme/utils';
import { useEvents } from '../hooks/useEvents';
import { Button, Toolbar, ToolbarGroup } from './';

export const EventBulkActions: React.FC = () => {
  const theme = useTheme();
  const { 
    selectedEvents, 
    clearSelection, 
    selectAllEvents,
    promoteMultipleToAlert, 
    deleteMultiple,
    tagMultiple,
    events 
  } = useEvents();
  
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [showTagInput, setShowTagInput] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const selectedCount = selectedEvents.size;
  const totalCount = events.length;
  const allSelected = selectedCount === totalCount && totalCount > 0;

  if (selectedCount === 0) {
    return null;
  }

  const handleBulkAction = async (action: 'promote' | 'delete' | 'tag') => {
    setIsProcessing(action);
    try {
      const selectedIds = Array.from(selectedEvents);
      let success = false;
      
      switch (action) {
        case 'promote':
          const alert = await promoteMultipleToAlert(selectedIds);
          success = !!alert;
          if (success) {
            console.log(`Promoted ${selectedIds.length} events to alert`);
          }
          break;
        case 'delete':
          success = await deleteMultiple(selectedIds);
          if (success) {
            console.log(`Deleted ${selectedIds.length} events`);
          }
          break;
        case 'tag':
          if (tagInput.trim()) {
            const tags = tagInput.split(',').map(tag => tag.trim()).filter(Boolean);
            success = await tagMultiple(selectedIds, tags);
            if (success) {
              console.log(`Tagged ${selectedIds.length} events with: ${tags.join(', ')}`);
              setTagInput('');
              setShowTagInput(false);
            }
          }
          break;
      }

      if (success && action !== 'tag') {
        clearSelection();
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

  const tagInputStyle: React.CSSProperties = {
    padding: theme.spacing[2],
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.md,
    outline: 'none',
    width: '200px',
  };

  const selectedIds = Array.from(selectedEvents);
  const selectedEventsList = events.filter(event => selectedIds.includes(event.id));
  
  // Check what actions are available for selected events
  const canPromote = selectedEventsList.some(event => !event.promoted);
  const hasUnpromotedEvents = selectedEventsList.filter(event => !event.promoted).length;

  return (
    <div style={toolbarStyle} role="toolbar" aria-label="Event bulk actions toolbar">
      <Toolbar>
        <ToolbarGroup label="Selection">
          <div style={selectionInfoStyle}>
            <span>{selectedCount} event{selectedCount !== 1 ? 's' : ''} selected</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={allSelected ? clearSelection : selectAllEvents}
              aria-label={allSelected ? 'Deselect all events' : 'Select all events'}
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
          {canPromote && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleBulkAction('promote')}
              loading={isProcessing === 'promote'}
              disabled={!!isProcessing}
              aria-label={`Promote ${hasUnpromotedEvents} unpromoted events to alert`}
            >
              {isProcessing === 'promote' 
                ? 'Promoting...' 
                : `Promote to Alert (${hasUnpromotedEvents})`
              }
            </Button>
          )}
          
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowTagInput(!showTagInput)}
            disabled={!!isProcessing}
            aria-label={`Tag ${selectedCount} selected events`}
          >
            Tag Events
          </Button>
          
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              if (confirm(`Are you sure you want to delete ${selectedCount} events? This action cannot be undone.`)) {
                handleBulkAction('delete');
              }
            }}
            loading={isProcessing === 'delete'}
            disabled={!!isProcessing}
            aria-label={`Delete ${selectedCount} selected events`}
          >
            {isProcessing === 'delete' ? 'Deleting...' : `Delete (${selectedCount})`}
          </Button>
        </ToolbarGroup>

        {showTagInput && (
          <ToolbarGroup label="Tagging">
            <input
              type="text"
              placeholder="Enter tags (comma-separated)"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              style={tagInputStyle}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleBulkAction('tag');
                }
                if (e.key === 'Escape') {
                  setShowTagInput(false);
                  setTagInput('');
                }
              }}
              autoFocus
              aria-label="Enter tags separated by commas"
            />
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleBulkAction('tag')}
              loading={isProcessing === 'tag'}
              disabled={!!isProcessing || !tagInput.trim()}
              aria-label="Apply tags to selected events"
            >
              {isProcessing === 'tag' ? 'Tagging...' : 'Apply Tags'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowTagInput(false);
                setTagInput('');
              }}
              disabled={!!isProcessing}
            >
              Cancel
            </Button>
          </ToolbarGroup>
        )}
      </Toolbar>
    </div>
  );
};