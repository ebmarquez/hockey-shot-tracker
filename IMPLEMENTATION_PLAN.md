# Hockey Shot Tracker - Implementation Plan

## Overview

This document outlines the implementation plan to align the Hockey Shot Tracker application with the specifications defined in `project spec.md` and `ascii-example-spec.md`.

**Repository:** ebmarquez/hockey-shot-tracker  
**Target Completion:** Phased rollout over 4 phases

---

## Current State vs Target State

### ✅ Already Implemented
- Interactive ice rink with click-to-add shots
- Period selector (1st, 2nd, 3rd, OT)
- Basic team statistics display (current period shots/goals, game totals)
- Shot form modal (Goal/Save/Miss/Blocked options)
- Shot markers on rink (SVG-based, team-colored)
- Reset game and End game buttons
- Undo last shot functionality
- Home/Away team auto-assignment based on click position (NHL convention)
- GitHub Pages deployment workflow
- Vitest testing infrastructure

### ❌ Missing Features (To Be Implemented)

| Phase | Feature | Priority |
|-------|---------|----------|
| 1 | Editable Team Names | High |
| 1 | Shooting Percentage Display | High |
| 1 | Per-Period Breakdown in Stats | High |
| 1 | Delete Shot on Click | High |
| 1 | Toast Notifications | High |
| 2 | Period-Filtered Rink View | Medium |
| 2 | Zone Labels on Rink | Medium |
| 2 | Shot Count Below Rink | Medium |
| 3 | End Game Dialog with Summary | Medium |
| 3 | Full Game Summary View | Medium |
| 3 | Share Functionality | Medium |
| 4 | Pinch-to-Zoom (Mobile) | Lower |
| 4 | Pan When Zoomed (Mobile) | Lower |

---

## Phase 1: Core UX Improvements

### Issue #1: Editable Team Names

**Description:**  
Allow users to edit team names by clicking on the team name in the statistics card. The name should become an inline editable input field.

**Files to Modify:**
- `src/App.tsx` - Add inline edit state and handlers
- `src/context/GameContext.tsx` - Add `setTeamName` action

**Acceptance Criteria:**
- [ ] Clicking on team name ("Home" or "Away") activates inline edit mode
- [ ] Input field appears with current team name selected
- [ ] Pressing Enter saves the new name
- [ ] Clicking outside the input saves the new name
- [ ] Pressing Escape cancels the edit
- [ ] Empty names are rejected (revert to previous)
- [ ] Team names persist across page refreshes (sessionStorage)
- [ ] Updated names appear throughout the UI

**Test Validation:**
```typescript
describe('Editable Team Names', () => {
  it('should enter edit mode on team name click')
  it('should save name on Enter key')
  it('should save name on blur')
  it('should cancel edit on Escape')
  it('should reject empty names')
  it('should persist names to storage')
})
```

---

### Issue #2: Shooting Percentage Display

**Description:**  
Display shooting percentage (goals/shots × 100) for each team in the statistics card.

**Files to Modify:**
- `src/App.tsx` - Add shooting percentage calculation and display

**Acceptance Criteria:**
- [ ] Shooting percentage displayed as "XX.X%" format
- [ ] Shows "0.0%" when team has no shots
- [ ] Updates in real-time when shots/goals are added
- [ ] Displayed in both current period and game total sections
- [ ] Uses monospace/tabular font for number alignment

**Test Validation:**
```typescript
describe('Shooting Percentage', () => {
  it('should calculate 0.0% with no shots')
  it('should calculate correct percentage (goals/shots * 100)')
  it('should format to one decimal place')
  it('should update when shot is added')
  it('should update when goal is added')
})
```

---

### Issue #3: Per-Period Breakdown in Team Stats

**Description:**  
Show breakdown of goals and shots for each period (1st, 2nd, 3rd, OT) in the team statistics card.

**Files to Modify:**
- `src/App.tsx` - Add period breakdown section to team cards

