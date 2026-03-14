# Client Specification v1.2.0

## Overview
- **Version**: 1.2.0
- **Framework**: Angular 19
- **Theme**: White & Purple (#667eea - #764ba2)

## Pages

### 1. Home (Public)
- Landing page with project description
- Login/Register buttons

### 2. Login
- WebAuthn login button
- Demo login form (username/password)
- Italian translations

### 3. Register
- Display name input
- WebAuthn registration
- Italian translations

### 4. Dashboard (Protected)
- Statistics cards with icons
- Illness status pie chart
- Upcoming appointments
- Today's prescriptions
- Recent illnesses
- Quick action buttons

### 5. Illnesses List (Protected)
- Card-based grid layout
- Search and filter
- Add/Edit/Delete actions
- Status badges

### 6. Prescriptions List (Protected)
- Card-based layout
- Linked to doctors and illnesses
- Status indicators
- Italian labels

### 7. Appointments List (Protected)
- Card-based layout with date boxes
- Status badges (upcoming/today/past)
- Italian labels

### 8. Doctors (Protected)
- Card-based grid
- Contact information
- CRUD operations

### 9. Calendar (Protected)
- Monthly grid view
- Event indicators
- Upcoming events sidebar

## Navigation
- Top navbar with gradient
- Dashboard, Malattie, Farmaci, Visite, Medici, Calendario links
- Logout button

## Color Scheme
```css
--primary-color: #667eea;
--accent-color: #764ba2;
--primary-light: #a78bfa;
--primary-dark: #5a67d8;
--text-primary: #1a202c;
--text-secondary: #4a5568;
--text-muted: #718096;
--bg-primary: #ffffff;
--bg-secondary: #f8fafc;
--bg-tertiary: #f1f5f9;
```

## Components
All pages use consistent:
- Card-based layouts
- Header with title and add button
- Empty states with icons
- Form controls with icons
- Status badges with colors
- Action buttons with hover effects
