# R-Ops Design System

A minimalist design system inspired by Jony Ive principles, featuring a distinctive black and yellow color palette for maximum contrast and accessibility.

## Philosophy

- **Simplicity**: Clean lines, purposeful spacing, unobtrusive visuals
- **Functionality**: Every element serves a clear purpose
- **Accessibility**: WCAG 2.1 AA compliant with high contrast ratios
- **Consistency**: Systematic approach to spacing, typography, and color

## Components

### Button

Interactive button component with multiple variants and sizes.

```tsx
import { Button } from './components';

<Button variant="primary" size="base">
  Primary Action
</Button>

<Button variant="secondary" disabled>
  Secondary Action
</Button>

<Button variant="ghost" loading>
  Ghost Button
</Button>
```

**Props:**

- `variant`: `'primary' | 'secondary' | 'ghost' | 'danger'`
- `size`: `'sm' | 'base' | 'lg'`
- `fullWidth`: `boolean`
- `loading`: `boolean`

### Card

Container component for grouping related content.

```tsx
import { Card, CardHeader, CardTitle, CardContent } from './components';

<Card variant="elevated" hover>
  <CardHeader>
    <CardTitle>Alert Management</CardTitle>
  </CardHeader>
  <CardContent>
    Interactive alert dashboard with priority-based visual hierarchy.
  </CardContent>
</Card>;
```

**Props:**

- `variant`: `'default' | 'elevated' | 'outlined' | 'ghost'`
- `hover`: `boolean` - Adds hover effects
- `padding`: Spacing token key

### Modal

Accessible modal dialog with focus management and keyboard navigation.

```tsx
import { Modal, ModalHeader, ModalBody, ModalFooter } from './components';

<Modal isOpen={isOpen} onClose={handleClose} size="md">
  <ModalHeader onClose={handleClose}>
    <h2>Dialog Title</h2>
  </ModalHeader>
  <ModalBody>
    <p>Modal content goes here.</p>
  </ModalBody>
  <ModalFooter>
    <Button variant="ghost" onClick={handleClose}>
      Cancel
    </Button>
    <Button variant="primary" onClick={handleSubmit}>
      Confirm
    </Button>
  </ModalFooter>
</Modal>;
```

**Props:**

- `isOpen`: `boolean`
- `onClose`: `() => void`
- `size`: `'sm' | 'md' | 'lg' | 'xl' | 'full'`
- `closeOnOverlayClick`: `boolean`
- `closeOnEscape`: `boolean`

### Toolbar

Flexible toolbar component for grouping actions and controls.

```tsx
import { Toolbar, ToolbarGroup, ToolbarSeparator } from './components';

<Toolbar variant="primary">
  <ToolbarGroup label="Actions">
    <Button size="sm" variant="ghost">
      New
    </Button>
    <Button size="sm" variant="ghost">
      Edit
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
</Toolbar>;
```

**Props:**

- `variant`: `'primary' | 'secondary' | 'ghost'`
- `size`: `'sm' | 'md' | 'lg'`
- `orientation`: `'horizontal' | 'vertical'`

## Theme Usage

Access theme tokens through the useTheme hook:

```tsx
import { useTheme } from '../theme/utils';

function MyComponent() {
  const theme = useTheme();

  const style = {
    backgroundColor: theme.colors.surfaceElevated,
    padding: theme.spacing[4],
    borderRadius: theme.borderRadius.lg,
  };

  return <div style={style}>Content</div>;
}
```

## Design Tokens

### Colors

- **Primary**: `#facc15` (Yellow 400) - Call-to-action elements
- **Surface**: `#000000` - Main background
- **Surface Elevated**: `#1a1a1a` - Cards, modals, elevated content
- **Text**: `#ffffff` - Primary text color
- **Text Secondary**: `#e8e8e8` - Secondary text
- **Border**: `#3d3d3d` - Element borders

### Typography

- **Font Family**: System font stack for optimal performance
- **Sizes**: Harmonious scale from `xs` (12px) to `5xl` (48px)
- **Weights**: `normal`, `medium`, `semibold`, `bold`

### Spacing

- **Base Grid**: 8px grid system
- **Scale**: `0.5` (2px) to `64` (256px)
- **Component Specific**: Pre-defined spacing for common patterns

### Elevation

- **Shadows**: Subtle depth with purpose
- **Focus Ring**: Yellow glow for accessibility
- **Hover Effects**: Subtle lift animations

## Accessibility Features

- **Focus Management**: Visible focus indicators, keyboard navigation
- **ARIA Support**: Proper roles, labels, and state attributes
- **Color Contrast**: WCAG 2.1 AA compliant contrast ratios
- **Keyboard Navigation**: Full keyboard support for all interactions
- **Screen Reader Support**: Semantic HTML and descriptive labels

## Testing

Components are designed to be testable:

```tsx
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '../theme/ThemeProvider';
import { Button } from './Button';

test('button renders with correct variant', () => {
  render(
    <ThemeProvider>
      <Button variant="primary">Click me</Button>
    </ThemeProvider>
  );

  const button = screen.getByRole('button', { name: /click me/i });
  expect(button).toBeInTheDocument();
});
```

## Best Practices

1. **Always wrap your app with ThemeProvider**
2. **Use semantic HTML elements as the foundation**
3. **Leverage design tokens instead of hardcoded values**
4. **Test keyboard navigation and screen reader compatibility**
5. **Follow the established spacing and elevation patterns**
6. **Maintain high contrast for accessibility**
