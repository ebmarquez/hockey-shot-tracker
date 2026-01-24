# Hockey Shot Tracker - Project Specification

A professional web application for tracking shots and goals during hockey games with an interactive NHL-specification ice rink, real-time statistics, and comprehensive game management features.

## Table of Contents
- [Overview](#overview)
- [Project Goal](#project-goal)
- [Design Philosophy](#design-philosophy)
- [Core Features](#core-features)
- [Technical Architecture](#technical-architecture)
- [User Interface Components](#user-interface-components)
- [Usage Guide](#usage-guide)
- [Mobile Optimization](#mobile-optimization)
- [Data Persistence](#data-persistence)
- [Example Workflows](#example-workflows)
- [Development Setup](#development-setup)
- [Technology Stack](#technology-stack)
- [Visual Guide](#visual-guide)

---

## Overview

Hockey Shot Tracker is an interactive web application designed for coaches, players, and hockey enthusiasts to track shot locations, goals, and game statistics in real-time during hockey games. Built with React and TypeScript, it features a fully responsive NHL-specification ice rink where users can click/tap to record shots with precise location tracking.

### Key Capabilities
- **Interactive Ice Rink**: Click anywhere on a regulation NHL ice rink to record shots
- **Dual Team Tracking**: Separate statistics and visualization for home and away teams
- **Period Management**: Track shots across 1st, 2nd, 3rd periods and Overtime
- **Real-time Statistics**: Instant calculation of goals, shots, and shooting percentages
- **Mobile Optimized**: Full touch support with pinch-to-zoom and pan functionality
- **Data Persistence**: All game data automatically saved and restored between sessions
- **Game Summary Export**: Generate shareable game summaries with detailed statistics and shot maps

---

## Project Goal

Create a simple, elegant, and highly functional tool that allows anyone to track hockey game shots with professional-grade precision, without requiring complex setup or training. The application should feel like a coach's tactical tool - clean, data-focused, and built for fast-paced game environments.

### Primary Objectives
1. **Eliminate barriers to entry**: Zero configuration needed - open the app and start tracking immediately
2. **Professional accuracy**: NHL-specification rink ensures realistic shot location tracking
3. **Mobile-first experience**: Designed for use on tablets and phones at rink-side
4. **Data integrity**: All recordings persist automatically, no risk of data loss
5. **Shareable insights**: Export game summaries for team analysis and social sharing

---

## Design Philosophy

### Visual Identity
The design evokes the excitement and precision of professional hockey analytics with:
- **Ice aesthetic**: Cool blue palette inspired by actual ice rinks
- **Bold team colors**: Red-orange for home team, deep blue for away team
- **Technical precision**: Monospace numbers and clean typography for statistics
- **Professional polish**: Subtle animations and refined interactions without distraction

### User Experience Principles
1. **Immediate feedback**: Every click produces instant visual confirmation
2. **Error tolerance**: Easy deletion and correction of mistaken entries
3. **Progressive disclosure**: Advanced features available but not overwhelming
4. **Spatial awareness**: Visual shot placement exactly where user clicks
5. **Consistent behavior**: Same interaction patterns throughout the app

---

## Core Features

### 1. Interactive Ice Rink with Shot Tracking

**Description**: A fully rendered NHL-specification ice rink (200ft x 85ft proportions) displayed as an interactive SVG that accepts user clicks to record shot locations.

**Rink Specifications** (Based on [Official NHL Rules](https://www.nhl.com/ice/page.htm?id=26458) and [Wikipedia Ice Hockey Rink](https://en.wikipedia.org/wiki/Ice_hockey_rink)):

#### NHL Regulation Dimensions
| Element | Measurement | SVG ViewBox Units |
|---------|-------------|-------------------|
| **Overall Size** | 200 ft × 85 ft (61.0 m × 25.9 m) | 133.33 × 56.67 |
| **Corner Radius** | 28 ft (8.5 m) | 18.67 |
| **Goal Line from End** | 11 ft (3.4 m) | 7.33 |
| **Blue Lines from End** | 75 ft (22.9 m) | 50.0 |
| **Blue Lines Apart** | 50 ft (15.2 m) | 33.33 |
| **Center Line** | Middle (100 ft from each end) | 66.67 |

#### Lines and Markings
- **Center Red Line**: 12 inches (30 cm) wide, runs across center ice
- **Blue Lines**: 12 inches (30 cm) wide, 75 ft from end boards
- **Goal Lines**: 2 inches (5 cm) wide, 11 ft from end boards

#### Faceoff Circles and Spots
- **Center Ice Circle**: 30 ft (9 m) diameter, blue
- **Center Faceoff Spot**: 12 inches (30 cm) diameter, solid blue
- **End Zone Faceoff Circles**: 30 ft (9 m) diameter, red
- **End Zone Faceoff Spots**: 2 ft (61 cm) diameter, red with white center
- **Neutral Zone Spots**: 4 spots, 2 ft diameter, red (no surrounding circle)

#### Goal and Crease
- **Goal Opening**: 72 inches (180 cm) wide × 48 inches (120 cm) tall
- **Goal Depth**: 40 inches (100 cm)
- **Crease**: Semi-circular, 6 ft (1.8 m) radius from goal line
- **Crease Hash Marks**: 5 inches (13 cm) thick, 4 ft from goal line

#### Goaltender Trapezoid ("Martin Brodeur Rule")
- **Base at Goal Line**: 22 ft (6.7 m) wide (centered behind goal)
- **Base at End Boards**: 28 ft (8.5 m) wide
- **Depth**: 11 ft (3.4 m) from goal line to boards
- Goaltender may only handle puck within trapezoid behind goal line

#### Boards
- **Height**: 40-48 inches (100-120 cm)
- Curved "corner boards" connect straight sections

#### Reference Diagrams
- [NHL Hockey Rink Diagram (Wikipedia SVG)](https://en.wikipedia.org/wiki/Ice_hockey_rink#/media/File:NHL_Hockey_Rink.svg)
- [Ice Hockey Layout Diagram](https://en.wikipedia.org/wiki/Ice_hockey_rink#/media/File:Ice_hockey_layout.svg)

#### Implementation in App
- Regulation proportions (133.33 × 56.67 viewBox units representing 200 ft × 85 ft)
- Center ice face-off circle (30 ft diameter = 20 viewBox units)
- Offensive zone face-off circles (4 circles, properly positioned)
- Blue lines, red center line, goal lines at correct positions
- Goal creases with proper NHL trapezoid shape
- Ice texture with subtle pattern overlay
- Zone labels (Home Zone / Away Zone)

**Shot Recording**:
- **Desktop**: Single click on rink surface
- **Mobile**: Tap on rink surface (distinguishes tap from pan gesture)
- Coordinates captured as percentages for responsive scaling
- Dialog appears immediately for shot type selection

**Shot Types**:
- **Shot**: Hollow circle marker in team color
- **Goal**: Filled circle with golden highlight ring

**Visual Feedback**:
- Shot markers appear at exact click coordinates
- Zoom-in animation on marker appearance
- Team-specific colors (home = red-orange, away = blue)
- Hover effect enlarges markers for deletion
- Markers persist across period switches

### 2. Dual Team Statistics Dashboard

**Real-time Statistics** (per team):
- Total goals scored
- Total shots taken
- Shooting percentage (goals/shots × 100)
- Per-period breakdown of goals and shots
- Cumulative totals across all periods

**Editable Team Names**:
- Click team name to edit inline
- Defaults to "Home" and "Away"
- Custom names persist across sessions
- Updates reflected in all UI locations and exports

**Visual Design**:
- Card layout with team color accent border
- Monospace font for statistics (JetBrains Mono)
- Responsive grid (side-by-side desktop, stacked mobile)

### 3. Period Management System

**Period Selection**:
- Toggle between: 1st, 2nd, 3rd, and OT (Overtime)
- Active period highlighted with primary color
- Non-active periods in muted state

**Behavior**:
- **Rink display**: Shows only shots from selected period
- **Statistics**: Always show cumulative totals across all periods
- **Shot recording**: New shots tagged with current period
- Toast notification confirms period changes

**Period Filtering**:
- Switch periods without losing data
- All shots preserved in background
- Period-specific shot counts displayed below rink

### 4. Shot Deletion & Correction

**Deletion Flow**:
1. Click any shot marker on rink
2. Confirmation dialog appears with shot details
3. Shows: shot type (Goal/Shot), team, period, timestamp
4. Confirm to delete or cancel to keep

**Safety Features**:
- Requires explicit confirmation (no accidental deletion)
- Shows which shot will be deleted before confirming
- Toast notification confirms successful deletion
- Statistics automatically recalculate after deletion

### 5. Game Controls

**End Game**:
- Button in game controls bar
- Opens dialog with final score preview
- Options:
  - View detailed summary (shot maps for each period)
  - Close and continue game
- Final score format: "Home Team 3 - 2 Away Team"

**Reset Game**:
- Button in game controls bar
- Confirmation dialog warns of data loss
- Resets to default state:
  - Team names → "Home" and "Away"
  - Period → 1st
  - All shots cleared
  - Statistics reset to 0

### 6. Game Summary & Sharing

**Summary View**:
- Full-screen display of game results
- Final score at top
- Shot maps for each period (1st, 2nd, 3rd, OT if applicable)
- Detailed shot list with timestamps
- Statistics table with shooting percentages

**Shot List Details** (per entry):
- Team name
- Period
- Timestamp
- Shot type (Shot/Goal)
- Shot location (not editable in summary)

**Export Options**:
- Share button triggers native share menu (mobile)
- Share via social media, email, text, etc.
- Print functionality for desktop
- All content prints correctly including scrolled areas

---

## Technical Architecture

### Component Structure

```
src/
├── App.tsx                      # Main application component & state management
├── components/
│   ├── IceRink.tsx             # SVG rink with click/touch handling
│   ├── ShotDialog.tsx          # Shot type selection (Shot/Goal)
│   ├── DeleteShotDialog.tsx    # Shot deletion confirmation
│   ├── TeamStats.tsx           # Team statistics card with inline name editing
│   ├── PeriodSelector.tsx      # Period toggle buttons (1st/2nd/3rd/OT)
│   ├── GameControls.tsx        # End game and reset buttons
│   ├── EndGameDialog.tsx       # Final score dialog with share option
│   ├── ResetGameDialog.tsx     # Reset confirmation dialog
│   └── ShareGameSummary.tsx    # Full game summary with export
├── lib/
│   ├── types.ts                # TypeScript type definitions
│   └── utils.ts                # Utility functions (cn helper)
└── hooks/
    └── use-mobile.ts           # Mobile detection hook
```

### Data Model

```typescript
// Shot data structure
interface Shot {
  id: string          // Unique identifier (timestamp + random)
  x: number           // X coordinate (0-133.33 viewBox units)
  y: number           // Y coordinate (0-56.67 viewBox units)
  type: 'shot' | 'goal'
  team: 'home' | 'away'
  period: '1st' | '2nd' | '3rd' | 'OT'
  timestamp: number   // Unix timestamp (Date.now())
}

// Game state structure
interface GameState {
  homeTeam: string    // Home team name
  awayTeam: string    // Away team name
  currentPeriod: '1st' | '2nd' | '3rd' | 'OT'
  shots: Shot[]       // All shots across all periods
}
```

### State Management

**Primary State** (useKV - persisted):
- `gameState`: Complete game state including teams, period, and all shots
- Storage key: `'hockey-game'`
- Automatically persists to browser storage via Spark KV API

**Local UI State** (useState - ephemeral):
- `pendingShot`: Temporary storage of click coordinates before shot type selection
- `dialogOpen`: Shot type dialog visibility
- `shotToDelete`: Shot selected for deletion
- `deleteDialogOpen`: Delete confirmation dialog visibility
- `endGameDialogOpen`: End game dialog visibility
- `resetDialogOpen`: Reset confirmation dialog visibility
- `showSummary`: Summary view visibility

### Coordinate System

**ViewBox Coordinates** (NHL Regulation Mapping):

The SVG viewBox uses a coordinate system that maps directly to NHL regulation dimensions:

```
Real World (feet)  →  ViewBox Units  →  Percentage
200 ft (length)    →  133.33         →  100%
85 ft (width)      →  56.67          →  100%
```

**Conversion Formula**: `viewBox units = (feet / 200) × 133.33` for x, `(feet / 85) × 56.67` for y

#### Key Position Mappings
| NHL Feature | Real Position | ViewBox X | ViewBox Y |
|-------------|---------------|-----------|----------|
| **Left End Boards** | 0 ft | 0 | — |
| **Left Goal Line** | 11 ft | 7.33 | 28.33 (center) |
| **Left Blue Line** | 75 ft | 50.0 | — |
| **Center Line** | 100 ft | 66.67 | — |
| **Right Blue Line** | 125 ft | 83.33 | — |
| **Right Goal Line** | 189 ft | 126.0 | 28.33 (center) |
| **Right End Boards** | 200 ft | 133.33 | — |
| **Top Boards** | — | — | 0 |
| **Center Ice** | — | 66.67 | 28.33 |
| **Bottom Boards** | — | — | 56.67 |

#### Zone Boundaries
- **Home Defensive Zone**: x = 0 to 50.0 (goal line to blue line)
- **Neutral Zone**: x = 50.0 to 83.33 (between blue lines)
- **Away Defensive Zone**: x = 83.33 to 133.33 (blue line to goal line)
- For shot tracking: Home zone x < 66.67, Away zone x > 66.67

**Click to Coordinate Conversion**:
```typescript
// Desktop click
const svgX = (clickX / rect.width) * 133.33
const svgY = (clickY / rect.height) * 56.67

// Mobile touch (same calculation)
const svgX = (touchX / rect.width) * 133.33
const svgY = (touchY / rect.height) * 56.67
```

**Team Assignment**:
- Shots recorded in left half (x < 66.67) → Home team
- Shots recorded in right half (x > 66.67) → Away team

---

## User Interface Components

### Ice Rink (IceRink.tsx)

**Visual Elements**:
- NHL-specification rink with proper markings
- Face-off circles with proper cross markings
- Goal creases with trapezoid shape
- Blue lines (dashed) and red center line
- Ice texture overlay pattern
- Zone labels below rink

**Interactive Features**:
- Click/tap to add shot
- Click existing shot marker to delete
- Mobile: pinch-to-zoom (scale 1x to 3x)
- Mobile: pan when zoomed (two-finger or drag)
- Hover effect on shot markers

**Responsive Behavior**:
- Scales to container width
- Maintains aspect ratio
- Touch targets enlarged on mobile
- Gesture detection distinguishes tap from pan

### Shot Dialog (ShotDialog.tsx)

**Purpose**: Select shot type after clicking rink

**Content**:
- Title: "Record Shot"
- Two large buttons: "Shot" and "Goal"
- Icons: Target for Shot, Trophy for Goal

**Behavior**:
- Opens immediately after rink click
- Closes after selection
- Can be cancelled by clicking outside or close button
- Selection triggers toast notification

### Team Statistics Card (TeamStats.tsx)

**Layout**:
- Team name (editable) at top
- Large stat numbers in monospace font
- Goals / Shots / Shooting %
- Period breakdown table below
- Color-coded border (team color)

**Editable Team Name**:
- Appears as text initially
- Click to activate inline input
- Type new name and press Enter or click outside
- Updates persist automatically

**Statistics Display**:
- Goals: Count of shots with type='goal'
- Shots: Total count of all shots
- Shooting %: (Goals / Shots × 100).toFixed(1) or "0.0" if no shots
- Per-period breakdown shows goals and shots for each period

### Period Selector (PeriodSelector.tsx)

**Design**: Button group with 4 periods

**Buttons**:
- 1st Period, 2nd Period, 3rd Period, OT
- Active period: Primary color fill, white text
- Inactive periods: Muted background, dark text

**Behavior**:
- Click to switch period
- Updates current period in game state
- Filters rink display to show only current period shots
- Toast notification confirms switch

### Game Controls (GameControls.tsx)

**Buttons**:
- **End Game**: Primary button, opens end game dialog
- **Reset Game**: Destructive button (red), opens reset confirmation

**Layout**:
- Horizontal button group
- Spaced evenly
- Full width on mobile

### End Game Dialog (EndGameDialog.tsx)

**Content**:
- Title: "End Game"
- Final score display: "Home Team 3 - 2 Away Team"
- Brief statistics summary

**Actions**:
- **View Summary**: Opens full game summary view
- **Close**: Dismisses dialog, returns to game
- No permanent changes to game state

### Reset Game Dialog (ResetGameDialog.tsx)

**Content**:
- Warning title: "Reset Game?"
- Description: Warns that all data will be lost
- Emphasizes permanent action

**Actions**:
- **Cancel**: Closes dialog, no changes
- **Reset**: Clears all game data, returns to defaults

### Game Summary (ShareGameSummary.tsx)

**Sections**:
1. **Header**: Final score, team names
2. **Shot Maps**: Ice rink image for each period with shots displayed
3. **Shot List**: Detailed table of all shots with:
   - Period
   - Team
   - Time (formatted timestamp)
   - Type (Shot/Goal)
4. **Statistics**: Final stats table for both teams

**Actions**:
- **Share**: Native share API (mobile) or fallback
- **Close**: Return to main app view
- **Print**: Browser print dialog (desktop)

---

## Usage Guide

### Starting a New Game

1. **Open the application** - Game loads with default state
2. **Customize team names** (optional):
   - Click "Home" or "Away" text in statistics cards
   - Type team names (e.g., "Red Wings", "Maple Leafs")
   - Press Enter or click outside to save
3. **Ensure correct period** - Default is 1st period

### Recording Shots During Gameplay

1. **Observe shot in real game**
2. **Click/tap location on rink** where shot was taken
3. **Select shot type** in dialog:
   - "Shot" for shots on goal (no goal scored)
   - "Goal" for successful goals
4. **Confirm** - Shot marker appears, statistics update
5. **Continue recording** throughout the period

### Switching Periods

1. **Click period button** (1st, 2nd, 3rd, or OT) at any time
2. **Toast notification confirms** period change
3. **Rink updates** to show only shots from new period
4. **Previous period data preserved** - switch back anytime

### Correcting Mistakes

1. **Click the incorrect shot marker** on the rink
2. **Confirmation dialog shows shot details**
3. **Click "Delete"** to remove shot
4. **Statistics automatically update**

### Ending the Game

1. **Click "End Game"** button when game concludes
2. **Review final score** in dialog
3. **Choose action**:
   - "View Summary" → See detailed game summary
   - "Close" → Stay on main view

### Viewing Game Summary

1. **After ending game**, click "View Summary"
2. **Review**:
   - Final score
   - Shot maps for each period
   - Detailed shot list
   - Shooting statistics
3. **Share or export**:
   - Mobile: Use native share button
   - Desktop: Print or screenshot

### Starting a Fresh Game

1. **Click "Reset Game"** button
2. **Confirm** in warning dialog
3. **All data clears**:
   - Team names reset to "Home" and "Away"
   - All shots deleted
   - Period resets to 1st
   - Statistics reset to 0

---

## Mobile Optimization

### Touch Gesture Support

**Tap to Add Shot**:
- Single tap on rink opens shot dialog
- Gesture detection distinguishes tap from pan
- Tap duration < 300ms and movement < 10px
- Touch coordinates converted to SVG coordinates

**Pinch to Zoom**:
- Two-finger pinch gesture
- Scale range: 1x (default) to 3x (maximum)
- Smooth scale interpolation
- Resets to 1x when scale returns to minimum

**Pan When Zoomed**:
- Single-finger drag when scale > 1x
- Constrained to prevent panning beyond rink edges
- Smooth touch-following with no lag
- Automatically disabled when scale = 1x

**Click/Tap to Delete Shot**:
- Tap shot marker to delete
- Larger touch target on mobile (6 unit radius)
- Hover effect replaced with visual feedback on touch

### Responsive Layout

**Mobile (< 768px)**:
- Statistics cards stack vertically
- Period selector buttons at full width
- Reduced padding throughout (p-2 instead of p-4)
- Smaller text sizes
- Header reduced to single line
- Rink maximized to fill width

**Tablet (768px - 1024px)**:
- Statistics side-by-side
- Comfortable spacing maintained
- Standard text sizes

**Desktop (> 1024px)**:
- Maximum width container (max-w-7xl)
- Generous spacing
- Hover effects enabled
- Larger touch targets not required

### Performance Optimizations

- SVG rendering (no canvas) for crisp scaling
- Minimal re-renders via React optimization
- useKV persistence doesn't block UI
- Animations use CSS transforms (GPU-accelerated)
- Touch event listeners passive where possible

---

## Data Persistence

### Automatic Saving

**Storage Mechanism**: Spark KV (Key-Value) API
- Browser-based storage (localStorage under the hood)
- Automatic serialization/deserialization
- No user action required

**What Persists**:
- Team names (home and away)
- Current period selection
- All shots (every period, all data)
- Complete game state

**When Data Saves**:
- Every shot addition
- Every shot deletion
- Team name changes
- Period switches
- Reset operations

### Session Recovery

**Automatic Resume**:
- Refresh page → Game state restored
- Close and reopen browser → Game continues
- No "Save" button needed
- No risk of data loss from accidental closure

**Default State** (first visit or after reset):
```javascript
{
  homeTeam: 'Home',
  awayTeam: 'Away',
  currentPeriod: '1st',
  shots: []
}
```

### Data Safety

**No Manual Saving Required**:
- All changes save automatically
- No "Save Game" button
- No export required for persistence

**Reset is Permanent**:
- Reset clears persisted data
- Confirmation dialog warns user
- No undo after reset confirmation

---

## Example Workflows

### Workflow 1: Complete Game Tracking

**Scenario**: Coach tracking high school hockey game

1. **Setup**:
   - Open app on tablet at rink-side
   - Edit team names: "Wildcats" vs "Bears"
   - Confirm 1st period selected

2. **During 1st Period**:
   - Wildcats player shoots from left wing → tap location → select "Shot"
   - Wildcats player scores from slot → tap location → select "Goal"
   - Bears player shoots from blue line → tap location → select "Shot"
   - Continue recording all shots
   - Current stats: Wildcats 1 goal/3 shots, Bears 0 goals/2 shots

3. **Period Break**:
   - Click "2nd Period" button
   - Rink clears to show only 2nd period shots
   - Statistics still show cumulative totals

4. **During 2nd Period**:
   - Continue recording shots
   - Accidentally tap wrong location → click marker → delete

5. **End of Game**:
   - Click "End Game" after 3rd period
   - View Summary → See final stats
   - Share summary via email to team

### Workflow 2: Shot Pattern Analysis

**Scenario**: Player analyzing shooting tendencies

1. **Setup**:
   - Set team name to player name
   - Use "Home" side for player, "Away" for opponents

2. **During Practice**:
   - Record every shot attempt with location
   - Mark successful shots as "Goal", misses as "Shot"

3. **Review**:
   - Switch between periods to see shot clusters
   - Calculate shooting % from different zones
   - Identify high-success areas

4. **Next Practice**:
   - Reset game to start fresh session
   - Compare new shooting % to previous

### Workflow 3: Mobile Scouting

**Scenario**: Scout analyzing opposing team from stands

1. **Setup** (mobile phone):
   - Pinch to zoom on opponent's offensive zone
   - Pan to focus on goal area
   - Set opponent as "Home" team

2. **During Game**:
   - Tap to record all opponent shot locations
   - Mark goals and shots
   - Switch periods as game progresses

3. **Post-Game**:
   - Review shot map heat map visually
   - Identify most dangerous shooters/locations
   - Share summary with coaching staff

---

## Development Setup

### Prerequisites

- Node.js 18+ and npm
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Git (for cloning repository)

### Installation

```bash
# Clone the repository
git clone [repository-url]
cd hockey-shot-tracker

# Install dependencies
npm install

# Start development server
npm run dev
```

### Development Server

```bash
npm run dev
```

- Opens at `http://localhost:5173` (or next available port)
- Hot module replacement enabled
- TypeScript type checking in terminal

### Build for Production

```bash
npm run build
```

- Outputs to `dist/` directory
- Optimized and minified
- Ready for static hosting

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

---

## Technology Stack

### Core Framework
- **React 19** - UI component library
- **TypeScript 5** - Type-safe development
- **Vite 7** - Fast build tool and dev server

### UI & Styling
- **Tailwind CSS 4** - Utility-first CSS framework
- **shadcn/ui v4** - Accessible component primitives
- **Radix UI** - Unstyled accessible components
- **Framer Motion** - Animation library
- **Phosphor Icons** - Icon library

### State & Data
- **Spark KV API** - Persistent key-value storage
- **React Hooks** - State management (useState, useEffect, useKV)

### Utilities
- **clsx & tailwind-merge** - Class name utilities
- **sonner** - Toast notification system
- **date-fns** - Date formatting utilities

### Development Tools
- **ESLint** - Code linting
- **TypeScript ESLint** - TypeScript-specific linting
- **Vite SWC** - Fast React compilation

### Browser APIs Used
- **SVG** - Ice rink rendering
- **Touch Events** - Mobile gesture support
- **Web Share API** - Native sharing on mobile
- **Print API** - Document printing
- **localStorage** - Data persistence (via Spark KV)

---

## Example Images

### Main Game View (Desktop)

```
┌─────────────────────────────────────────────────────────────┐
│                    🏒 Hockey Shot Tracker                    │
│              Click on the rink to record shots               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────┐ ┌──────────────────────┐          │
│  │  Red Wings      [Edit]│ │  Maple Leafs    [Edit]│         │
│  │                       │ │                       │          │
│  │  Goals: 3             │ │  Goals: 2             │          │
│  │  Shots: 15            │ │  Shots: 12            │          │
│  │  Shooting %: 20.0%    │ │  Shooting %: 16.7%    │          │
│  │                       │ │                       │          │
│  │  Period Breakdown:    │ │  Period Breakdown:    │          │
│  │  1st: 1G / 5S         │ │  1st: 1G / 4S         │          │
│  │  2nd: 1G / 5S         │ │  2nd: 0G / 4S         │          │
│  │  3rd: 1G / 5S         │ │  3rd: 1G / 4S         │          │
│  └──────────────────────┘ └──────────────────────┘          │
│                                                               │
│  [ 1st Period ] [ 2nd Period ] [ 3rd Period ] [ OT ]         │
│                      (2nd Period Active)                      │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                    ICE RINK VIEW                         │ │
│  │  ┌────────────────────────────────────────────────┐     │ │
│  │  │     ●  ○     │         ●                  ○     │     │ │
│  │  │  ○     ●     │      ○  ◎  ●           ○        │     │ │
│  │  │    ●  ○   ◎  │         ●      ●   ○    ◎       │     │ │
│  │  │  ○           │                        ●         │     │ │
│  │  └────────────────────────────────────────────────┘     │ │
│  │  [Home Zone]                          [Away Zone]        │ │
│  │  8 shots recorded in 2nd period                         │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│         [End Game]                   [Reset Game]            │
└─────────────────────────────────────────────────────────────┘
```

**Legend**:
- ● = Shot (home team - red/orange)
- ○ = Shot (away team - blue)
- ◎ = Goal (marked with highlight ring)

### Shot Dialog

```
┌───────────────────────────┐
│      Record Shot          │
├───────────────────────────┤
│                           │
│   ┌─────────────────┐    │
│   │   🎯 Shot       │    │
│   └─────────────────┘    │
│                           │
│   ┌─────────────────┐    │
│   │   🏆 Goal       │    │
│   └─────────────────┘    │
│                           │
└───────────────────────────┘
```

### End Game Dialog

```
┌───────────────────────────────┐
│        End Game               │
├───────────────────────────────┤
│                               │
│  Final Score:                 │
│  Red Wings 3 - 2 Maple Leafs  │
│                               │
│  Goals: 3 vs 2                │
│  Shots: 15 vs 12              │
│                               │
│  ┌─────────────────────────┐ │
│  │   View Summary          │ │
│  └─────────────────────────┘ │
│                               │
│  [Close]                      │
└───────────────────────────────┘
```

### Game Summary View

```
┌─────────────────────────────────────────────────────────────┐
│                     GAME SUMMARY                             │
│                                                               │
│  Red Wings 3  -  2 Maple Leafs                               │
│                                                               │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                               │
│  1ST PERIOD                                                   │
│  [Ice Rink with shots displayed]                             │
│  Red Wings: 1 goal, 5 shots | Maple Leafs: 1 goal, 4 shots  │
│                                                               │
│  2ND PERIOD                                                   │
│  [Ice Rink with shots displayed]                             │
│  Red Wings: 1 goal, 5 shots | Maple Leafs: 0 goals, 4 shots │
│                                                               │
│  3RD PERIOD                                                   │
│  [Ice Rink with shots displayed]                             │
│  Red Wings: 1 goal, 5 shots | Maple Leafs: 1 goal, 4 shots  │
│                                                               │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                               │
│  SHOT LIST                                                    │
│  ┌────────┬──────────────┬───────────┬────────┐             │
│  │ Period │ Team         │ Time      │ Type   │             │
│  ├────────┼──────────────┼───────────┼────────┤             │
│  │ 1st    │ Red Wings    │ 2:34      │ Shot   │             │
│  │ 1st    │ Maple Leafs  │ 3:12      │ Goal   │             │
│  │ 1st    │ Red Wings    │ 5:45      │ Goal   │             │
│  │ ...    │ ...          │ ...       │ ...    │             │
│  └────────┴──────────────┴───────────┴────────┘             │
│                                                               │
│  FINAL STATISTICS                                             │
│  ┌──────────────┬───────┬────────┬─────────────┐            │
│  │ Team         │ Goals │ Shots  │ Shooting %  │            │
│  ├──────────────┼───────┼────────┼─────────────┤            │
│  │ Red Wings    │   3   │   15   │    20.0%    │            │
│  │ Maple Leafs  │   2   │   12   │    16.7%    │            │
│  └──────────────┴───────┴────────┴─────────────┘            │
│                                                               │
│  [Share] [Print] [Close]                                     │
└─────────────────────────────────────────────────────────────┘
```

### Mobile View (Portrait)

```
┌─────────────────────┐
│  🏒 Hockey Tracker  │
├─────────────────────┤
│                     │
│ ┌─────────────────┐ │
│ │ Red Wings       │ │
│ │ Goals: 3        │ │
│ │ Shots: 15       │ │
│ │ Shooting: 20.0% │ │
│ └─────────────────┘ │
│                     │
│ ┌─────────────────┐ │
│ │ Maple Leafs     │ │
│ │ Goals: 2        │ │
│ │ Shots: 12       │ │
│ │ Shooting: 16.7% │ │
│ └─────────────────┘ │
│                     │
│ [1st][2nd][3rd][OT] │
│                     │
│ ┌─────────────────┐ │
│ │  ●    ○         │ │
│ │    ○  ●  ◎      │ │
│ │ ○         ●     │ │
│ │      ◎   ○  ●   │ │
│ └─────────────────┘ │
│ [Home]    [Away]    │
│                     │
│ [End] [Reset]       │
└─────────────────────┘
```

---

## Recreating This Project

To recreate this Hockey Shot Tracker application from scratch:

### 1. Initialize Project

```bash
# Use Spark template or create React + TypeScript + Vite project
npm create vite@latest hockey-shot-tracker -- --template react-ts
cd hockey-shot-tracker
```

### 2. Install Dependencies

```bash
# Core UI dependencies
npm install @radix-ui/react-dialog @radix-ui/react-label
npm install tailwindcss @tailwindcss/vite
npm install clsx tailwind-merge
npm install @phosphor-icons/react
npm install sonner
npm install framer-motion

# shadcn/ui components (or add manually)
npx shadcn@latest init
npx shadcn@latest add dialog card button input label
```

### 3. Configure Tailwind

Create `tailwind.config.js` with custom theme colors:
- Define home team color (red-orange)
- Define away team color (blue)
- Set up CSS variables for theming

### 4. Create Type Definitions

Create `src/lib/types.ts` with:
- `Shot` interface (id, x, y, type, team, period, timestamp)
- `GameState` interface (homeTeam, awayTeam, currentPeriod, shots)
- Type unions for `ShotType`, `Team`, `Period`

### 5. Build Ice Rink Component

Create `src/components/IceRink.tsx`:
- SVG with viewBox `0 0 133.33 56.67` (NHL proportions)
- Draw all rink markings (circles, lines, zones, goals)
- Implement click handler with coordinate conversion
- Add touch gesture support (pinch-zoom, pan)
- Render shot markers from props

### 6. Create UI Components

Build each dialog and control component:
- `ShotDialog.tsx` - Shot type selection
- `DeleteShotDialog.tsx` - Delete confirmation
- `TeamStats.tsx` - Statistics card with inline editing
- `PeriodSelector.tsx` - Period toggle buttons
- `GameControls.tsx` - End/Reset buttons
- `EndGameDialog.tsx` - Final score dialog
- `ResetGameDialog.tsx` - Reset confirmation
- `ShareGameSummary.tsx` - Full game summary

### 7. Implement Main App Logic

In `src/App.tsx`:
- Use `useKV` hook for game state persistence
- Handle rink clicks → open dialog → create shot
- Handle shot clicks → confirm deletion
- Implement period switching with filtering
- Wire up all dialog open/close logic
- Add toast notifications for feedback

### 8. Add Responsive Styling

- Mobile-first CSS with Tailwind breakpoints
- Optimize touch target sizes
- Adjust spacing and typography for small screens
- Test on actual devices

### 9. Implement Export Functionality

In `ShareGameSummary.tsx`:
- Generate static shot maps for each period
- Format shot list with timestamps
- Add native share API integration
- Support print functionality

### 10. Test & Polish

- Test coordinate accuracy across devices
- Verify persistence across page refreshes
- Check edge cases (no shots, division by zero)
- Smooth animations and transitions
- Accessibility (keyboard navigation, ARIA labels)

---

## Visual Guide

For detailed UI screenshots, component illustrations, and visual workflows, see **[SCREENSHOTS.md](SCREENSHOTS.md)**.

The visual guide includes:
- Main game view layouts (desktop & mobile)
- Interactive element states (buttons, markers, inputs)
- All dialogs and modals with detailed annotations
- Mobile views (portrait & landscape)
- Complete game summary screens
- User workflow diagrams
- Color palette references
- Typography examples
- Responsive breakpoints
- Ice rink specifications with measurements
- Accessibility features
- Performance characteristics
- Data flow diagrams
- Error states

---

## License

This project specification is provided as documentation for the Hockey Shot Tracker application. Refer to the project's LICENSE file for usage terms.

---

## Support & Contact

For questions, issues, or contributions, please refer to the project repository's issue tracker and contribution guidelines.

**Version**: 1.0  
**Last Updated**: 2024  
**Maintained by**: Project Team
