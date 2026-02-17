# Ridit Frontend - Design System Reference

## Quick CSS Variable Reference

All pages use these CSS variables defined in `:root`:

```css
:root {
  /* Primary Colors */
  --primary: #667eea;           /* Primary action color */
  --primary-dark: #5568d3;      /* Darker variant for borders */
  --secondary: #764ba2;          /* Secondary/gradient color */
  
  /* Semantic Colors */
  --success: #27ae60;            /* Success/positive actions */
  --warning: #f39c12;            /* Warning/attention needed */
  --danger: #e74c3c;             /* Danger/destructive actions */
  
  /* Neutral Colors */
  --light: #f8f9fa;              /* Light backgrounds */
  --border: #e8e8e8;             /* Border color */
  --text-dark: #2c3e50;          /* Primary text color */
  --text-light: #7f8c8d;         /* Secondary text color */
  
  /* Shadows */
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.08);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.12);
  
  /* Animations */
  --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

## Component Classes

### Buttons
```jsx
<button className="btn-primary">Primary Action</button>
<button className="btn-secondary">Secondary Action</button>
<button className="btn-success">Confirm</button>
<button className="btn-danger">Delete</button>
<button className="btn-large">Large Button</button>
```

### Cards
```jsx
<div className="item-card">
  <div className="item-card-header">
    <span className="item-category">Category</span>
    <span className="item-status">Status</span>
  </div>
  <h3 className="item-title">Title</h3>
  <p className="item-description">Description</p>
</div>
```

### Grids
```jsx
<div className="items-grid">
  {/* Items render in responsive grid: repeat(auto-fill, minmax(320px, 1fr)) */}
</div>

<div className="filter-group">
  <button className="filter-btn active">All</button>
  <button className="filter-btn">Pending</button>
</div>
```

### Forms
```jsx
<input className="form-input" type="text" />
<textarea className="form-input"></textarea>
<select className="form-input">...</select>

<div className="form-row">
  <div className="form-group">...</div>
  <div className="form-group">...</div>
</div>
```

### States
```jsx
<div className="loading">
  <div className="spinner"></div>
  Loading...
</div>

<div className="empty-state">
  <div className="empty-icon">📦</div>
  <h3 className="empty-title">No items</h3>
  <p className="empty-description">Description</p>
</div>
```

### Modal
```jsx
<div className="modal-overlay">
  <div className="modal-card">
    <h2 className="modal-title">Title</h2>
    {/* Content */}
    <div className="modal-actions">
      <button className="btn-primary">Save</button>
      <button className="btn-secondary">Cancel</button>
    </div>
  </div>
</div>
```

## Color Usage Guidelines

| Color | Use Case | CSS Variable |
|-------|----------|--------------|
| Primary Gradient | Main CTAs, headers, active states | `linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)` |
| Success | Confirmations, positive feedback | `var(--success)` #27ae60 |
| Warning | Alerts, cautions | `var(--warning)` #f39c12 |
| Danger | Delete, cancel, errors | `var(--danger)` #e74c3c |
| Dark Text | All body text, titles | `var(--text-dark)` #2c3e50 |
| Light Text | Secondary info, labels | `var(--text-light)` #7f8c8d |

## Font Sizes

- **Page Title**: 2.2em - 3.5em
- **Section Title**: 1.4em - 1.5em
- **Card Title**: 1.1em - 1.3em
- **Body Text**: 0.95em - 1em
- **Small Text**: 0.85em - 0.9em
- **Tiny Text**: 0.8em

## Spacing Scale

- **xs**: 4px
- **sm**: 8px
- **md**: 12px
- **lg**: 16px
- **xl**: 24px
- **2xl**: 32px
- **3xl**: 40px+

## Responsive Breakpoints

```css
/* Desktop: 1200px+ (full layout) */
/* Tablet: 768px - 1199px (adjusted grid columns) */
/* Mobile: 480px - 767px (single column) */
/* Small Mobile: <480px (minimal padding) */

@media (max-width: 768px) {
  /* Tablet adjustments */
}

