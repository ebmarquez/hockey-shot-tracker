# Copilot Agent Prompts

Copy the appropriate prompt when assigning an issue to a Copilot agent.

---

## Issue #2: Editable Team Names

```
Implement editable team names for the Hockey Shot Tracker app.

## Context
This is a React 19 + TypeScript + Tailwind CSS app for tracking hockey shots. The app uses React Context (GameContext) for state management with useReducer pattern. All state changes must persist to sessionStorage.

## Task
Allow users to click on team names ("Home"/"Away") in the statistics display to edit them inline.

## Requirements
1. Add a new action `SET_TEAM_NAME` to GameContext reducer in `src/context/GameContext.tsx`
2. In `src/App.tsx`, make team names clickable to enter edit mode
3. Show an input field when editing, pre-filled with current name
4. Save on Enter key or blur (click outside)
5. Cancel on Escape key
6. Reject empty names (revert to previous value)
7. Persist updated names to sessionStorage immediately

## Acceptance Criteria
- [ ] Clicking team name activates inline edit mode
- [ ] Input appears with current name selected
- [ ] Enter saves the new name
- [ ] Blur saves the new name
- [ ] Escape cancels edit
- [ ] Empty names rejected
- [ ] Names persist across page refresh

## Code Patterns to Follow
- Use discriminated union for action types
- Use `import type` for type imports
- Functional components with React.FC
- Tailwind classes only (no custom CSS)
- Minimum touch target 44px

## Testing
Run `npm test` after implementation. Add tests in a new file `src/components/EditableTeamName/EditableTeamName.test.tsx` if creating a separate component.

## Files
- Modify: `src/context/GameContext.tsx` - Add SET_TEAM_NAME action
- Modify: `src/App.tsx` - Add inline edit UI and handlers
- Optional: Create `src/components/EditableTeamName/EditableTeamName.tsx`
```

---

## Issue #3: Shooting Percentage Display

```
Add shooting percentage display to the Hockey Shot Tracker statistics cards.

## Context
This is a React 19 + TypeScript + Tailwind CSS app. Statistics are displayed in `src/App.tsx` for each team showing shots and goals.

## Task
Display shooting percentage (goals/shots × 100) for each team in the team statistics section.

## Requirements
1. Calculate shooting percentage: `(goals / shots) * 100`
2. Handle division by zero - show "0.0%" when no shots
3. Format to one decimal place using `toFixed(1)`
4. Display in both current period stats and game total stats
5. Use tabular-nums font feature for number alignment

## Acceptance Criteria
- [ ] Percentage displayed as "XX.X%" format
- [ ] Shows "0.0%" with zero shots
- [ ] Updates in real-time when shots/goals added
- [ ] Shown for current period and game totals
- [ ] Numbers align properly (tabular figures)

## Code Pattern
```typescript
const calculateShootingPercentage = (goals: number, shots: number): string => {
  if (shots === 0) return '0.0%';
  return ((goals / shots) * 100).toFixed(1) + '%';
};
```

## Styling
Use Tailwind class `tabular-nums` for number alignment:
```tsx
<span className="tabular-nums">20.0%</span>
```

## Files
- Modify: `src/App.tsx` - Add percentage calculation and display

## Testing
Run `npm test` and `npm run lint` after implementation.
```

---

## Issue #4: Per-Period Breakdown in Team Stats

```
Add per-period shot and goal breakdown to team statistics cards.

## Context
This is a React 19 + TypeScript + Tailwind CSS app. Shot data includes a `period` field (1 | 2 | 3 | 'OT'). Statistics are in `src/App.tsx`.

## Task
Show a breakdown of goals and shots for each period (1st, 2nd, 3rd, OT) in each team's statistics card.

## Requirements
1. Filter shots by team AND period to calculate per-period stats
2. Display format: "1st: 1G / 5S" for each period
3. Only show periods that have at least one shot
4. Update in real-time as shots are recorded
5. Style consistently with existing stats (smaller text, indented)

## Acceptance Criteria
- [ ] Shows breakdown for periods with shots
- [ ] Hides periods without shots
- [ ] Format: "1st: XG / XS"
- [ ] Updates when shots added
- [ ] Handles OT period correctly

## Code Pattern
```typescript
const getPeriodsWithShots = (shots: Shot[], team: 'home' | 'away') => {
  const periods: (1 | 2 | 3 | 'OT')[] = [1, 2, 3, 'OT'];
  return periods.map(period => {
    const periodShots = shots.filter(s => s.team === team && s.period === period);
    const goals = periodShots.filter(s => s.result === 'goal').length;
    return { period, shots: periodShots.length, goals };
  }).filter(p => p.shots > 0);
};

