# GitHub Copilot Instructions - Hockey Shot Tracker

## Project Overview
Touch-first mobile web app for tracking hockey shots in real-time. Uses React + TypeScript + Tailwind with client-side storage only. No backend.

## Architecture Patterns

### State Management
- Use React Context + useReducer for global state (see `GameContext.tsx`)
- Prefer local state (`useState`) for component-specific UI state
- Persist state changes to sessionStorage immediately after mutations
- Define discriminated union types for reducer actions

**Example:**
```typescript
type GameAction =
  | { type: 'START_GAME'; payload: { homeTeam: string; awayTeam: string } }
  | { type: 'ADD_SHOT'; payload: Shot }
  | { type: 'UNDO_LAST_SHOT' };
```

### Component Structure
- One component per directory: `ComponentName/ComponentName.tsx`
- Functional components only, never class components
- Define prop interfaces inline at top of file
- Use `React.FC<PropsType>` for component typing
- Order: imports → interfaces → component → export

**Example:**
```typescript
import React from 'react';
import type { Game } from '../../types';

interface StatsProps {
  game: Game;
}

const Statistics: React.FC<StatsProps> = ({ game }) => {
  // Component logic
};

export default Statistics;
```

## TypeScript Conventions

### Type Safety
- Always use explicit types, never `any`
- Import types with `import type` for type-only imports
- Define domain types in `src/types/index.ts`
- Use type aliases for unions: `type Period = 1 | 2 | 3 | 'OT'`
- Prefer interfaces for object shapes

### Type Imports
```typescript
// Correct
import type { Game, Shot, Team } from '../types';
import { storage } from '../utils/storage';

// Wrong
import { Game, Shot, Team } from '../types';
```

## Mobile & Touch Interactions

### Touch Handlers
- Always provide both touch AND click handlers for desktop compatibility
- Use native React touch events, not third-party libraries
- Normalize coordinates to percentages (0-100) for device independence
- Support haptic feedback where available via `triggerHaptic()` utility

**Example:**
```typescript
const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
  const rect = element.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * 100;
  const y = ((e.clientY - rect.top) / rect.height) * 100;
  onLocationSelect(x, y);
};
```

### Touch Targets
- Minimum size: 44x44px (`min-h-[44px]` in Tailwind)
- Prefer 48-56px for primary actions
- Use `active:` pseudo-classes for touch feedback, not `hover:`
- No hover-only interactions

### Accessibility
```typescript
// Button example
<button className="min-h-[56px] px-6 py-4 text-lg">
  Action
</button>
```

## Styling with Tailwind CSS

### Conventions
- Use Tailwind utility classes exclusively, no custom CSS
- Mobile-first responsive design (base = mobile, then `md:`, `lg:`)
- Consistent spacing: 4px increments (p-1, p-2, p-4, etc.)
- Color palette: blue (primary), green (home team), red/orange (alerts)

### Component Styling Pattern
```typescript
<div className="bg-white rounded-lg shadow-lg p-4">
  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white 
    font-bold py-4 px-6 rounded-lg transition-colors min-h-[56px]">
    Primary Action
  </button>
</div>
```

### Grid Layouts
```typescript
// Responsive grid
<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
  {/* Content */}
</div>
```

## Data Persistence

### Storage Strategy
- **sessionStorage**: Current game data (cleared on browser close)
- **localStorage**: User preferences, recent team names (persists)
- Always wrap storage operations in try-catch
- Auto-save after every state mutation

**Pattern:**
```typescript
try {
  sessionStorage.setItem(GAME_KEY, JSON.stringify(game));
} catch (error) {
  console.error('Storage failed:', error);
}
```

### Storage Utilities
- Use functions from `src/utils/storage.ts`
- Never access localStorage/sessionStorage directly in components
- Call `storage.saveGame()` immediately after state changes

## Error Handling

### Storage Operations
```typescript
const handleExport = async () => {
  try {
    await exportToPNG(element);
  } catch (err) {
    console.error('Export error:', err);
    alert('Export failed. Please try again.');
  }
};
```

### Required Patterns
- Always catch async operations
- Log errors to console for debugging
- Show user-friendly error messages
- Never throw unhandled errors in event handlers

## Component Patterns

### Form Handling
```typescript
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  if (!homeTeam.trim() || !awayTeam.trim()) return;
  onStart(homeTeam.trim(), awayTeam.trim());
};
```

### Conditional Rendering
```typescript
// Prefer early returns
if (!game) return <GameSetup onStart={startGame} />;

// Use ternary for inline conditions
{isActive ? <ActiveGame /> : <Setup />}
```

### Event Handlers
- Name handlers with `handle` prefix: `handleClick`, `handleSubmit`
- Define handlers before JSX return
- Use arrow functions for inline handlers sparingly

## Domain-Specific Rules

### Hockey Data Model
- Periods: `1 | 2 | 3 | 'OT'` (not 4 for overtime)
- Teams: `'home' | 'away'` (never other strings)
- Shot types: `'wrist' | 'slap' | 'snap' | 'backhand' | 'tip'`
- Results: `'goal' | 'save' | 'miss' | 'blocked'`

