import { Card, CardHeader, CardTitle, CardContent } from '../components';

export const Teams = () => {
  return (
    <div>
      <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Teams</h1>
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Team Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Manage team assignments, roles, and escalation procedures.</p>
          <p>
            Features: Role-based access, team hierarchies, and contact
            management.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
