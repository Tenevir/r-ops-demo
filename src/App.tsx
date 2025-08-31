import { useState } from 'react';
import { useStyles } from './hooks/useStyles';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from './components';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const styles = useStyles((theme) => ({
    container: () => ({
      minHeight: '100vh',
      padding: theme.spacing[8],
    }),

    header: () => ({
      textAlign: 'center' as const,
      marginBottom: theme.spacing[12],
    }),

    title: () => ({
      fontSize: theme.typography.fontSize['4xl'],
      fontWeight: theme.typography.fontWeight.bold,
      marginBottom: theme.spacing[4],
      color: theme.colors.text,
    }),

    subtitle: () => ({
      fontSize: theme.typography.fontSize.lg,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing[8],
    }),

    highlight: () => ({
      color: theme.colors.primary,
      fontWeight: theme.typography.fontWeight.semibold,
    }),

    status: () => ({
      display: 'inline-flex',
      alignItems: 'center',
      gap: theme.spacing[2],
      padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
      backgroundColor: theme.colors.surfaceElevated,
      border: `1px solid ${theme.colors.border}`,
      borderRadius: theme.borderRadius.lg,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textSecondary,
    }),

    statusDot: () => ({
      width: theme.spacing[2],
      height: theme.spacing[2],
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.full,
    }),

    showcase: () => ({
      maxWidth: '1200px',
      margin: '0 auto',
      display: 'grid',
      gap: theme.spacing[8],
    }),

    section: () => ({
      marginBottom: theme.spacing[8],
    }),

    sectionTitle: () => ({
      fontSize: theme.typography.fontSize['2xl'],
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text,
      marginBottom: theme.spacing[4],
    }),

    grid: () => ({
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: theme.spacing[6],
    }),

    buttonGrid: () => ({
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: theme.spacing[3],
      alignItems: 'center',
    }),
  }));

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>
          <span style={styles.highlight}>R-Ops</span> Demo
        </h1>
        <p style={styles.subtitle}>Event and Alert Management Interface</p>
        <div style={styles.status}>
          <div style={styles.statusDot}></div>
          Design System Ready
        </div>
      </div>

      <div style={styles.showcase}>
        {/* Buttons Section */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Buttons</h2>
          <div style={styles.buttonGrid}>
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="primary" size="sm">
              Small
            </Button>
            <Button variant="primary" size="lg">
              Large
            </Button>
            <Button variant="primary" disabled>
              Disabled
            </Button>
            <Button variant="primary" onClick={() => setIsModalOpen(true)}>
              Open Modal
            </Button>
          </div>
        </div>

        {/* Cards Section */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Cards</h2>
          <div style={styles.grid}>
            <Card>
              <CardHeader>
                <CardTitle>Alert Management</CardTitle>
              </CardHeader>
              <CardContent>
                Interactive alert dashboard with priority-based visual hierarchy
                and real-time status updates.
              </CardContent>
            </Card>

            <Card variant="elevated" hover>
              <CardHeader>
                <CardTitle>Event Processing</CardTitle>
              </CardHeader>
              <CardContent>
                Comprehensive event log with filtering, search, and
                event-to-alert promotion capabilities.
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardHeader>
                <CardTitle>Team Coordination</CardTitle>
              </CardHeader>
              <CardContent>
                Team management with escalation schedules, on-call rotations,
                and performance metrics.
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Toolbar Section */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Toolbars</h2>
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
          >
            <Toolbar>
              <ToolbarGroup label="Actions">
                <Button size="sm" variant="ghost">
                  New
                </Button>
                <Button size="sm" variant="ghost">
                  Edit
                </Button>
                <Button size="sm" variant="ghost">
                  Delete
                </Button>
              </ToolbarGroup>
              <ToolbarSeparator />
              <ToolbarGroup label="View">
                <Button size="sm" variant="ghost">
                  Grid
                </Button>
                <Button size="sm" variant="ghost">
                  List
                </Button>
              </ToolbarGroup>
            </Toolbar>

            <Toolbar variant="secondary" size="lg">
              <Button variant="primary">Create Alert</Button>
              <Button variant="secondary">Filter Events</Button>
              <Button variant="ghost">Export Data</Button>
            </Toolbar>
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size="md"
      >
        <ModalHeader onClose={() => setIsModalOpen(false)}>
          <h2>Design System Showcase</h2>
        </ModalHeader>
        <ModalBody>
          <p>
            This modal demonstrates the Jony Ive-inspired design system with
            clean lines, purposeful spacing, and the distinctive black/yellow
            aesthetic.
          </p>
          <p>
            All components support keyboard navigation, focus management, and
            accessibility standards.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => setIsModalOpen(false)}>
            Confirm
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

export default App;
