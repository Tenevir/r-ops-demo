import React, { useState, useCallback } from 'react';
import {
  Button,
  RuleBuilder,
  RuleTestPanel,
  RuleAnalytics,
  RuleTemplateLibrary,
  RuleList,
  RuleAuditHistory,
  RulePerformanceMetrics,
  ABTestManager,
  AlertRuleLinkage,
  ScreenReaderAnnouncement,
} from '../components';
import { useTheme } from '../theme/utils';
import type { Rule, RuleCondition, RuleAction } from '../types';
import { dataStore } from '../data';

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

export const RulesEngine = () => {
  const theme = useTheme();
  const [rules, setRules] = useState<Rule[]>(() => dataStore.getRules());
  const [selectedRule, setSelectedRule] = useState<Rule | null>(null);
  const [activeView, setActiveView] = useState<
    | 'list'
    | 'builder'
    | 'testing'
    | 'analytics'
    | 'templates'
    | 'audit'
    | 'performance'
    | 'abtest'
    | 'linkage'
  >('list');
  const [announcement, setAnnouncement] = useState('');
  const [editingRule, setEditingRule] = useState<Rule | null>(null);

  const pageHeaderStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing[6],
    paddingBottom: theme.spacing[4],
    borderBottom: `1px solid ${theme.colors.border}`,
  };

  const titleStyle: React.CSSProperties = {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    margin: 0,
  };

  const tabStyle = (isActive: boolean): React.CSSProperties => ({
    padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
    backgroundColor: isActive ? theme.colors.primary : 'transparent',
    color: isActive ? '#000000' : theme.colors.text,
    border: `1px solid ${isActive ? theme.colors.primary : theme.colors.border}`,
    borderRadius: theme.borderRadius.md,
    cursor: 'pointer',
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    transition: `all ${theme.animation.duration.fast}`,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing[2],
  });

  const handleCreateRule = useCallback(() => {
    const newRule: Rule = {
      id: `rule-${Date.now()}`,
      name: 'New Rule',
      description: 'Describe what this rule does',
      isActive: true,
      conditions: [],
      actions: [],
      priority: 1,
      tags: [],
      createdBy: 'current-user',
      lastModifiedBy: 'current-user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      statistics: {
        timesTriggered: 0,
        alertsCreated: 0,
        averageExecutionTime: 0,
        successRate: 100,
        evaluationCount: 0,
        falsePosiveRate: 0,
        performanceImpactScore: 100,
      },
    };

    setEditingRule(newRule);
    setSelectedRule(newRule);
    setActiveView('builder');
  }, []);

  const handleEditRule = useCallback((rule: Rule) => {
    setEditingRule({ ...rule });
    setSelectedRule(rule);
    setActiveView('builder');
  }, []);

  const handleSaveRule = useCallback(() => {
    if (!editingRule) return;

    if (rules.some((r) => r.id === editingRule.id)) {
      // Update existing rule
      const updatedRule = dataStore.updateRule(editingRule.id, editingRule);
      if (updatedRule) {
        setRules((prev) =>
          prev.map((r) => (r.id === editingRule.id ? updatedRule : r))
        );
        setAnnouncement(`Rule "${editingRule.name}" updated successfully`);
      }
    } else {
      // Create new rule
      const newRule = dataStore.createRule(editingRule);
      setRules((prev) => [...prev, newRule]);
      setAnnouncement(`Rule "${editingRule.name}" created successfully`);
    }

    setEditingRule(null);
    setActiveView('list');
  }, [editingRule, rules]);

  const handleCancelEdit = useCallback(() => {
    setEditingRule(null);
    setActiveView('list');
  }, []);

  const handleDeleteRule = useCallback(
    (ruleId: string) => {
      if (window.confirm('Are you sure you want to delete this rule?')) {
        const success = dataStore.deleteRule(ruleId);
        if (success) {
          setRules((prev) => prev.filter((r) => r.id !== ruleId));
          setAnnouncement('Rule deleted successfully');
          if (selectedRule?.id === ruleId) {
            setSelectedRule(null);
          }
        }
      }
    },
    [selectedRule]
  );

  const handleToggleRule = useCallback(
    (ruleId: string) => {
      const rule = rules.find((r) => r.id === ruleId);
      if (rule) {
        const updatedRule = { ...rule, isActive: !rule.isActive };
        const result = dataStore.updateRule(ruleId, updatedRule);
        if (result) {
          setRules((prev) => prev.map((r) => (r.id === ruleId ? result : r)));
          setAnnouncement(
            `Rule "${rule.name}" ${result.isActive ? 'activated' : 'deactivated'}`
          );
        }
      }
    },
    [rules]
  );

  const handleApplyTemplate = useCallback((template: RuleTemplate) => {
    const newRule: Rule = {
      id: `rule-${Date.now()}`,
      name: template.name,
      description: template.description,
      isActive: true,
      conditions: template.conditions.map((condition, index) => ({
        ...condition,
        id: `condition-${Date.now()}-${index}`,
      })),
      actions: template.actions.map((action, index) => ({
        ...action,
        id: `action-${Date.now()}-${index}`,
      })),
      priority: 1,
      tags: template.tags,
      createdBy: 'current-user',
      lastModifiedBy: 'current-user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      statistics: {
        timesTriggered: 0,
        alertsCreated: 0,
        averageExecutionTime: 0,
        successRate: 100,
        evaluationCount: 0,
        falsePosiveRate: 0,
        performanceImpactScore: 100,
      },
    };

    setEditingRule(newRule);
    setSelectedRule(newRule);
    setActiveView('builder');
    setAnnouncement(`Applied template: ${template.name}`);
  }, []);

  const handlePreviewTemplate = useCallback((template: RuleTemplate) => {
    setAnnouncement(`Preview: ${template.name} - ${template.description}`);
  }, []);

  const handleNavigateToAlert = useCallback((alertId: string) => {
    // In a real app, this would navigate to the alert screen
    console.log('Navigate to alert:', alertId);
    setAnnouncement(`Navigating to alert: ${alertId}`);
  }, []);

  const handleTestResult = useCallback(
    (
      passed: boolean,
      details: {
        conditionResults: Array<{
          condition: string;
          passed: boolean;
          actualValue: string | number | boolean;
          expectedValue: string | number | boolean;
        }>;
        actionsExecuted: string[];
        executionTime: number;
      }
    ) => {
      setAnnouncement(
        `Rule test ${passed ? 'passed' : 'failed'} - execution took ${details.executionTime}ms`
      );
    },
    []
  );

  const renderView = () => {
    switch (activeView) {
      case 'builder':
        return (
          <RuleBuilder
            rule={editingRule}
            onRuleChange={setEditingRule}
            onSave={handleSaveRule}
            onCancel={handleCancelEdit}
          />
        );

      case 'testing':
        return (
          <RuleTestPanel rule={selectedRule} onTestResult={handleTestResult} />
        );

      case 'analytics':
        return <RuleAnalytics rules={rules} selectedRule={selectedRule} />;

      case 'templates':
        return (
          <RuleTemplateLibrary
            onApplyTemplate={handleApplyTemplate}
            onPreviewTemplate={handlePreviewTemplate}
          />
        );

      case 'audit':
        return <RuleAuditHistory rule={selectedRule} />;

      case 'performance':
        return (
          <RulePerformanceMetrics rules={rules} selectedRule={selectedRule} />
        );

      case 'abtest':
        return <ABTestManager rules={rules} selectedRule={selectedRule} />;

      case 'linkage':
        return (
          <AlertRuleLinkage
            rule={selectedRule}
            onNavigateToAlert={(alertId) => {
              // In a real app, this would navigate to the alert screen
              console.log('Navigate to alert:', alertId);
              setAnnouncement(`Navigating to alert: ${alertId}`);
            }}
            onNavigateToRule={(ruleId) => {
              // Find and select the rule
              const rule = rules.find((r) => r.id === ruleId);
              if (rule) {
                setSelectedRule(rule);
                setAnnouncement(`Navigated to rule: ${rule.name}`);
              }
            }}
          />
        );

      case 'list':
      default:
        return (
          <RuleList
            rules={rules}
            selectedRule={selectedRule}
            onSelectRule={setSelectedRule}
            onCreateRule={handleCreateRule}
            onEditRule={handleEditRule}
            onDeleteRule={handleDeleteRule}
            onToggleRule={handleToggleRule}
            onNavigateToAlert={handleNavigateToAlert}
          />
        );
    }
  };

  return (
    <div>
      <ScreenReaderAnnouncement message={announcement} />

      <header style={pageHeaderStyle}>
        <h1 style={titleStyle}>Rules Engine</h1>
        <div style={{ display: 'flex', gap: theme.spacing[2] }}>
          {activeView !== 'list' && (
            <Button
              variant="ghost"
              onClick={() => {
                setActiveView('list');
                setEditingRule(null);
              }}
            >
              ← Back to Rules
            </Button>
          )}
        </div>
      </header>

      <div
        style={{
          display: 'flex',
          gap: theme.spacing[3],
          marginBottom: theme.spacing[6],
        }}
      >
        <div
          style={tabStyle(activeView === 'list')}
          onClick={() => setActiveView('list')}
          onMouseEnter={(e) => {
            if (activeView !== 'list') {
              e.currentTarget.style.backgroundColor = theme.colors.surfaceHover;
            }
          }}
          onMouseLeave={(e) => {
            if (activeView !== 'list') {
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
        >
          📝 Rules
        </div>

        <div
          style={tabStyle(activeView === 'templates')}
          onClick={() => setActiveView('templates')}
          onMouseEnter={(e) => {
            if (activeView !== 'templates') {
              e.currentTarget.style.backgroundColor = theme.colors.surfaceHover;
            }
          }}
          onMouseLeave={(e) => {
            if (activeView !== 'templates') {
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
        >
          📚 Templates
        </div>

        {selectedRule && (
          <>
            <div
              style={tabStyle(activeView === 'testing')}
              onClick={() => setActiveView('testing')}
              onMouseEnter={(e) => {
                if (activeView !== 'testing') {
                  e.currentTarget.style.backgroundColor =
                    theme.colors.surfaceHover;
                }
              }}
              onMouseLeave={(e) => {
                if (activeView !== 'testing') {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              🧪 Test Rule
            </div>
          </>
        )}

        <div
          style={tabStyle(activeView === 'analytics')}
          onClick={() => setActiveView('analytics')}
          onMouseEnter={(e) => {
            if (activeView !== 'analytics') {
              e.currentTarget.style.backgroundColor = theme.colors.surfaceHover;
            }
          }}
          onMouseLeave={(e) => {
            if (activeView !== 'analytics') {
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
        >
          📊 Analytics
        </div>

        <div
          style={tabStyle(activeView === 'performance')}
          onClick={() => setActiveView('performance')}
          onMouseEnter={(e) => {
            if (activeView !== 'performance') {
              e.currentTarget.style.backgroundColor = theme.colors.surfaceHover;
            }
          }}
          onMouseLeave={(e) => {
            if (activeView !== 'performance') {
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
        >
          ⚡ Performance
        </div>

        {selectedRule && (
          <>
            <div
              style={tabStyle(activeView === 'audit')}
              onClick={() => setActiveView('audit')}
              onMouseEnter={(e) => {
                if (activeView !== 'audit') {
                  e.currentTarget.style.backgroundColor =
                    theme.colors.surfaceHover;
                }
              }}
              onMouseLeave={(e) => {
                if (activeView !== 'audit') {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              📋 Audit History
            </div>

            <div
              style={tabStyle(activeView === 'abtest')}
              onClick={() => setActiveView('abtest')}
              onMouseEnter={(e) => {
                if (activeView !== 'abtest') {
                  e.currentTarget.style.backgroundColor =
                    theme.colors.surfaceHover;
                }
              }}
              onMouseLeave={(e) => {
                if (activeView !== 'abtest') {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              🧪 A/B Tests
            </div>

            <div
              style={tabStyle(activeView === 'linkage')}
              onClick={() => setActiveView('linkage')}
              onMouseEnter={(e) => {
                if (activeView !== 'linkage') {
                  e.currentTarget.style.backgroundColor =
                    theme.colors.surfaceHover;
                }
              }}
              onMouseLeave={(e) => {
                if (activeView !== 'linkage') {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              🔗 Alert Links
            </div>
          </>
        )}
      </div>

      <main>{renderView()}</main>
    </div>
  );
};