const getPeriodLabel = (period: 1 | 2 | 3 | 'OT'): string => {
  if (period === 'OT') return 'OT';
  return ['1st', '2nd', '3rd'][period - 1];
};
```

## Files
- Modify: `src/App.tsx` - Add period breakdown section to team stats cards

## Testing
Run `npm test` and `npm run lint` after implementation.
```

---

## Issue #5: Delete Shot on Click

```
Implement delete shot functionality with confirmation dialog.

## Context
This is a React 19 + TypeScript + Tailwind CSS app. Shots are displayed as markers on the rink via `ShotMarker` component. State is managed in GameContext with useReducer.

## Task
Allow users to delete a shot by clicking its marker, with a confirmation dialog showing shot details.

## Requirements
1. Add `DELETE_SHOT` action to GameContext reducer
2. Make ShotMarker clickable (add onClick prop)
3. Create DeleteShotDialog component with shot details
4. Show dialog on marker click with: team, period, result, timestamp
5. Cancel button closes without deleting
6. Delete button removes shot and closes dialog
7. Update statistics immediately after deletion
8. Add cursor pointer on marker hover

## Acceptance Criteria
- [ ] Clicking marker opens delete dialog
- [ ] Dialog shows shot details (team, period, result, time)
- [ ] Cancel closes dialog without deleting
- [ ] Delete removes shot and closes dialog
- [ ] Statistics update after deletion
- [ ] Marker disappears from rink
- [ ] Cursor changes to pointer on hover

## Files to Create
- `src/components/DeleteShotDialog/DeleteShotDialog.tsx`

## Files to Modify
- `src/context/GameContext.tsx` - Add DELETE_SHOT action
- `src/components/ShotMarker/ShotMarker.tsx` - Add onClick handler
- `src/App.tsx` - Add dialog state and handlers

## Component Interface
```typescript
interface DeleteShotDialogProps {
  shot: Shot | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (shotId: string) => void;
}
```

## GameContext Action
```typescript
| { type: 'DELETE_SHOT'; payload: { shotId: string } }
```

## Testing
Run `npm test` and `npm run lint` after implementation.
```

---

## Issue #6: Toast Notifications

```
Implement toast notification system for user feedback.

## Context
This is a React 19 + TypeScript + Tailwind CSS app. Need a toast system for shot recorded, goal scored, period changed, and shot deleted events.

## Task
Create a toast notification system that shows feedback messages at the bottom of the screen.

## Requirements
1. Create ToastContext with showToast function
2. Create Toast component for rendering notifications
3. Toast appears at bottom center of screen
4. Auto-dismiss after 3 seconds (5 seconds for goals)
5. Different styles: success (green), info (blue), celebration (gold/yellow)
6. Stack multiple toasts with gap
7. Animation: slide up, fade out

## Acceptance Criteria
- [ ] Toast appears at bottom of screen
- [ ] Auto-dismisses after timeout
- [ ] Different styles for success/info/celebration
- [ ] "Shot recorded" on shot entry
- [ ] "🎉 Goal!" on goal entry (longer display)
- [ ] "Period changed to X" on period switch
- [ ] "Shot deleted" on shot deletion
- [ ] Toasts stack if multiple triggered

## Files to Create
- `src/components/Toast/Toast.tsx`
- `src/context/ToastContext.tsx`

## Files to Modify
- `src/main.tsx` - Wrap app with ToastProvider
- `src/App.tsx` - Trigger toasts on actions

## ToastContext Interface
```typescript
type ToastType = 'success' | 'info' | 'celebration';

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
}
```

## Toast Component
```typescript
interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}
```

## Styling
- Position: fixed bottom-4 left-1/2 -translate-x-1/2
- Animation: animate-slide-up (define in Tailwind)
- Success: bg-green-500 text-white
- Info: bg-blue-500 text-white
- Celebration: bg-yellow-400 text-black

## Testing
Run `npm test` and `npm run lint` after implementation.
```

