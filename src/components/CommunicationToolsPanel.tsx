import React, { useState } from 'react';
import type { Team, User, ContactMethod } from '../types';
import { useTheme } from '../theme/utils';
import { Button, Card, CardHeader, CardTitle, CardContent } from './';

interface CommunicationToolsPanelProps {
  team: Team;
  targetUser?: User;
  urgency?: 'low' | 'medium' | 'high' | 'critical';
}

interface MockMessage {
  id: string;
  channel: string;
  channelType: 'slack' | 'email' | 'sms' | 'webhook';
  message: string;
  timestamp: string;
  status: 'sending' | 'sent' | 'delivered' | 'failed';
  targetUser?: string;
}

export const CommunicationToolsPanel: React.FC<CommunicationToolsPanelProps> = ({ 
  team,
  targetUser,
  urgency = 'medium'
}) => {
  const theme = useTheme();
  const [selectedMethod, setSelectedMethod] = useState<ContactMethod | null>(null);
  const [message, setMessage] = useState('');
  const [isCustomMessage, setIsCustomMessage] = useState(false);
  const [sentMessages, setSentMessages] = useState<MockMessage[]>([]);
  const [isSending, setIsSending] = useState(false);

  const urgencyTemplates = {
    low: {
      slack: "Hi team! Just a heads up about a minor issue that needs attention when convenient.",
      email: "Subject: Minor Issue - No Immediate Action Required\n\nHi team,\n\nThere's a minor issue that needs attention when you have a moment. No immediate action required.",
      sms: "Minor issue detected. Please check when convenient.",
      webhook: JSON.stringify({ severity: "low", message: "Minor issue requires attention", team: team.id }, null, 2)
    },
    medium: {
      slack: "🔔 Team alert: We have a medium priority issue that needs attention within the next hour.",
      email: "Subject: Medium Priority Alert - Action Required\n\nTeam,\n\nWe have a medium priority issue that requires attention within the next hour.",
      sms: "ALERT: Medium priority issue requires attention within 1 hour.",
      webhook: JSON.stringify({ severity: "medium", message: "Medium priority issue requires attention", team: team.id }, null, 2)
    },
    high: {
      slack: "🚨 HIGH PRIORITY ALERT: Immediate attention required for critical issue affecting system performance.",
      email: "Subject: HIGH PRIORITY ALERT - Immediate Action Required\n\nTeam,\n\nImmediate attention required for critical issue affecting system performance.",
      sms: "🚨 HIGH PRIORITY: Critical issue requires immediate attention.",
      webhook: JSON.stringify({ severity: "high", message: "Critical issue requires immediate attention", team: team.id }, null, 2)
    },
    critical: {
      slack: "🆘 CRITICAL EMERGENCY: System outage in progress. ALL HANDS ON DECK. Escalating immediately.",
      email: "Subject: CRITICAL EMERGENCY - SYSTEM OUTAGE\n\nEMERGENCY ALERT\n\nSystem outage in progress. All hands on deck required immediately.",
      sms: "🆘 CRITICAL: System outage. All hands required NOW.",
      webhook: JSON.stringify({ severity: "critical", message: "System outage - all hands required", team: team.id }, null, 2)
    }
  };

  const getChannelIcon = (type: string): string => {
    switch (type) {
      case 'slack': return '💬';
      case 'email': return '📧';
      case 'sms': return '📱';
      case 'webhook': return '🔗';
      default: return '📞';
    }
  };

  const getUrgencyColor = (urgency: string): string => {
    switch (urgency) {
      case 'critical': return '#ef4444';
      case 'high': return '#f59e0b';
      case 'medium': return '#3b82f6';
      case 'low': return '#10b981';
      default: return theme.colors.textMuted;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'sent': return '#10b981';
      case 'delivered': return '#16a34a';
      case 'sending': return '#f59e0b';
      case 'failed': return '#ef4444';
      default: return theme.colors.textMuted;
    }
  };

  const handleSendMessage = async (method: ContactMethod) => {
    if (!message.trim()) return;

    setIsSending(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    const mockMessage: MockMessage = {
      id: `msg-${Date.now()}`,
      channel: method.value,
      channelType: method.type,
      message: message.trim(),
      timestamp: new Date().toISOString(),
      status: Math.random() > 0.1 ? 'sent' : 'failed', // 90% success rate
      targetUser: targetUser?.id,
    };

    setSentMessages(prev => [mockMessage, ...prev]);
    setMessage('');
    setSelectedMethod(null);
    setIsSending(false);

    // Simulate delivery confirmation after a delay
    if (mockMessage.status === 'sent') {
      setTimeout(() => {
        setSentMessages(prev => prev.map(msg => 
          msg.id === mockMessage.id ? { ...msg, status: 'delivered' } : msg
        ));
      }, 2000 + Math.random() * 3000);
    }
  };

  const handleQuickSend = async (method: ContactMethod, urgencyLevel: string) => {
    const template = urgencyTemplates[urgencyLevel as keyof typeof urgencyTemplates];
    const quickMessage = template[method.type as keyof typeof template];
    
    setIsSending(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));

    const mockMessage: MockMessage = {
      id: `msg-${Date.now()}`,
      channel: method.value,
      channelType: method.type,
      message: quickMessage,
      timestamp: new Date().toISOString(),
      status: Math.random() > 0.05 ? 'sent' : 'failed', // 95% success rate for templates
      targetUser: targetUser?.id,
    };

    setSentMessages(prev => [mockMessage, ...prev]);
    setIsSending(false);

    // Simulate delivery confirmation
    if (mockMessage.status === 'sent') {
      setTimeout(() => {
        setSentMessages(prev => prev.map(msg => 
          msg.id === mockMessage.id ? { ...msg, status: 'delivered' } : msg
        ));
      }, 1500 + Math.random() * 2500);
    }
  };

  const activeContactMethods = team.contactMethods.filter(method => method.isActive);

  const methodButtonStyle = (): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing[2],
    padding: theme.spacing[3],
    backgroundColor: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.sm,
    cursor: 'pointer',
    transition: `all ${theme.animation.duration.fast}`,
    marginBottom: theme.spacing[2],
    width: '100%',
  });

  const urgencyButtonStyle = (isSelected: boolean): React.CSSProperties => ({
    padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
    border: `1px solid ${isSelected ? getUrgencyColor(urgency) : theme.colors.border}`,
    backgroundColor: isSelected ? getUrgencyColor(urgency) : theme.colors.surface,
    color: isSelected ? '#ffffff' : theme.colors.text,
    borderRadius: theme.borderRadius.sm,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium,
    cursor: 'pointer',
    transition: `all ${theme.animation.duration.fast}`,
  });

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: selectedMethod ? '1fr 1fr' : '1fr',
      gap: theme.spacing[6],
    }}>
      {/* Communication Methods */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>
            Send Alert to {team.name}
            {targetUser && ` → ${targetUser.name}`}
          </CardTitle>
          <div style={{
            fontSize: theme.typography.fontSize.sm,
            color: theme.colors.textMuted,
            marginTop: theme.spacing[1],
          }}>
            {activeContactMethods.length} active communication channels
          </div>
        </CardHeader>

        <CardContent>
          {/* Urgency Selector */}
          <div style={{ marginBottom: theme.spacing[4] }}>
            <div style={{
              fontSize: theme.typography.fontSize.sm,
              fontWeight: theme.typography.fontWeight.medium,
              color: theme.colors.text,
              marginBottom: theme.spacing[2],
            }}>
              Alert Priority
            </div>
            <div style={{
              display: 'flex',
              gap: theme.spacing[2],
              flexWrap: 'wrap',
            }}>
              {(['low', 'medium', 'high', 'critical'] as const).map((level) => (
                <button
                  key={level}
                  style={urgencyButtonStyle(urgency === level)}
                  onClick={() => {/* urgency would be controlled by parent */}}
                >
                  {level.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Communication Methods */}
          <div style={{ marginBottom: theme.spacing[4] }}>
            <div style={{
              fontSize: theme.typography.fontSize.sm,
              fontWeight: theme.typography.fontWeight.medium,
              color: theme.colors.text,
              marginBottom: theme.spacing[2],
            }}>
              Available Channels
            </div>

            {activeContactMethods.map((method) => (
              <div key={method.id} style={methodButtonStyle()}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: theme.spacing[2],
                }}>
                  <span style={{ fontSize: theme.typography.fontSize.lg }}>
                    {getChannelIcon(method.type)}
                  </span>
                  <div>
                    <div style={{
                      fontWeight: theme.typography.fontWeight.medium,
                      color: theme.colors.text,
                      fontSize: theme.typography.fontSize.sm,
                    }}>
                      {method.value}
                    </div>
                    <div style={{
                      fontSize: theme.typography.fontSize.xs,
                      color: theme.colors.textMuted,
                      textTransform: 'uppercase',
                    }}>
                      {method.type}
                    </div>
                  </div>
                </div>
                
                <div style={{
                  display: 'flex',
                  gap: theme.spacing[2],
                }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleQuickSend(method, urgency)}
                    disabled={isSending}
                  >
                    Quick Send
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setSelectedMethod(method);
                      setMessage(urgencyTemplates[urgency][method.type] || '');
                    }}
                    disabled={isSending}
                  >
                    Customize
                  </Button>
                </div>
              </div>
            ))}

            {activeContactMethods.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: theme.spacing[4],
                color: theme.colors.textMuted,
                fontSize: theme.typography.fontSize.sm,
                fontStyle: 'italic',
              }}>
                No active communication channels configured for this team
              </div>
            )}
          </div>

          {/* Integration Status */}
          <div style={{
            padding: theme.spacing[3],
            backgroundColor: theme.colors.surface,
            borderRadius: theme.borderRadius.md,
            border: `1px solid ${theme.colors.border}`,
          }}>
            <div style={{
              fontSize: theme.typography.fontSize.sm,
              fontWeight: theme.typography.fontWeight.medium,
              color: theme.colors.text,
              marginBottom: theme.spacing[2],
            }}>
              Integration Status
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: theme.spacing[3],
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: theme.spacing[2],
              }}>
                <span>💬</span>
                <span style={{ fontSize: theme.typography.fontSize.sm }}>
                  Slack: <span style={{ color: '#10b981', fontWeight: theme.typography.fontWeight.medium }}>Connected</span>
                </span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: theme.spacing[2],
              }}>
                <span>📧</span>
                <span style={{ fontSize: theme.typography.fontSize.sm }}>
                  Email: <span style={{ color: '#10b981', fontWeight: theme.typography.fontWeight.medium }}>Connected</span>
                </span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: theme.spacing[2],
              }}>
                <span>📱</span>
                <span style={{ fontSize: theme.typography.fontSize.sm }}>
                  PagerDuty: <span style={{ color: '#f59e0b', fontWeight: theme.typography.fontWeight.medium }}>Mock Mode</span>
                </span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: theme.spacing[2],
              }}>
                <span>🔗</span>
                <span style={{ fontSize: theme.typography.fontSize.sm }}>
                  Webhooks: <span style={{ color: '#10b981', fontWeight: theme.typography.fontWeight.medium }}>Ready</span>
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Custom Message Panel */}
      {selectedMethod && (
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>
              Send to {selectedMethod.value}
            </CardTitle>
            <div style={{
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.textMuted,
              marginTop: theme.spacing[1],
            }}>
              {getChannelIcon(selectedMethod.type)} {selectedMethod.type.toUpperCase()}
            </div>
          </CardHeader>

          <CardContent>
            <div style={{ marginBottom: theme.spacing[4] }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: theme.spacing[2],
              }}>
                <label style={{
                  fontSize: theme.typography.fontSize.sm,
                  fontWeight: theme.typography.fontWeight.medium,
                  color: theme.colors.text,
                }}>
                  Message Content
                </label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsCustomMessage(!isCustomMessage);
                    if (!isCustomMessage) {
                      setMessage(urgencyTemplates[urgency][selectedMethod.type] || '');
                    }
                  }}
                >
                  {isCustomMessage ? 'Use Template' : 'Custom Message'}
                </Button>
              </div>

              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={`Enter your ${selectedMethod.type} message...`}
                rows={selectedMethod.type === 'webhook' ? 8 : 4}
                style={{
                  width: '100%',
                  padding: theme.spacing[3],
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: theme.borderRadius.sm,
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.text,
                  fontSize: theme.typography.fontSize.sm,
                  fontFamily: selectedMethod.type === 'webhook' ? 'monospace' : 'inherit',
                  resize: 'vertical',
                  minHeight: '100px',
                }}
              />
            </div>

            {/* Target Selection */}
            {targetUser && (
              <div style={{
                padding: theme.spacing[3],
                backgroundColor: theme.colors.surface,
                borderRadius: theme.borderRadius.sm,
                border: `1px solid ${theme.colors.border}`,
                marginBottom: theme.spacing[4],
              }}>
                <div style={{
                  fontSize: theme.typography.fontSize.sm,
                  fontWeight: theme.typography.fontWeight.medium,
                  color: theme.colors.text,
                  marginBottom: theme.spacing[1],
                }}>
                  Target User
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: theme.spacing[2],
                }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: theme.colors.primary,
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: theme.typography.fontSize.xs,
                    fontWeight: theme.typography.fontWeight.bold,
                  }}>
                    {targetUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <span style={{ fontSize: theme.typography.fontSize.sm }}>
                    {targetUser.name} ({targetUser.email})
                  </span>
                </div>
              </div>
            )}

            {/* Send Actions */}
            <div style={{
              display: 'flex',
              gap: theme.spacing[2],
              justifyContent: 'flex-end',
            }}>
              <Button
                variant="ghost"
                onClick={() => {
                  setSelectedMethod(null);
                  setMessage('');
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => handleSendMessage(selectedMethod)}
                disabled={!message.trim() || isSending}
                loading={isSending}
              >
                {isSending ? 'Sending...' : 'Send Message'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Message History */}
      {sentMessages.length > 0 && (
        <Card variant="elevated" style={{ gridColumn: selectedMethod ? '1 / -1' : '1' }}>
          <CardHeader>
            <CardTitle>Recent Communications</CardTitle>
            <div style={{
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.textMuted,
              marginTop: theme.spacing[1],
            }}>
              {sentMessages.length} messages sent in the last session
            </div>
          </CardHeader>

          <CardContent>
            <div style={{
              maxHeight: '300px',
              overflowY: 'auto',
            }}>
              {sentMessages.map((msg) => (
                <div key={msg.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: theme.spacing[3],
                  padding: theme.spacing[3],
                  backgroundColor: theme.colors.surface,
                  borderRadius: theme.borderRadius.sm,
                  border: `1px solid ${theme.colors.border}`,
                  marginBottom: theme.spacing[2],
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: theme.spacing[2],
                      marginBottom: theme.spacing[1],
                    }}>
                      <span>{getChannelIcon(msg.channelType)}</span>
                      <span style={{
                        fontSize: theme.typography.fontSize.sm,
                        fontWeight: theme.typography.fontWeight.medium,
                        color: theme.colors.text,
                      }}>
                        {msg.channel}
                      </span>
                      <span style={{
                        fontSize: theme.typography.fontSize.xs,
                        color: theme.colors.textMuted,
                      }}>
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div style={{
                      fontSize: theme.typography.fontSize.sm,
                      color: theme.colors.textSecondary,
                      lineHeight: theme.typography.lineHeight.relaxed,
                      fontFamily: msg.channelType === 'webhook' ? 'monospace' : 'inherit',
                    }}>
                      {msg.message.length > 150 ? 
                        msg.message.substring(0, 150) + '...' : 
                        msg.message
                      }
                    </div>
                  </div>
                  
                  <div style={{
                    padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
                    borderRadius: theme.borderRadius.sm,
                    fontSize: theme.typography.fontSize.xs,
                    fontWeight: theme.typography.fontWeight.medium,
                    backgroundColor: getStatusColor(msg.status),
                    color: '#ffffff',
                    textTransform: 'uppercase',
                  }}>
                    {msg.status}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};