@media (max-width: 480px) {
  /* Mobile adjustments */
}
```

## Animation Keyframes

```css
@keyframes spin { /* Loading spinner */ }
@keyframes fadeIn { /* Smooth appearance */ }
@keyframes slideUp { /* Modal/card entrance */ }
@keyframes float { /* Logo floating effect */ }
@keyframes bounce { /* Logo bounce */ }
@keyframes shake { /* Error message shake */ }
```

## Dashboard Header

```jsx
<header className="dashboard-header">
  <div className="dashboard-header-content">
    <div className="header-left">
      <div className="header-logo">♻️ Ridit</div>
      <div>Page Title</div>
    </div>
    <div className="header-right">
      <div className="user-info">
        <div className="user-name">Name</div>
        <div className="user-role">Role</div>
      </div>
      {/* Actions */}
    </div>
  </div>
</header>
```

## Icon Emoji Convention

Use consistent emojis across the platform:
- **♻️** - Ridit branding, recycling
- **📦** - Items, packages, sellers
- **🚚** - Collectors, transportation
- **📍** - Location, address
- **🕐** - Time, schedule
- **🌍** - Environment, planet
- **💻** - E-waste, technology
- **📄** - Paper
- **⚙️** - Metal
- **📊** - Statistics, pricing
- **📸** - Images
- **✓** - Confirmation, success
- **⚠️** - Warning, alert
- **🗺️** - Map, location

## Common Patterns

### Empty State
```jsx
<div className="empty-state">
  <div className="empty-icon">📦</div>
  <h3 className="empty-title">No items yet</h3>
  <p className="empty-description">Start by adding your first item</p>
  <button className="btn-primary">Add Item</button>
</div>
```

### Loading State
```jsx
<div className="loading">
  <div className="spinner"></div>
  Loading items...
</div>
```

### Filter Group
```jsx
<div className="filter-group">
  <button className={`filter-btn ${!filter ? 'active' : ''}`} onClick={() => setFilter(null)}>All</button>
  <button className={`filter-btn ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}>Pending</button>
</div>
```

### Item Card
```jsx
<div className="item-card">
  <div className="item-card-header">
    <span className="item-category">plastic</span>
    <span className={`item-status ${item.status}`}>{item.status}</span>
  </div>
  <h3 className="item-title">{item.description}</h3>
  <div className="item-meta">
    <div className="meta-item">
      <span className="meta-label">Quantity</span>
      <span className="meta-value">{item.quantity}</span>
    </div>
    <div className="meta-item">
      <span className="meta-label">Price</span>
      <span className="meta-value">₹{item.price}</span>
    </div>
  </div>
  <div className="item-actions">
    <button className="btn-primary btn-small">Accept</button>
    <button className="btn-secondary btn-small">Details</button>
  </div>
</div>
```

## Best Practices

✅ **DO**:
- Use CSS variables for all colors
- Apply hover states to interactive elements
- Include loading and empty states
- Test on mobile devices
- Use semantic button classes (.btn-primary for main action)
- Maintain consistent spacing using the scale
- Include proper focus states for accessibility

❌ **DON'T**:
- Use hardcoded colors (use CSS variables instead)
- Skip responsive design
- Add animations without purpose
- Forget loading/error states
- Use inline styles when CSS classes work
- Mix color systems (use established palette)
- Create duplicate button styles

## Testing the Design

1. **Color Contrast**: Check WCAG AA compliance
2. **Responsive**: Test at 1920px, 768px, 480px, 320px
3. **Interactions**: Test hover, active, focus, disabled states
4. **Performance**: Ensure smooth 60fps animations
5. **Accessibility**: Test keyboard navigation
6. **Cross-browser**: Test Chrome, Firefox, Safari, Edge

## File Structure

```
frontend/src/styles/
├── Auth.css          (Login/Register pages)
├── Dashboard.css     (All dashboard pages + modals)
├── Home.css          (Landing/User dashboard)
└── AddItem.css       (Add Item form)
```

All CSS files use the same :root variables and follow consistent patterns.
