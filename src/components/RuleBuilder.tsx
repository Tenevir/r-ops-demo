import React, { useState, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import {
  CSS,
} from '@dnd-kit/utilities';
import type { Rule, RuleCondition, RuleAction } from '../types';
import { useTheme } from '../theme/utils';
import { Button } from './Button';

interface RuleBuilderProps {
  rule: Rule | null;
  onRuleChange: (rule: Rule) => void;
  onSave: () => void;
  onCancel: () => void;
}

interface DraggableItem {
  id: string;
  type: 'condition' | 'action';
  data: RuleCondition | RuleAction;
}

interface ComponentPaletteItem {
  id: string;
  type: 'condition' | 'action';
  label: string;
  icon: string;
}

const COMPONENT_PALETTE: ComponentPaletteItem[] = [
  { id: 'condition-equals', type: 'condition', label: 'Equals', icon: '=' },
  { id: 'condition-contains', type: 'condition', label: 'Contains', icon: '⊃' },
  { id: 'condition-greater', type: 'condition', label: 'Greater Than', icon: '>' },
  { id: 'condition-less', type: 'condition', label: 'Less Than', icon: '<' },
  { id: 'condition-regex', type: 'condition', label: 'Regex Match', icon: '.*' },
  { id: 'action-alert', type: 'action', label: 'Create Alert', icon: '🚨' },
  { id: 'action-notify', type: 'action', label: 'Send Notification', icon: '📧' },
  { id: 'action-escalate', type: 'action', label: 'Escalate', icon: '⬆️' },
  { id: 'action-tag', type: 'action', label: 'Tag Event', icon: '🏷️' },
  { id: 'action-webhook', type: 'action', label: 'Webhook', icon: '🔗' },
];

const SortableRuleItem: React.FC<{
  item: DraggableItem;
  onEdit: (item: DraggableItem) => void;
  onDelete: (id: string) => void;
}> = ({ item, onEdit, onDelete }) => {
  const theme = useTheme();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const itemStyle: React.CSSProperties = {
    padding: theme.spacing[3],
    margin: theme.spacing[2],
    backgroundColor: item.type === 'condition' ? '#1e40af' : '#7c3aed',
    borderRadius: theme.borderRadius.md,
    color: '#ffffff',
    cursor: 'grab',
    userSelect: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: '60px',
    boxShadow: theme.elevation.md,
  };

  const getDisplayText = () => {
    if (item.type === 'condition') {
      const condition = item.data as RuleCondition;
      return `${condition.field || 'field'} ${condition.operator} ${condition.value || 'value'}`;
    } else {
      const action = item.data as RuleAction;
      return `${action.type}: ${JSON.stringify(action.config).substring(0, 50)}...`;
    }
  };

  return (
    <div ref={setNodeRef} style={{ ...itemStyle, ...style }} {...attributes} {...listeners}>
      <div>
        <div style={{ fontWeight: 'bold', marginBottom: theme.spacing[1] }}>
          {item.type === 'condition' ? 'IF' : 'THEN'}: {getDisplayText()}
        </div>
      </div>
      <div style={{ display: 'flex', gap: theme.spacing[2] }}>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(item);
          }}
          style={{ color: '#ffffff', padding: theme.spacing[1] }}
        >
          ✏️
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(item.id);
          }}
          style={{ color: '#ffffff', padding: theme.spacing[1] }}
        >
          🗑️
        </Button>
      </div>
    </div>
  );
};