**Acceptance Criteria:**
- [ ] Display format: "1st Period: 1G / 5S"
- [ ] Show all periods that have data
- [ ] Update in real-time as shots are recorded
- [ ] Styled consistently with existing stats
- [ ] Only show periods with at least one shot

**Test Validation:**
```typescript
describe('Per-Period Breakdown', () => {
  it('should show period breakdown for periods with shots')
  it('should not show periods without shots')
  it('should format as "XG / XS"')
  it('should update when shots are added')
})
```

---

### Issue #4: Delete Shot on Click

**Description:**  
Allow users to delete a shot by clicking on its marker on the rink. A confirmation dialog should appear with shot details.

**Files to Create:**
- `src/components/DeleteShotDialog/DeleteShotDialog.tsx`

**Files to Modify:**
- `src/components/ShotMarker/ShotMarker.tsx` - Add click handler
- `src/context/GameContext.tsx` - Add `deleteShot` action
- `src/App.tsx` - Add delete dialog state and handlers

**Acceptance Criteria:**
- [ ] Clicking shot marker opens delete confirmation dialog
- [ ] Dialog shows shot details: team, period, result, timestamp
- [ ] "Cancel" button closes dialog without deleting
- [ ] "Delete" button removes shot and closes dialog
- [ ] Statistics update immediately after deletion
- [ ] Shot marker disappears from rink
- [ ] Cursor changes to pointer on marker hover

**Test Validation:**
```typescript
describe('Delete Shot', () => {
  it('should open dialog on shot marker click')
  it('should display correct shot details in dialog')
  it('should delete shot on confirm')
  it('should close dialog on cancel')
  it('should update statistics after deletion')
  it('should remove marker from rink')
})
```

---

### Issue #5: Toast Notifications

**Description:**  
Show toast notifications for user actions: shot recorded, goal scored, period changed, shot deleted, game reset.

**Files to Create:**
- `src/components/Toast/Toast.tsx`
- `src/context/ToastContext.tsx`

**Files to Modify:**
- `src/App.tsx` - Integrate toast provider and triggers

**Acceptance Criteria:**
- [ ] Toast appears at bottom of screen
- [ ] Auto-dismisses after 3 seconds
- [ ] Different styles for success/info/warning
- [ ] "Shot recorded" on shot entry
- [ ] "🎉 Goal scored!" on goal entry (slightly longer display)
- [ ] "Period changed to X" on period switch
- [ ] "Shot deleted" on shot deletion
- [ ] Toasts stack if multiple triggered quickly

**Test Validation:**
```typescript
describe('Toast Notifications', () => {
  it('should show toast on shot recorded')
  it('should show goal toast with celebration')
  it('should show period change toast')
  it('should auto-dismiss after timeout')
  it('should stack multiple toasts')
})
```

---

## Phase 2: Enhanced Statistics & Display

### Issue #6: Period-Filtered Rink View

**Description:**  
Filter shot markers on the rink to show only shots from the currently selected period.

**Files to Modify:**
- `src/App.tsx` - Filter shots passed to Rink component

**Acceptance Criteria:**
- [ ] Rink shows only shots from current period by default
- [ ] Switching periods updates displayed shots immediately
- [ ] Option to show "All periods" (future enhancement)
- [ ] Smooth transition when filtering

**Test Validation:**
```typescript
describe('Period Filter', () => {
  it('should show only current period shots')
  it('should update on period change')
  it('should preserve shots when switching back')
})
```

---

### Issue #7: Zone Labels on Rink

**Description:**  
Add "Home Zone" and "Away Zone" labels below the rink to indicate which side is which.

**Files to Modify:**
- `src/components/Rink/Rink.tsx` - Add zone labels
- `src/App.tsx` - Pass team names to Rink if needed

**Acceptance Criteria:**
- [ ] "Home Zone" label on right side of rink
- [ ] "Away Zone" label on left side of rink
- [ ] Labels styled subtly (gray text, small font)
- [ ] Labels include team name if customized

