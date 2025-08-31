import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../theme/utils';
import { Button, Card, CardHeader, CardTitle, CardContent } from './';

export const LoginForm = () => {
  const { login, isLoading } = useAuth();
  const theme = useTheme();
  const [credentials, setCredentials] = useState({
    email: 'admin@company.com',
    password: 'demo123'
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const success = await login(credentials);
    if (!success) {
      setError('Invalid credentials. Use admin@company.com / demo123');
    }
  };

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    padding: theme.spacing[4],
  };

  const formStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '400px',
  };

  const inputGroupStyle: React.CSSProperties = {
    marginBottom: theme.spacing[4],
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing[2],
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: theme.spacing[3],
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.md,
    transition: `border-color ${theme.animation.duration.fast} ${theme.animation.easing.easeOut}`,
  };

  const errorStyle: React.CSSProperties = {
    color: '#ef4444',
    fontSize: theme.typography.fontSize.sm,
    marginTop: theme.spacing[2],
  };

  const demoInfoStyle: React.CSSProperties = {
    marginTop: theme.spacing[4],
    padding: theme.spacing[3],
    backgroundColor: theme.colors.primary + '20',
    border: `1px solid ${theme.colors.primary}`,
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text,
  };

  return (
    <div style={containerStyle}>
      <div style={formStyle}>
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: theme.spacing[3] 
              }}>
                <span style={{ 
                  fontSize: theme.typography.fontSize['2xl'],
                  color: theme.colors.primary 
                }}>
                  🚨
                </span>
                R-Ops Login
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div style={inputGroupStyle}>
                <label style={labelStyle}>Email</label>
                <input
                  type="email"
                  value={credentials.email}
                  onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                  style={inputStyle}
                  required
                />
              </div>

              <div style={inputGroupStyle}>
                <label style={labelStyle}>Password</label>
                <input
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  style={inputStyle}
                  required
                />
              </div>

              {error && <div style={errorStyle}>{error}</div>}

              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={isLoading}
                style={{ marginTop: theme.spacing[4] }}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div style={demoInfoStyle}>
              <strong>Demo Credentials:</strong><br />
              Email: admin@company.com<br />
              Password: demo123
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};