const ComponentPalette: React.FC<{
  onAddComponent: (component: ComponentPaletteItem) => void;
}> = ({ onAddComponent }) => {
  const theme = useTheme();

  const paletteStyle: React.CSSProperties = {
    backgroundColor: theme.colors.surfaceElevated,
    padding: theme.spacing[4],
    borderRadius: theme.borderRadius.md,
    border: `1px solid ${theme.colors.border}`,
  };

  const componentStyle: React.CSSProperties = {
    padding: theme.spacing[3],
    margin: theme.spacing[1],
    backgroundColor: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.sm,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing[2],
    transition: `all ${theme.animation.duration.fast}`,
  };

  return (
    <div style={paletteStyle}>
      <h3 style={{ 
        margin: `0 0 ${theme.spacing[3]} 0`, 
        color: theme.colors.text,
        fontSize: theme.typography.fontSize.lg
      }}>
        Components
      </h3>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: theme.spacing[2],
      }}>
        {COMPONENT_PALETTE.map((component) => (
          <div
            key={component.id}
            style={componentStyle}
            onClick={() => onAddComponent(component)}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.surfaceHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.surface;
            }}
          >
            <span style={{ fontSize: theme.typography.fontSize.lg }}>{component.icon}</span>
            <span style={{ 
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.text
            }}>
              {component.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const RuleBuilder: React.FC<RuleBuilderProps> = ({ 
  rule, 
  onRuleChange, 
  onSave, 
  onCancel 
}) => {
  const theme = useTheme();
  const [activeId, setActiveId] = useState<string | null>(null);
  // const [editingItem, setEditingItem] = useState<DraggableItem | null>(null);
  const [ruleItems, setRuleItems] = useState<DraggableItem[]>(() => {
    if (!rule) return [];
    
    const items: DraggableItem[] = [];
    
    rule.conditions.forEach((condition) => {
      items.push({
        id: `condition-${condition.id}`,
        type: 'condition',
        data: condition,
      });
    });
    
    rule.actions.forEach((action) => {
      items.push({
        id: `action-${action.id}`,
        type: 'action',
        data: action,
      });
    });
    
    return items;
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const updateRuleFromItems = useCallback((items: DraggableItem[]) => {
    if (!rule) return;

    const conditions: RuleCondition[] = [];
    const actions: RuleAction[] = [];

    items.forEach(item => {
      if (item.type === 'condition') {
        conditions.push(item.data as RuleCondition);
      } else {
        actions.push(item.data as RuleAction);
      }
    });

    const updatedRule: Rule = {
      ...rule,
      conditions,
      actions,
      updatedAt: new Date().toISOString(),
    };

    onRuleChange(updatedRule);
  }, [rule, onRuleChange]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setRuleItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const newItems = arrayMove(items, oldIndex, newIndex);
        updateRuleFromItems(newItems);
        return newItems;
      });
    }

    setActiveId(null);
  };

  const handleAddComponent = useCallback((component: ComponentPaletteItem) => {
    const newId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    let newItem: DraggableItem;
    
    if (component.type === 'condition') {
      const newCondition: RuleCondition = {
        id: newId,
        field: 'severity',
        operator: component.id.includes('equals') ? 'equals' : 
                 component.id.includes('contains') ? 'contains' :
                 component.id.includes('greater') ? 'greater_than' :
                 component.id.includes('less') ? 'less_than' : 'regex',
        value: '',
        logicalOperator: 'AND',
      };
      
      newItem = {
        id: `condition-${newId}`,
        type: 'condition',
        data: newCondition,
      };
    } else {
      const newAction: RuleAction = {
        id: newId,
        type: component.id.includes('alert') ? 'create_alert' :
              component.id.includes('notify') ? 'send_notification' :
              component.id.includes('escalate') ? 'escalate' :
              component.id.includes('tag') ? 'tag_event' : 'webhook',
        config: {},
      };
      
      newItem = {
        id: `action-${newId}`,
        type: 'action',
        data: newAction,
      };
    }

    setRuleItems(prev => {
      const newItems = [...prev, newItem];
      updateRuleFromItems(newItems);
      return newItems;
    });
  }, [updateRuleFromItems]);


  const handleEditItem = (_item: DraggableItem) => {
    // setEditingItem(item);
  };

  const handleDeleteItem = (id: string) => {
    setRuleItems(prev => {
      const newItems = prev.filter(item => item.id !== id);
      updateRuleFromItems(newItems);
      return newItems;
    });
  };

  const canvasStyle: React.CSSProperties = {
    minHeight: '400px',
    backgroundColor: theme.colors.surface,
    border: `2px dashed ${theme.colors.border}`,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing[4],
    margin: `${theme.spacing[4]} 0`,
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing[4],
  };

  if (!rule) {
    return (
      <div style={{ textAlign: 'center', padding: theme.spacing[8] }}>
        <p style={{ color: theme.colors.textMuted }}>No rule selected</p>
      </div>
    );
  }

  return (
    <div>
      <div style={headerStyle}>
        <div>
          <h2 style={{ 
            margin: 0, 
            color: theme.colors.text,
            fontSize: theme.typography.fontSize.xl
          }}>
            Rule Builder: {rule.name}
          </h2>
          <p style={{ 
            margin: `${theme.spacing[2]} 0 0 0`, 
            color: theme.colors.textMuted 
          }}>
            {rule.description}
          </p>
        </div>
        <div style={{ display: 'flex', gap: theme.spacing[2] }}>
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="primary" onClick={onSave}>
            Save Rule
          </Button>
        </div>
      </div>

      <ComponentPalette onAddComponent={handleAddComponent} />

      <div style={canvasStyle}>
        <h3 style={{ 
          margin: `0 0 ${theme.spacing[4]} 0`, 
          color: theme.colors.text 
        }}>
          Rule Flow
        </h3>
        
        {ruleItems.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: theme.spacing[8], 
            color: theme.colors.textMuted 
          }}>
            Drag components from above to build your rule
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={ruleItems.map(item => item.id)} 
              strategy={verticalListSortingStrategy}
            >
              {ruleItems.map((item) => (
                <SortableRuleItem
                  key={item.id}
                  item={item}
                  onEdit={handleEditItem}
                  onDelete={handleDeleteItem}
                />
              ))}
            </SortableContext>
            
            <DragOverlay>
              {activeId ? (
                <div style={{
                  padding: theme.spacing[3],
                  backgroundColor: '#1e40af',
                  borderRadius: theme.borderRadius.md,
                  color: '#ffffff',
                  boxShadow: theme.elevation.lg,
                }}>
                  Dragging...
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>
    </div>
  );
};