---

## Issue #7: Period-Filtered Rink View

```
Filter rink shot markers to show only current period shots.

## Context
This is a React 19 + TypeScript + Tailwind CSS app. Shots are passed to the Rink component and displayed as markers. Current period is tracked in state.

## Task
Filter shot markers on the rink to show only shots from the currently selected period.

## Requirements
1. Filter shots array before passing to Rink component
2. Use: `shots.filter(shot => shot.period === currentPeriod)`
3. Switching periods updates displayed shots immediately
4. All shots remain in state (just filtered for display)
5. Statistics should still show game totals where appropriate

## Acceptance Criteria
- [ ] Rink shows only current period shots
- [ ] Switching periods updates display immediately
- [ ] All shots preserved in state
- [ ] Total game statistics unaffected

## Files to Modify
- `src/App.tsx` - Filter shots before passing to Rink

## Code Pattern
```typescript
// In App.tsx where Rink is rendered
const currentPeriodShots = game.shots.filter(
  shot => shot.period === currentPeriod
);

<Rink
  shots={currentPeriodShots}
  onShotLocation={handleShotLocation}
/>
```

## Testing
Run `npm test` and `npm run lint` after implementation.
```

---

## Issue #8: Zone Labels on Rink

```
Add "Home Zone" and "Away Zone" labels below the ice rink.

## Context
This is a React 19 + TypeScript + Tailwind CSS app. The Rink component renders an SVG ice rink. Following NHL convention, home team attacks the right side.

## Task
Add zone labels below the rink indicating which side is which team's zone.

## Requirements
1. "Away Zone" label on left side
2. "Home Zone" label on right side  
3. Style: gray text, small font
4. Position below the rink SVG
5. If team names are customized, show "[Team Name] Zone"
6. Labels update when team names change

## Acceptance Criteria
- [ ] "Away Zone" on left, "Home Zone" on right
- [ ] Styled subtly (gray, small)
- [ ] Shows custom team names if set
- [ ] Updates when names change

## Files to Modify
- `src/components/Rink/Rink.tsx` - Add labels below SVG
- `src/App.tsx` - Pass team names to Rink if needed

## Props to Add (if needed)
```typescript
interface RinkProps {
  // existing props...
  homeTeamName?: string;
  awayTeamName?: string;
}
```

## Layout
```tsx
<div>
  {/* Existing SVG rink */}
  <svg>...</svg>
  
  {/* Zone labels */}
  <div className="flex justify-between px-4 mt-1">
    <span className="text-gray-400 text-sm">
      {awayTeamName || 'Away'} Zone
    </span>
    <span className="text-gray-400 text-sm">
      {homeTeamName || 'Home'} Zone
    </span>
  </div>
</div>
```

## Testing
Run `npm test` and `npm run lint` after implementation.
```

---

## Issue #9: Shot Count Below Rink

```
Display shot count for current period below the rink.

## Context
This is a React 19 + TypeScript + Tailwind CSS app. Need to show users how many shots have been recorded in the current period.

## Task
Add text below the rink showing "X shots recorded in [period] period".

## Requirements
1. Format: "X shots recorded in 1st period"
2. Update in real-time when shots added/removed
3. Show "0 shots recorded" when empty
4. Position below rink, above Undo button
5. Period labels: "1st", "2nd", "3rd", "OT"
6. Handle singular vs plural: "1 shot" vs "2 shots"

## Acceptance Criteria
- [ ] Shows correct count for current period
- [ ] Updates on shot added
- [ ] Updates on shot deleted
- [ ] Shows 0 when no shots
- [ ] Correct period name displayed
- [ ] Proper grammar (shot vs shots)

## Files to Modify
- `src/App.tsx` - Add shot count display

## Code Pattern
```typescript
const getPeriodName = (period: 1 | 2 | 3 | 'OT'): string => {
  if (period === 'OT') return 'OT';
  return ['1st', '2nd', '3rd'][period - 1];
};

