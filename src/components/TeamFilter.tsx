import React, { useRef } from 'react';
import { useTheme } from '../theme/utils';
import { Button, Toolbar, ToolbarGroup } from './';

export const TeamFilter: React.FC = () => {
  const theme = useTheme();
  const filters = { search: '', memberCount: 'all', hasOnCall: null, hasEscalation: null };
  const setFilters = () => {};
  const clearFilters = () => {};
  const teams: any[] = [];
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearchChange = (value: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      setFilters({ search: value });
    }, 300); // 300ms debounce
  };

  const toggleMemberCountFilter = (size: 'small' | 'medium' | 'large') => {
    setFilters({ 
      memberCount: filters.memberCount === size ? 'all' : size 
    });
  };

  const toggleOnCallFilter = () => {
    setFilters({ 
      hasOnCall: filters.hasOnCall === true ? null : true 
    });
  };

  const toggleEscalationFilter = () => {
    setFilters({ 
      hasEscalation: filters.hasEscalation === true ? null : true 
    });
  };

  const isMemberCountActive = (size: string) => filters.memberCount === size;
  const isOnCallActive = () => filters.hasOnCall === true;
  const isEscalationActive = () => filters.hasEscalation === true;

  const hasActiveFilters = filters.search || 
                          filters.memberCount !== 'all' || 
                          filters.hasOnCall !== null || 
                          filters.hasEscalation !== null;

  const toolbarStyle: React.CSSProperties = {
    marginBottom: theme.spacing[6],
    padding: theme.spacing[4],
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    border: `1px solid ${theme.colors.border}`,
  };

  const searchStyle: React.CSSProperties = {
    padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
    fontSize: theme.typography.fontSize.sm,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    outline: 'none',
    transition: `border-color ${theme.animation.duration.fast}`,
    width: '100%',
    maxWidth: '300px',
  };

  return (
    <Toolbar style={toolbarStyle}>
      <ToolbarGroup>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: theme.spacing[2],
        }}>
          <label htmlFor="team-search" style={{
            fontSize: theme.typography.fontSize.sm,
            fontWeight: theme.typography.fontWeight.medium,
            color: theme.colors.text,
          }}>
            Search Teams:
          </label>
          <input
            id="team-search"
            type="text"
            placeholder="Search by name, description, or member..."
            style={searchStyle}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={(e) => {
              e.target.style.borderColor = theme.colors.primary;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = theme.colors.border;
            }}
            aria-label="Search teams by name, description, or member"
          />
        </div>
      </ToolbarGroup>

      <ToolbarGroup>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: theme.spacing[1],
        }}>
          <span style={{
            fontSize: theme.typography.fontSize.sm,
            fontWeight: theme.typography.fontWeight.medium,
            color: theme.colors.text,
            marginRight: theme.spacing[2],
          }}>
            Team Size:
          </span>
          <Button
            variant={isMemberCountActive('small') ? "primary" : "ghost"}
            size="sm"
            onClick={() => toggleMemberCountFilter('small')}
            aria-label="Filter small teams (1-3 members)"
          >
            Small (1-3)
          </Button>
          <Button
            variant={isMemberCountActive('medium') ? "primary" : "ghost"}
            size="sm"
            onClick={() => toggleMemberCountFilter('medium')}
            aria-label="Filter medium teams (4-8 members)"
          >
            Medium (4-8)
          </Button>
          <Button
            variant={isMemberCountActive('large') ? "primary" : "ghost"}
            size="sm"
            onClick={() => toggleMemberCountFilter('large')}
            aria-label="Filter large teams (9+ members)"
          >
            Large (9+)
          </Button>
        </div>
      </ToolbarGroup>

      <ToolbarGroup>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: theme.spacing[2],
        }}>
          <span style={{
            fontSize: theme.typography.fontSize.sm,
            fontWeight: theme.typography.fontWeight.medium,
            color: theme.colors.text,
          }}>
            Features:
          </span>
          <Button
            variant={isOnCallActive() ? "secondary" : "ghost"}
            size="sm"
            onClick={toggleOnCallFilter}
            aria-label="Filter teams with on-call rotation"
          >
            🔄 Has On-Call
          </Button>
          <Button
            variant={isEscalationActive() ? "secondary" : "ghost"}
            size="sm"
            onClick={toggleEscalationFilter}
            aria-label="Filter teams with escalation policy"
          >
            📈 Has Escalation
          </Button>
        </div>
      </ToolbarGroup>

      {hasActiveFilters && (
        <ToolbarGroup>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            aria-label="Clear all filters"
          >
            Clear Filters
          </Button>
        </ToolbarGroup>
      )}

      <ToolbarGroup>
        <div style={{
          fontSize: theme.typography.fontSize.sm,
          color: theme.colors.textMuted,
          display: 'flex',
          alignItems: 'center',
          gap: theme.spacing[1],
        }}>
          <span>📊</span>
          <span>{teams.length} teams</span>
        </div>
      </ToolbarGroup>
    </Toolbar>
  );
};