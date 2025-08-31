import React from 'react';
import { useTheme } from '../theme/utils';
import { useAlerts } from '../hooks/useAlerts';
import { Button, Toolbar, ToolbarGroup } from './';

export const AlertFilter: React.FC = () => {
  const theme = useTheme();
  const { filters, setFilters, clearFilters, alerts } = useAlerts();

  const filterCounts = React.useMemo(() => {
    const counts = {
      all: alerts.length,
      active: alerts.filter(a => a.status === 'active').length,
      acknowledged: alerts.filter(a => a.status === 'acknowledged').length,
      resolved: alerts.filter(a => a.status === 'resolved').length,
      critical: alerts.filter(a => a.severity === 'critical').length,
      warning: alerts.filter(a => a.severity === 'warning').length,
      info: alerts.filter(a => a.severity === 'info').length,
      low: alerts.filter(a => a.severity === 'low').length,
    };
    return counts;
  }, [alerts]);

  const isStatusActive = (status: string) => filters.status.includes(status);
  const isSeverityActive = (severity: string) => filters.severity.includes(severity);

  const toggleStatusFilter = (status: string) => {
    const newStatus = isStatusActive(status)
      ? filters.status.filter(s => s !== status)
      : [...filters.status, status];
    setFilters({ status: newStatus });
  };

  const toggleSeverityFilter = (severity: string) => {
    const newSeverity = isSeverityActive(severity)
      ? filters.severity.filter(s => s !== severity)
      : [...filters.severity, severity];
    setFilters({ severity: newSeverity });
  };

  const searchInputStyle: React.CSSProperties = {
    padding: theme.spacing[2],
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.md,
    width: '200px',
    outline: 'none',
    transition: `border-color ${theme.animation.duration.fast} ${theme.animation.easing.easeOut}`,
  };

  const hasActiveFilters = filters.status.length > 0 || filters.severity.length > 0 || filters.searchQuery.length > 0;

  return (
    <section 
      role="search" 
      aria-label="Alert filtering and search"
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: theme.spacing[4],
        marginBottom: theme.spacing[6] 
      }}
    >
      {/* Search Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing[3],
        flexWrap: 'wrap',
      }}>
        <label htmlFor="alert-search" style={{
          fontSize: theme.typography.fontSize.sm,
          fontWeight: theme.typography.fontWeight.medium,
          color: theme.colors.text,
          minWidth: 'fit-content',
        }}>
          Search:
        </label>
        <input
          id="alert-search"
          type="text"
          placeholder="Search alerts..."
          value={filters.searchQuery}
          onChange={(e) => setFilters({ searchQuery: e.target.value })}
          style={searchInputStyle}
          onFocus={(e) => {
            e.target.style.borderColor = theme.colors.primary;
          }}
          onBlur={(e) => {
            e.target.style.borderColor = theme.colors.border;
          }}
          aria-describedby="search-help"
        />
        
        <div 
          id="search-help" 
          style={{
            fontSize: theme.typography.fontSize.xs,
            color: theme.colors.textMuted,
            display: 'none'
          }}
        >
          Search alert titles, descriptions, and sources
        </div>
        
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            aria-label="Clear all filters and search"
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Filter Toolbars */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: theme.spacing[3] 
      }}>
        <fieldset style={{
          border: 'none',
          margin: 0,
          padding: 0,
        }}>
          <legend style={{
            fontSize: theme.typography.fontSize.sm,
            fontWeight: theme.typography.fontWeight.medium,
            color: theme.colors.text,
            marginBottom: theme.spacing[2],
          }}>
            Filter by Status
          </legend>
          <Toolbar>
            <ToolbarGroup>
            <Button
              variant={filters.status.length === 0 ? "primary" : "ghost"}
              size="sm"
              onClick={() => setFilters({ status: [] })}
            >
              All ({filterCounts.all})
            </Button>
            <Button
              variant={isStatusActive('active') ? "primary" : "ghost"}
              size="sm"
              onClick={() => toggleStatusFilter('active')}
            >
              Active ({filterCounts.active})
            </Button>
            <Button
              variant={isStatusActive('acknowledged') ? "primary" : "ghost"}
              size="sm"
              onClick={() => toggleStatusFilter('acknowledged')}
            >
              Acknowledged ({filterCounts.acknowledged})
            </Button>
            <Button
              variant={isStatusActive('resolved') ? "primary" : "ghost"}
              size="sm"
              onClick={() => toggleStatusFilter('resolved')}
            >
              Resolved ({filterCounts.resolved})
            </Button>
            </ToolbarGroup>
          </Toolbar>
        </fieldset>

        <fieldset style={{
          border: 'none',
          margin: 0,
          padding: 0,
        }}>
          <legend style={{
            fontSize: theme.typography.fontSize.sm,
            fontWeight: theme.typography.fontWeight.medium,
            color: theme.colors.text,
            marginBottom: theme.spacing[2],
          }}>
            Filter by Severity
          </legend>
          <Toolbar>
            <ToolbarGroup>
            <Button
              variant={isSeverityActive('critical') ? "danger" : "ghost"}
              size="sm"
              onClick={() => toggleSeverityFilter('critical')}
              style={isSeverityActive('critical') ? { backgroundColor: '#ef4444', color: '#ffffff' } : undefined}
            >
              Critical ({filterCounts.critical})
            </Button>
            <Button
              variant={isSeverityActive('warning') ? "warning" : "ghost"}
              size="sm"
              onClick={() => toggleSeverityFilter('warning')}
            >
              Warning ({filterCounts.warning})
            </Button>
            <Button
              variant={isSeverityActive('info') ? "secondary" : "ghost"}
              size="sm"
              onClick={() => toggleSeverityFilter('info')}
              style={isSeverityActive('info') ? { backgroundColor: '#10b981', color: '#ffffff' } : undefined}
            >
              Info ({filterCounts.info})
            </Button>
            <Button
              variant={isSeverityActive('low') ? "secondary" : "ghost"}
              size="sm"
              onClick={() => toggleSeverityFilter('low')}
              style={isSeverityActive('low') ? { backgroundColor: '#6b7280', color: '#ffffff' } : undefined}
            >
              Low ({filterCounts.low})
            </Button>
            </ToolbarGroup>
          </Toolbar>
        </fieldset>
      </div>
    </section>
  );
};