const currentPeriodShotCount = game.shots.filter(
  s => s.period === currentPeriod
).length;

// In JSX
<p className="text-gray-500 text-sm text-center mt-2">
  {currentPeriodShotCount} {currentPeriodShotCount === 1 ? 'shot' : 'shots'} recorded in {getPeriodName(currentPeriod)} period
</p>
```

## Testing
Run `npm test` and `npm run lint` after implementation.
```

---

## Issue #10: End Game Dialog with Options

```
Replace confirm() with a styled end game dialog.

## Context
This is a React 19 + TypeScript + Tailwind CSS app. Currently uses browser confirm() for end game which is poor UX.

## Task
Create a proper styled dialog showing final score with options to view summary, start new game, or close.

## Requirements
1. Create EndGameDialog component
2. Show final score: "Home Team 3 - 2 Away Team"
3. Use custom team names if set
4. Three buttons: Close, New Game, View Summary
5. Close returns to game (no data loss)
6. New Game resets everything
7. View Summary opens game summary view
8. Styled consistently with other dialogs
9. Accessible: focus trap, escape to close

## Acceptance Criteria
- [ ] Shows correct final score
- [ ] Uses custom team names
- [ ] Close button returns to game
- [ ] New Game resets game
- [ ] View Summary opens summary
- [ ] No data lost on close
- [ ] Accessible (escape to close)

## Files to Create
- `src/components/EndGameDialog/EndGameDialog.tsx`

## Files to Modify
- `src/App.tsx` - Replace confirm() with EndGameDialog

## Component Interface
```typescript
interface EndGameDialogProps {
  isOpen: boolean;
  homeTeamName: string;
  awayTeamName: string;
  homeGoals: number;
  awayGoals: number;
  onClose: () => void;
  onNewGame: () => void;
  onViewSummary: () => void;
}
```

## Testing
Run `npm test` and `npm run lint` after implementation.
```

---

## Issue #11: Full Game Summary View

```
Create a comprehensive game summary view.

## Context
This is a React 19 + TypeScript + Tailwind CSS app. Need a full-screen summary showing shot maps, statistics, and shot list. Depends on Issue #10.

## Task
Create GameSummary component with mini shot maps per period, shot list, and statistics.

## Requirements
1. Full-screen overlay view
2. Final score at top
3. Mini shot map for each period (scaled-down rinks)
4. Shot list table: Period, Team, Time, Result
5. Statistics with shooting percentages
6. Close button to return
7. Scrollable on mobile
8. Export buttons accessible

## Acceptance Criteria
- [ ] Full-screen overlay
- [ ] Final score displayed
- [ ] Mini maps per period with shots
- [ ] Shot list with all details
- [ ] Statistics table
- [ ] Scrollable on mobile
- [ ] Close button works

## Files to Create
- `src/components/GameSummary/GameSummary.tsx`

## Files to Modify
- `src/App.tsx` - Add summary view state and rendering

## Component Interface
```typescript
interface GameSummaryProps {
  isOpen: boolean;
  onClose: () => void;
  game: Game;
  homeTeamName: string;
  awayTeamName: string;
}
```

## Layout Structure
```
┌─────────────────────────────────┐
│ [←] GAME SUMMARY                │
├─────────────────────────────────┤
│     Home 3 - 2 Away             │
├─────────────────────────────────┤
│ [1st map] [2nd map] [3rd map]   │
├─────────────────────────────────┤
│ SHOT LIST                       │
│ Period | Team | Time | Result   │
│ ...                             │
├─────────────────────────────────┤
│ STATISTICS                      │
│ Shots: 15 - 12                  │
│ Sh%: 20.0% - 16.7%              │
├─────────────────────────────────┤
│ [PNG] [PDF] [Share]             │
└─────────────────────────────────┘
```

## Testing
Run `npm test` and `npm run lint` after implementation.
```

---

## Issue #12: Share Functionality

