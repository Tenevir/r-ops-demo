import React, { useMemo, useRef, useEffect } from 'react';
import { useTheme } from '../theme/utils';
import { useEvents } from '../hooks/useEvents';
import { Button, Toolbar, ToolbarGroup } from './';

export const EventFilter: React.FC = () => {
  const theme = useTheme();
  const { filters, setFilters, clearFilters, events } = useEvents();
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const filterCounts = useMemo(() => {
    const now = new Date();
    const getTimeThreshold = (range: string) => {
      switch (range) {
        case '1h': return new Date(now.getTime() - 60 * 60 * 1000);
        case '24h': return new Date(now.getTime() - 24 * 60 * 60 * 1000);
        case '7d': return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        case '30d': return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        default: return new Date(0);
      }
    };

    const counts = {
      all: events.length,
      system: events.filter(e => e.type === 'system').length,
      application: events.filter(e => e.type === 'application').length,
      security: events.filter(e => e.type === 'security').length,
      performance: events.filter(e => e.type === 'performance').length,
      critical: events.filter(e => e.severity === 'critical').length,
      warning: events.filter(e => e.severity === 'warning').length,
      info: events.filter(e => e.severity === 'info').length,
      low: events.filter(e => e.severity === 'low').length,
      hour: events.filter(e => new Date(e.createdAt) >= getTimeThreshold('1h')).length,
      day: events.filter(e => new Date(e.createdAt) >= getTimeThreshold('24h')).length,
      week: events.filter(e => new Date(e.createdAt) >= getTimeThreshold('7d')).length,
      month: events.filter(e => new Date(e.createdAt) >= getTimeThreshold('30d')).length,
    };
    return counts;
  }, [events]);

  const isTypeActive = (type: string) => filters.type.includes(type as any);
  const isSeverityActive = (severity: string) => filters.severity.includes(severity);
  const isTimeRangeActive = (range: string) => filters.timeRange === range;

  const toggleTypeFilter = (type: string) => {
    const newTypes = isTypeActive(type)
      ? filters.type.filter(t => t !== type)
      : [...filters.type, type as any];
    setFilters({ type: newTypes });
  };

  const toggleSeverityFilter = (severity: string) => {
    const newSeverity = isSeverityActive(severity)
      ? filters.severity.filter(s => s !== severity)
      : [...filters.severity, severity];
    setFilters({ severity: newSeverity });
  };

  const setTimeRange = (range: typeof filters.timeRange) => {
    setFilters({ timeRange: range });
  };

  // Debounced search input
  const handleSearchChange = (value: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      setFilters({ searchQuery: value });
    }, 300); // 300ms debounce
  };

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const searchInputStyle: React.CSSProperties = {
    padding: theme.spacing[2],
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.md,
    width: '250px',
    outline: 'none',
    transition: `border-color ${theme.animation.duration.fast} ${theme.animation.easing.easeOut}`,
  };

  const hasActiveFilters = filters.type.length > 0 || filters.severity.length > 0 || filters.searchQuery.length > 0 || filters.timeRange !== '24h';

  return (
    <section 
      role="search" 
      aria-label="Event filtering and search"
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
        <label htmlFor="event-search" style={{
          fontSize: theme.typography.fontSize.sm,
          fontWeight: theme.typography.fontWeight.medium,
          color: theme.colors.text,
          minWidth: 'fit-content',
        }}>
          Search Events:
        </label>
        <input
          id="event-search"
          type="text"
          placeholder="Search events..."
          defaultValue={filters.searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          style={searchInputStyle}
          onFocus={(e) => {
            e.target.style.borderColor = theme.colors.primary;
          }}
          onBlur={(e) => {
            e.target.style.borderColor = theme.colors.border;
          }}
          aria-describedby="event-search-help"
        />
        
        <div 
          id="event-search-help" 
          style={{
            fontSize: theme.typography.fontSize.xs,
            color: theme.colors.textMuted,
            display: 'none'
          }}
        >
          Search event summaries, descriptions, and sources
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
        {/* Time Range Filters */}
        <fieldset style={{ border: 'none', margin: 0, padding: 0 }}>
          <legend style={{
            fontSize: theme.typography.fontSize.sm,
            fontWeight: theme.typography.fontWeight.medium,
            color: theme.colors.text,
            marginBottom: theme.spacing[2],
          }}>
            Time Range
          </legend>
          <Toolbar>
            <ToolbarGroup>
              <Button
                variant={isTimeRangeActive('1h') ? "primary" : "ghost"}
                size="sm"
                onClick={() => setTimeRange('1h')}
              >
                Last Hour ({filterCounts.hour})
              </Button>
              <Button
                variant={isTimeRangeActive('24h') ? "primary" : "ghost"}
                size="sm"
                onClick={() => setTimeRange('24h')}
              >
                Last 24h ({filterCounts.day})
              </Button>
              <Button
                variant={isTimeRangeActive('7d') ? "primary" : "ghost"}
                size="sm"
                onClick={() => setTimeRange('7d')}
              >
                Last Week ({filterCounts.week})
              </Button>
              <Button
                variant={isTimeRangeActive('30d') ? "primary" : "ghost"}
                size="sm"
                onClick={() => setTimeRange('30d')}
              >
                Last Month ({filterCounts.month})
              </Button>
              <Button
                variant={isTimeRangeActive('all') ? "primary" : "ghost"}
                size="sm"
                onClick={() => setTimeRange('all')}
              >
                All Time ({filterCounts.all})
              </Button>
            </ToolbarGroup>
          </Toolbar>
        </fieldset>

        {/* Type and Severity Filters */}
        <div style={{ display: 'flex', gap: theme.spacing[4], flexWrap: 'wrap' }}>
          <fieldset style={{ border: 'none', margin: 0, padding: 0 }}>
            <legend style={{
              fontSize: theme.typography.fontSize.sm,
              fontWeight: theme.typography.fontWeight.medium,
              color: theme.colors.text,
              marginBottom: theme.spacing[2],
            }}>
              Event Type
            </legend>
            <Toolbar>
              <ToolbarGroup>
                <Button
                  variant={isTypeActive('system') ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => toggleTypeFilter('system')}
                  style={isTypeActive('system') ? { backgroundColor: '#6366f1', color: '#ffffff' } : undefined}
                >
                  System ({filterCounts.system})
                </Button>
                <Button
                  variant={isTypeActive('application') ? "primary" : "ghost"}
                  size="sm"
                  onClick={() => toggleTypeFilter('application')}
                >
                  Application ({filterCounts.application})
                </Button>
                <Button
                  variant={isTypeActive('security') ? "danger" : "ghost"}
                  size="sm"
                  onClick={() => toggleTypeFilter('security')}
                  style={isTypeActive('security') ? { backgroundColor: '#ef4444', color: '#ffffff' } : undefined}
                >
                  Security ({filterCounts.security})
                </Button>
                <Button
                  variant={isTypeActive('performance') ? "warning" : "ghost"}
                  size="sm"
                  onClick={() => toggleTypeFilter('performance')}
                >
                  Performance ({filterCounts.performance})
                </Button>
              </ToolbarGroup>
            </Toolbar>
          </fieldset>

          <fieldset style={{ border: 'none', margin: 0, padding: 0 }}>
            <legend style={{
              fontSize: theme.typography.fontSize.sm,
              fontWeight: theme.typography.fontWeight.medium,
              color: theme.colors.text,
              marginBottom: theme.spacing[2],
            }}>
              Severity
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
                  variant={isSeverityActive('info') ? "primary" : "ghost"}
                  size="sm"
                  onClick={() => toggleSeverityFilter('info')}
                >
                  Info ({filterCounts.info})
                </Button>
                <Button
                  variant={isSeverityActive('low') ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => toggleSeverityFilter('low')}
                  style={isSeverityActive('low') ? { backgroundColor: '#10b981', color: '#ffffff' } : undefined}
                >
                  Low ({filterCounts.low})
                </Button>
              </ToolbarGroup>
            </Toolbar>
          </fieldset>
        </div>
      </div>
    </section>
  );
};