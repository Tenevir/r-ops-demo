import React, { useState, useMemo } from 'react';
import type { RuleCondition, RuleAction } from '../types';
import { useTheme } from '../theme/utils';
import { Button } from './';

interface RuleTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  conditions: Omit<RuleCondition, 'id'>[];
  actions: Omit<RuleAction, 'id'>[];
  tags: string[];
}

const RULE_TEMPLATES: RuleTemplate[] = [
  {
    id: 'critical-alert-escalation',
    name: 'Critical Alert Escalation',
    description: 'Automatically escalate critical severity events to create alerts',
    category: 'Alerting',
    icon: '🚨',
    conditions: [
      { field: 'severity', operator: 'equals', value: 'critical', logicalOperator: 'AND' }
    ],
    actions: [
      { type: 'create_alert', config: { severity: 'critical', escalateAfter: 300 } }
    ],
    tags: ['critical', 'escalation', 'alerting']
  },
  {
    id: 'database-performance-monitoring',
    name: 'Database Performance Monitoring',
    description: 'Monitor database performance issues and notify the infrastructure team',
    category: 'Performance',
    icon: '📊',
    conditions: [
      { field: 'type', operator: 'equals', value: 'performance', logicalOperator: 'AND' },
      { field: 'source', operator: 'contains', value: 'database' }
    ],
    actions: [
      { type: 'send_notification', config: { channels: ['slack'], recipients: ['infrastructure-team'] } },
      { type: 'tag_event', config: { tags: ['database', 'performance'] } }
    ],
    tags: ['database', 'performance', 'monitoring']
  },
  {
    id: 'security-incident-response',
    name: 'Security Incident Response',
    description: 'Immediate response protocol for security events',
    category: 'Security',
    icon: '🔒',
    conditions: [
      { field: 'type', operator: 'equals', value: 'security' }
    ],
    actions: [
      { type: 'create_alert', config: { severity: 'high', assignToTeam: 'security-team' } },
      { type: 'send_notification', config: { channels: ['email', 'sms'], recipients: ['security-team'] } },
      { type: 'escalate', config: { escalateAfter: 600 } }
    ],
    tags: ['security', 'incident', 'response']
  },
  {
    id: 'threshold-breach-alert',
    name: 'Threshold Breach Alert',
    description: 'Create alerts when system metrics exceed defined thresholds',
    category: 'Monitoring',
    icon: '⚠️',
    conditions: [
      { field: 'type', operator: 'equals', value: 'system', logicalOperator: 'AND' },
      { field: 'title', operator: 'contains', value: 'threshold' }
    ],
    actions: [
      { type: 'create_alert', config: { severity: 'medium' } },
      { type: 'tag_event', config: { tags: ['threshold', 'monitoring'] } }
    ],
    tags: ['threshold', 'monitoring', 'system']
  },
  {
    id: 'maintenance-window-filter',
    name: 'Maintenance Window Filter',
    description: 'Suppress alerts during scheduled maintenance windows',
    category: 'Maintenance',
    icon: '🔧',
    conditions: [
      { field: 'title', operator: 'contains', value: 'maintenance' }
    ],
    actions: [
      { type: 'tag_event', config: { tags: ['maintenance', 'suppressed'] } }
    ],
    tags: ['maintenance', 'suppression', 'scheduled']
  },
  {
    id: 'high-frequency-correlation',
    name: 'High Frequency Event Correlation',
    description: 'Detect patterns in high-frequency events and correlate them',
    category: 'Pattern Detection',
    icon: '🔍',
    conditions: [
      { field: 'type', operator: 'equals', value: 'system' }
    ],
    actions: [
      { type: 'tag_event', config: { tags: ['correlated', 'pattern'] } },
      { type: 'webhook', config: { url: '/api/correlate', method: 'POST' } }
    ],
    tags: ['correlation', 'pattern', 'analysis']
  }
];

interface RuleTemplateLibraryProps {
  onApplyTemplate: (template: RuleTemplate) => void;
  onPreviewTemplate: (template: RuleTemplate) => void;
}