**Test Validation:**
```typescript
describe('Zone Labels', () => {
  it('should display Home Zone on right')
  it('should display Away Zone on left')
  it('should include custom team names')
})
```

---

### Issue #8: Shot Count Below Rink

**Description:**  
Display the number of shots recorded in the current period below the rink.

**Files to Modify:**
- `src/App.tsx` - Add shot count display below Rink

**Acceptance Criteria:**
- [ ] Format: "X shots recorded in [period] period"
- [ ] Updates in real-time as shots are added/removed
- [ ] Shows "0 shots recorded" when empty
- [ ] Positioned below rink, above undo button

**Test Validation:**
```typescript
describe('Shot Count Display', () => {
  it('should show correct count for current period')
  it('should update on shot added')
  it('should update on shot deleted')
  it('should show 0 when no shots')
})
```

---

## Phase 3: Game Summary & Export

### Issue #9: End Game Dialog with Options

**Description:**  
Replace simple confirm() with a proper dialog showing final score and options to view summary or continue.

**Files to Create:**
- `src/components/EndGameDialog/EndGameDialog.tsx`

**Files to Modify:**
- `src/App.tsx` - Replace confirm with dialog component

**Acceptance Criteria:**
- [ ] Dialog shows final score: "Home Team 3 - 2 Away Team"
- [ ] "View Summary" button opens full game summary
- [ ] "Close" button dismisses dialog and returns to game
- [ ] Dialog styled consistently with other dialogs
- [ ] No data is lost when dialog is closed

**Test Validation:**
```typescript
describe('End Game Dialog', () => {
  it('should display correct final score')
  it('should open summary on View Summary click')
  it('should close dialog on Close click')
  it('should not reset game data')
})
```

---

### Issue #10: Full Game Summary View

**Description:**  
Create a full-screen game summary view with shot maps for each period, shot list, and statistics.

**Files to Create:**
- `src/components/GameSummary/GameSummary.tsx`

**Files to Modify:**
- `src/App.tsx` - Add summary view state and rendering

**Acceptance Criteria:**
- [ ] Full-screen overlay/view
- [ ] Final score at top
- [ ] Shot map for each period (mini rinks)
- [ ] Detailed shot list with: period, team, time, result
- [ ] Statistics table with shooting percentages
- [ ] Close button to return to game
- [ ] Scrollable on mobile

**Test Validation:**
```typescript
describe('Game Summary', () => {
  it('should display final score')
  it('should show shot maps for each period')
  it('should list all shots with details')
  it('should show correct statistics')
  it('should close on close button click')
})
```

---

### Issue #11: Share Functionality

**Description:**  
Add share button to game summary that uses Web Share API on mobile or provides fallback options.

**Files to Modify:**
- `src/components/GameSummary/GameSummary.tsx` - Add share button
- `src/utils/exportImage.ts` - May need updates for share-ready format

**Acceptance Criteria:**
- [ ] Share button visible in summary view
- [ ] Uses Web Share API on supported devices
- [ ] Fallback: copy to clipboard or download image
- [ ] Shares summary image or text
- [ ] Works on iOS and Android

**Test Validation:**
```typescript
describe('Share Functionality', () => {
  it('should trigger Web Share API when available')
  it('should provide fallback when API unavailable')
  it('should generate shareable content')
})
```

---

## Phase 4: Mobile Optimization

### Issue #12: Pinch-to-Zoom on Rink

**Description:**  
Enable pinch-to-zoom gesture on the rink for mobile users to zoom in on shot locations.

**Files to Modify:**
- `src/components/Rink/Rink.tsx` - Add pinch zoom handler

**Acceptance Criteria:**
- [ ] Two-finger pinch gesture zooms in/out
- [ ] Zoom range: 1x (default) to 3x (maximum)
- [ ] Smooth zoom animation
- [ ] Zoom resets when scale returns to 1x
- [ ] Does not interfere with tap-to-add shots