### Coordinate System
- Rink coordinates: percentages 0-100 (x = left to right, y = top to bottom)
- Always normalize browser coordinates to percentages
- Store coordinates as floats, not pixels

### NHL Rink Specifications
The SVG rink uses a viewBox of `0 0 133.33 56.67` which maps to NHL regulation dimensions:

| Real World | ViewBox | Description |
|------------|---------|-------------|
| 200 ft × 85 ft | 133.33 × 56.67 | Full rink size |
| 11 ft | 7.33 | Goal line from end |
| 75 ft | 50.0 | Blue line from end |
| 100 ft | 66.67 | Center line |
| 30 ft | 20.0 | Faceoff circle diameter |

**Key positions:**
- Home zone: x < 66.67 (left half)
- Away zone: x > 66.67 (right half)
- Home goal: x ≈ 7.33, y = 28.33
- Away goal: x ≈ 126.0, y = 28.33

**Reference:** See [project spec.md](../project%20spec.md) and [ascii-example-spec.md](../ascii-example-spec.md) for full NHL rink specifications.

### Game State Validation
```typescript
// Always check game exists before operations
if (!state.game) return;

// Validate team selection before shot entry
if (!state.selectedTeam) {
  alert('Please select a team first');
  return;
}
```

## Export Functionality

### PNG Export
- Use html2canvas to capture rink element
- Set scale: 2 for high DPI
- Background: white (#ffffff)

### PDF Export
- Use jsPDF for multi-page reports
- Page 1: Shot chart image
- Page 2: Statistics summary
- Page 3: Detailed shot list
- Handle overtime as "OT" not "POT"

```typescript
const periodLabel = shot.period === 'OT' ? 'OT' : `P${shot.period}`;
```

## Performance Considerations

### Optimization
- Keep component re-renders minimal
- Memoize expensive calculations only when needed
- Avoid premature optimization
- Bundle size: html2canvas and jsPDF are large - acceptable trade-off

### React Patterns
```typescript
// Avoid unnecessary re-renders
const memoizedStats = useMemo(() => 
  calculateStats(game.shots), 
  [game.shots]
);
```

## Documentation

### When to Comment
- Complex game logic or calculations
- Non-obvious coordinate transformations
- Workarounds or browser-specific code
- Hockey rules that may be unfamiliar

### JSDoc Style
```typescript
/**
 * Convert touch coordinates to rink percentages (0-100)
 */
export const getTouchCoordinates = (
  event: React.TouchEvent<HTMLElement>,
  element: HTMLElement
): { x: number; y: number } => {
  // Implementation
};
```

## Testing

### Current State
- No test infrastructure currently
- Manual testing via dev server
- Verify touch interactions on mobile devices
- Test sessionStorage persistence with page refreshes

### Future Considerations
- Consider Vitest for unit tests
- Consider Playwright for E2E tests
- Test storage utilities in isolation
- Mock localStorage/sessionStorage in tests

## Common Pitfalls to Avoid

### Don't
- ❌ Use class components
- ❌ Import types without `import type`
- ❌ Access localStorage directly in components
- ❌ Use `any` type
- ❌ Create hover-only interactions
- ❌ Hard-code pixel values for touch targets
- ❌ Forget to persist state after mutations
- ❌ Use period number 4 (use 'OT' instead)

### Do
- ✅ Use functional components with hooks
- ✅ Import types with `import type`
- ✅ Use storage utility functions
- ✅ Define explicit types
- ✅ Support both touch and click
- ✅ Use Tailwind utilities for sizing
- ✅ Save to sessionStorage after state changes
- ✅ Use union type for periods: `1 | 2 | 3 | 'OT'`

## Code Review Checklist

When reviewing or generating code:
- [ ] TypeScript types are explicit (no `any`)
- [ ] Touch targets meet 44px minimum
- [ ] Both touch and click handlers present
- [ ] State persisted to sessionStorage
- [ ] Tailwind classes used (no custom CSS)
- [ ] Mobile-first responsive design
- [ ] Error handling on async operations
- [ ] Period labels show "1st", "2nd", "3rd", "OT"
- [ ] Coordinates stored as 0-100 percentages
- [ ] Component follows directory structure

## Quick Reference

### File Structure
```
src/
├── components/          # One component per directory
│   ├── ComponentName/
│   │   └── ComponentName.tsx
├── context/            # React Context providers
├── hooks/              # Custom React hooks (future)
├── types/              # TypeScript type definitions
└── utils/              # Pure utility functions
```

### Key Dependencies
- React 19 - UI framework
- TypeScript 5.9 - Type safety
- Tailwind v4 - Styling
- Vite 7 - Build tool
- html2canvas - PNG export
- jsPDF - PDF export
- uuid - Unique IDs

### Commands
```bash
npm run dev      # Development server
npm run build    # Production build
npm run lint     # ESLint check
```

## Project-Specific Context

This app is designed for real-time use during live hockey games. Prioritize:
1. **Speed**: Fast shot entry (< 3 seconds)
2. **Reliability**: Never lose data (auto-save everything)
3. **Mobile UX**: Large buttons, no fat-finger errors
4. **Offline**: Works without internet (PWA-ready)

Users are tracking shots while watching a game, often in poor lighting with gloves on. Every interaction must be forgiving and obvious.