export const RuleTemplateLibrary: React.FC<RuleTemplateLibraryProps> = ({
  onApplyTemplate,
  onPreviewTemplate,
}) => {
  const theme = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const categories = useMemo(() => {
    const cats = Array.from(new Set(RULE_TEMPLATES.map(t => t.category)));
    return ['all', ...cats];
  }, []);

  const filteredTemplates = useMemo(() => {
    return RULE_TEMPLATES.filter(template => {
      const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
      const matchesSearch = searchTerm === '' || 
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchTerm]);

  const templateCardStyle: React.CSSProperties = {
    padding: theme.spacing[4],
    backgroundColor: theme.colors.surfaceElevated,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.md,
    cursor: 'pointer',
    transition: `all ${theme.animation.duration.fast}`,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  };

  const filterStyle: React.CSSProperties = {
    display: 'flex',
    gap: theme.spacing[3],
    marginBottom: theme.spacing[4],
    alignItems: 'center',
    flexWrap: 'wrap',
  };

  const searchInputStyle: React.CSSProperties = {
    padding: theme.spacing[2],
    backgroundColor: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.sm,
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.sm,
    minWidth: '200px',
  };

  const categoryButtonStyle = (isActive: boolean): React.CSSProperties => ({
    padding: `${theme.spacing[1]} ${theme.spacing[3]}`,
    backgroundColor: isActive ? theme.colors.primary : theme.colors.surface,
    color: isActive ? '#000000' : theme.colors.text,
    border: `1px solid ${isActive ? theme.colors.primary : theme.colors.border}`,
    borderRadius: theme.borderRadius.sm,
    cursor: 'pointer',
    fontSize: theme.typography.fontSize.sm,
    transition: `all ${theme.animation.duration.fast}`,
  });

  return (
    <div>
      <div style={filterStyle}>
        <input
          type="text"
          placeholder="Search templates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={searchInputStyle}
        />
        
        <div style={{ display: 'flex', gap: theme.spacing[2], flexWrap: 'wrap' }}>
          {categories.map(category => (
            <button
              key={category}
              style={categoryButtonStyle(selectedCategory === category)}
              onClick={() => setSelectedCategory(category)}
              onMouseEnter={(e) => {
                if (selectedCategory !== category) {
                  e.currentTarget.style.backgroundColor = theme.colors.surfaceHover;
                }
              }}
              onMouseLeave={(e) => {
                if (selectedCategory !== category) {
                  e.currentTarget.style.backgroundColor = theme.colors.surface;
                }
              }}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: theme.spacing[4],
      }}>
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            style={templateCardStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = theme.colors.primary;
              e.currentTarget.style.boxShadow = theme.elevation.md;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = theme.colors.border;
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: theme.spacing[2],
              marginBottom: theme.spacing[3],
            }}>
              <span style={{ fontSize: theme.typography.fontSize.xl }}>
                {template.icon}
              </span>
              <div>
                <h4 style={{
                  margin: 0,
                  fontSize: theme.typography.fontSize.lg,
                  fontWeight: theme.typography.fontWeight.semibold,
                  color: theme.colors.text,
                }}>
                  {template.name}
                </h4>
                <div style={{
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.textMuted,
                  marginTop: theme.spacing[1],
                }}>
                  {template.category}
                </div>
              </div>
            </div>

            <p style={{
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.textSecondary,
              marginBottom: theme.spacing[3],
              flexGrow: 1,
            }}>
              {template.description}
            </p>

            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: theme.spacing[1],
              marginBottom: theme.spacing[3],
            }}>
              {template.tags.map(tag => (
                <span key={tag} style={{
                  padding: `${theme.spacing[0.5]} ${theme.spacing[2]}`,
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.textMuted,
                  fontSize: theme.typography.fontSize.xs,
                  borderRadius: theme.borderRadius.sm,
                  border: `1px solid ${theme.colors.border}`,
                }}>
                  {tag}
                </span>
              ))}
            </div>

            <div style={{
              display: 'flex',
              gap: theme.spacing[2],
              marginTop: 'auto',
            }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onPreviewTemplate(template)}
                style={{ flex: 1 }}
              >
                Preview
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => onApplyTemplate(template)}
                style={{ flex: 1 }}
              >
                Apply
              </Button>
            </div>

            <div style={{
              fontSize: theme.typography.fontSize.xs,
              color: theme.colors.textMuted,
              marginTop: theme.spacing[2],
              textAlign: 'center',
            }}>
              {template.conditions.length} condition{template.conditions.length !== 1 ? 's' : ''} • {' '}
              {template.actions.length} action{template.actions.length !== 1 ? 's' : ''}
            </div>
          </div>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: theme.spacing[8],
          color: theme.colors.textMuted,
        }}>
          <div style={{
            fontSize: theme.typography.fontSize.xl,
            marginBottom: theme.spacing[2],
          }}>
            🔍
          </div>
          <div style={{
            fontSize: theme.typography.fontSize.lg,
            fontWeight: theme.typography.fontWeight.medium,
            marginBottom: theme.spacing[2],
          }}>
            No Templates Found
          </div>
          <div>
            Try adjusting your search terms or category filter.
          </div>
        </div>
      )}
    </div>
  );
};