```
Add share button using Web Share API with fallback.

## Context
This is a React 19 + TypeScript + Tailwind CSS app. Need to share game summary via native share on mobile or download on desktop. Depends on Issue #11.

## Task
Add share functionality to game summary using Web Share API with fallback options.

## Requirements
1. Share button in game summary
2. Use Web Share API on supported devices
3. Check file share support with navigator.canShare
4. Share summary image with caption
5. Caption: "Hockey Game: Home 3 - 2 Away"
6. Fallback: download image on desktop
7. Handle share cancellation gracefully

## Acceptance Criteria
- [ ] Share button visible in summary
- [ ] Uses Web Share API when available
- [ ] Fallback download on unsupported devices
- [ ] Generates shareable image
- [ ] Score in share caption
- [ ] Handles cancellation gracefully

## Files to Create
- `src/utils/share.ts`

## Files to Modify
- `src/components/GameSummary/GameSummary.tsx` - Add share button

## Share Utility
```typescript
export const canShare = (): boolean => {
  return typeof navigator.share !== 'undefined';
};

export const canShareFiles = async (file: File): Promise<boolean> => {
  if (!navigator.canShare) return false;
  return navigator.canShare({ files: [file] });
};

export const shareGameSummary = async (
  element: HTMLElement,
  title: string,
  text: string
): Promise<boolean> => {
  try {
    const canvas = await html2canvas(element, { scale: 2 });
    const blob = await new Promise<Blob>((resolve) =>
      canvas.toBlob((b) => resolve(b!), 'image/png')
    );
    const file = new File([blob], 'game-summary.png', { type: 'image/png' });
    
    if (await canShareFiles(file)) {
      await navigator.share({ title, text, files: [file] });
      return true;
    }
    // Fallback: download
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'game-summary.png';
    a.click();
    URL.revokeObjectURL(url);
    return true;
  } catch (err) {
    if ((err as Error).name === 'AbortError') return false;
    throw err;
  }
};
```

## Testing
Run `npm test` and `npm run lint` after implementation. Test on iOS Safari and Android Chrome.
```

---

## Issue #13: Pinch-to-Zoom on Rink

```
Implement pinch-to-zoom gesture for the ice rink on mobile.

## Context
This is a React 19 + TypeScript + Tailwind CSS app. The Rink component needs zoom capability for mobile users.

## Task
Enable two-finger pinch gesture to zoom in/out on the rink (1x to 3x scale).

## Requirements
1. Track two touch points in onTouchStart/onTouchMove
2. Calculate distance between touches
3. Scale: newScale = initialScale * (currentDistance / initialDistance)
4. Clamp scale between 1x and 3x
5. Smooth zoom animation with CSS transform
6. Don't trigger shot placement on pinch
7. Reset zoom when scale returns near 1x
8. Center zoom on pinch midpoint

## Acceptance Criteria
- [ ] Pinch out zooms in
- [ ] Pinch in zooms out
- [ ] Scale clamped 1x-3x
- [ ] No shot on pinch gesture
- [ ] Zoom centers on midpoint
- [ ] Resets at 1x

## Files to Modify
- `src/components/Rink/Rink.tsx` - Add zoom state and touch handlers

## Optional Files to Create
- `src/hooks/usePinchZoom.ts` - Reusable hook

## Code Pattern
```typescript
const [scale, setScale] = useState(1);
const initialDistance = useRef<number | null>(null);
const initialScale = useRef(1);

const getTouchDistance = (touches: TouchList): number => {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
};

const handleTouchStart = (e: React.TouchEvent) => {
  if (e.touches.length === 2) {
    initialDistance.current = getTouchDistance(e.touches);
    initialScale.current = scale;
    e.preventDefault();
  }
};

const handleTouchMove = (e: React.TouchEvent) => {
  if (e.touches.length === 2 && initialDistance.current) {
    const currentDistance = getTouchDistance(e.touches);
    const newScale = initialScale.current * (currentDistance / initialDistance.current);
    setScale(Math.min(3, Math.max(1, newScale)));
    e.preventDefault();
  }
};