**Test Validation:**
```typescript
describe('Pinch to Zoom', () => {
  it('should zoom in on pinch out gesture')
  it('should zoom out on pinch in gesture')
  it('should clamp to min/max scale')
  it('should not trigger shot on pinch')
})
```

---

### Issue #13: Pan When Zoomed

**Description:**  
Enable pan gesture when rink is zoomed to allow viewing different areas.

**Files to Modify:**
- `src/components/Rink/Rink.tsx` - Add pan handler when zoomed

**Acceptance Criteria:**
- [ ] Single-finger drag pans when zoomed > 1x
- [ ] Panning constrained to rink boundaries
- [ ] Smooth pan following touch
- [ ] Pan disabled when scale = 1x
- [ ] Does not interfere with tap-to-add shots

**Test Validation:**
```typescript
describe('Pan When Zoomed', () => {
  it('should pan on drag when zoomed')
  it('should not pan when scale is 1x')
  it('should constrain to boundaries')
  it('should follow touch smoothly')
})
```

---

## Agent Requirements

### For Each Issue:

1. **Read the full issue description** including acceptance criteria
2. **Check referenced files** before making changes
3. **Follow existing code patterns** (see `.github/copilot-instructions.md`)
4. **Write tests** that validate all acceptance criteria
5. **Run `npm test`** to ensure tests pass
6. **Run `npm run lint`** to ensure code quality
7. **Test manually** in browser with `npm run dev`
8. **Commit with conventional commit message** (feat: / fix: / chore:)

### Code Standards:
- TypeScript strict mode
- Functional components with React.FC
- Tailwind CSS for styling (no custom CSS)
- Import types with `import type`
- Mobile-first responsive design
- Touch targets minimum 44px
- Persist state changes to sessionStorage

### Testing Standards:
- Use Vitest for unit tests
- Use React Testing Library for component tests
- Test all acceptance criteria
- Mock sessionStorage for storage tests

---

## Issue Dependencies

```
Phase 1 (No dependencies - can be done in parallel):
  ├── Issue #1: Editable Team Names
  ├── Issue #2: Shooting Percentage
  ├── Issue #3: Per-Period Breakdown
  ├── Issue #4: Delete Shot on Click
  └── Issue #5: Toast Notifications

Phase 2 (Depends on Phase 1 completion):
  ├── Issue #6: Period-Filtered Rink View
  ├── Issue #7: Zone Labels on Rink
  └── Issue #8: Shot Count Below Rink

Phase 3 (Depends on Phase 2 completion):
  ├── Issue #9: End Game Dialog
  ├── Issue #10: Game Summary View (depends on #9)
  └── Issue #11: Share Functionality (depends on #10)

Phase 4 (Can start after Phase 1):
  ├── Issue #12: Pinch-to-Zoom
  └── Issue #13: Pan When Zoomed (depends on #12)
```

---

## Definition of Done

An issue is considered complete when:

1. ✅ All acceptance criteria are met
2. ✅ Tests written and passing (`npm test`)
3. ✅ Code linting passes (`npm run lint`)
4. ✅ Manual testing completed on desktop and mobile
5. ✅ Code reviewed and approved
6. ✅ Changes committed with proper commit message
7. ✅ PR merged to main branch
8. ✅ Deployed to GitHub Pages and verified

---

## Timeline Estimate

| Phase | Issues | Estimated Time |
|-------|--------|----------------|
| Phase 1 | #1-#5 | 1-2 weeks |
| Phase 2 | #6-#8 | 1 week |
| Phase 3 | #9-#11 | 1-2 weeks |
| Phase 4 | #12-#13 | 1 week |

**Total: 4-6 weeks**

---

## References

- [Project Specification](./project%20spec.md)
- [ASCII UI Specification](./ascii-example-spec.md)
- [Copilot Instructions](./.github/copilot-instructions.md)
- [Acceptance Criteria](./ACCEPTANCE_CRITERIA.md)