// Apply with CSS transform
<div style={{ transform: `scale(${scale})` }}>
```

## Testing
Run `npm test` and `npm run lint`. Manual test on iOS and Android devices.
```

---

## Issue #14: Pan When Zoomed

```
Enable pan gesture when rink is zoomed in.

## Context
This is a React 19 + TypeScript + Tailwind CSS app. Depends on Issue #13 (pinch-to-zoom). When zoomed, users need to pan to see different areas.

## Task
Enable single-finger drag to pan when scale > 1x.

## Requirements
1. Track single touch drag when zoomed > 1x
2. Calculate offset from touch movement
3. Constrain pan to rink boundaries
4. Smooth pan following touch
5. Disable pan when scale = 1x
6. Movement threshold to distinguish tap from pan (10px)
7. Allow shot placement on tap (not drag)

## Acceptance Criteria
- [ ] Pan on drag when zoomed
- [ ] No pan at scale 1x
- [ ] Constrained to boundaries
- [ ] Smooth touch following
- [ ] Shot placement still works on tap

## Files to Modify
- `src/components/Rink/Rink.tsx` - Add pan state and handlers

## Code Pattern
```typescript
const [offset, setOffset] = useState({ x: 0, y: 0 });
const [isPanning, setIsPanning] = useState(false);
const startTouch = useRef<{ x: number; y: number } | null>(null);
const MOVEMENT_THRESHOLD = 10;

const constrainOffset = (x: number, y: number, scale: number, size: { w: number; h: number }) => {
  const maxX = ((scale - 1) * size.w) / 2;
  const maxY = ((scale - 1) * size.h) / 2;
  return {
    x: Math.max(-maxX, Math.min(maxX, x)),
    y: Math.max(-maxY, Math.min(maxY, y)),
  };
};

const handleTouchStart = (e: React.TouchEvent) => {
  if (e.touches.length === 1 && scale > 1) {
    startTouch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    setIsPanning(false);
  }
};

const handleTouchMove = (e: React.TouchEvent) => {
  if (e.touches.length === 1 && startTouch.current && scale > 1) {
    const dx = e.touches[0].clientX - startTouch.current.x;
    const dy = e.touches[0].clientY - startTouch.current.y;
    
    if (!isPanning && (Math.abs(dx) > MOVEMENT_THRESHOLD || Math.abs(dy) > MOVEMENT_THRESHOLD)) {
      setIsPanning(true);
    }
    
    if (isPanning) {
      setOffset(prev => constrainOffset(prev.x + dx, prev.y + dy, scale, containerSize));
      startTouch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      e.preventDefault();
    }
  }
};

const handleTouchEnd = (e: React.TouchEvent) => {
  if (!isPanning && startTouch.current) {
    // This was a tap, not a pan - handle shot placement
    handleShotPlacement(e);
  }
  startTouch.current = null;
  setIsPanning(false);
};

// Apply with CSS transform
<div style={{ transform: `scale(${scale}) translate(${offset.x}px, ${offset.y}px)` }}>
```

## Testing
Run `npm test` and `npm run lint`. Manual test on iOS and Android devices.
```

---

## Usage Instructions

1. Go to the GitHub issue you want to assign
2. Copy the corresponding prompt above
3. Assign to Copilot coding agent with `@github-copilot-coding-agent` or use the "Assign to Copilot" button
4. Paste the prompt as the issue body or comment
5. Monitor the PR created by the agent

## General Agent Instructions

Include these with any prompt if needed:

```
## Project Standards
- React 19 + TypeScript 5.9 + Tailwind v4 + Vite 7
- Functional components with React.FC
- Use `import type` for type-only imports
- No `any` types - explicit typing required
- Tailwind utilities only - no custom CSS
- Mobile-first responsive design
- Touch targets minimum 44px
- Persist state to sessionStorage after mutations
- Run `npm test` and `npm run lint` before committing

## File Patterns
- Components: `src/components/Name/Name.tsx`
- Context: `src/context/NameContext.tsx`
- Utils: `src/utils/name.ts`
- Types: `src/types/index.ts`

## Commit Convention
- feat: new feature
- fix: bug fix
- chore: maintenance
- docs: documentation
```
