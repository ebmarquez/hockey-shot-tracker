# IceRink Touch Mapping Tests

This test suite validates the coordinate mapping logic in the IceRink component, ensuring that touch and click events are correctly translated to SVG coordinates.

## What's Being Tested

### Desktop Click Mapping
- Verifies that mouse clicks are correctly mapped from screen coordinates to percentage coordinates (0-100)
- Tests that clicks on the left side map to the away zone (x < 50)
- Tests that clicks on the right side map to the home zone (x >= 50)

### Mobile Touch Mapping (Rotated View)
The mobile view is rotated 90 degrees, so the coordinate transformation is more complex:
- Touch coordinates must account for the rotation
- Top touches should map to the home zone (high X values)
- Bottom touches should map to the away zone (low X values)

### Transformation Formulas

For **desktop** (no rotation):
```typescript
const x = ((clientX - rect.left) / rect.width) * 100;
const y = ((clientY - rect.top) / rect.height) * 100;
```

For **mobile** (90° rotation):
```typescript
const x = ((rect.height - touchY) / rect.height) * 100;
const y = (touchX / rect.width) * 100;
```

The key insight:
- In mobile, the Y-axis becomes the X-axis (due to rotation)
- The coordinate is inverted: `(rect.height - touchY)` because touching the top should give higher X values
- The X-axis becomes the Y-axis

### Percentage to SVG Conversion

To convert from percentage space (0-100) to SVG viewBox space (200x85):
```typescript
const svgX = (percentX / 100) * 200;
const svgY = (percentY / 100) * 85;
```

### Coordinate Spaces

1. **Screen/Client Space**: Where the user touches (e.g., pixel coordinates)
2. **Element Space**: Relative to the rink element's bounding rect
3. **Percentage Space**: Normalized coordinates (0-100 for both axes)
4. **SVG ViewBox Space**: The internal coordinate system (200x85)

## Running the Tests

```bash
npm test
```

Or to run in watch mode:
```bash
npm test -- --watch
```

Or to run just the IceRink tests:
```bash
npm test Rink
```

Or to run with coverage:
```bash
npm run test:coverage
```

## Test Coverage

- ✅ Desktop click to percentage coordinate mapping
- ✅ Away zone detection (x < 50%)
- ✅ Home zone detection (x >= 50%)
- ✅ Mobile touch coordinate transformation with rotation
- ✅ Mobile home zone (top of screen → high X values)
- ✅ Mobile away zone (bottom of screen → low X values)
- ✅ Coordinate boundary validation (clamping to 0-100)
- ✅ Percentage to SVG coordinate conversion
- ✅ SVG to percentage coordinate conversion (inverse)
- ✅ Real-world scenarios (goal shots, blue line shots)

## NHL Convention

The app follows NHL broadcast convention:
- **Away team** attacks the LEFT side (x < 50 in percentage space)
- **Home team** attacks the RIGHT side (x >= 50 in percentage space)

## Files

- `src/components/Rink/Rink.test.ts` - Main test suite
- `src/utils/coordinateMapping.ts` - Coordinate mapping utility functions
- `src/test/setup.ts` - Vitest setup file

## Debugging Tips

If tests fail, check:
1. The `handleClick` function in `Rink.tsx` for coordinate calculation
2. The coordinate transformation formulas in `coordinateMapping.ts`
3. The team assignment logic in `App.tsx` (`getTeamFromPosition`)
4. Ensure bounding rect calculations are correct

## Test Structure

```
IceRink Coordinate Mapping
├── Desktop Click Mapping (6 tests)
│   ├── Center click mapping
│   ├── Corner mappings (top-left, bottom-right)
│   ├── Zone detection (left=away, right=home)
│   └── Boundary clamping
├── Mobile Touch Mapping (5 tests)
│   ├── Top touch → high X (home zone)
│   ├── Bottom touch → low X (away zone)
│   ├── Center touch mapping
│   └── Edge mappings
├── Percentage to SVG Conversion (4 tests)
├── SVG to Percentage Conversion (3 tests)
├── Team Zone Detection (6 tests)
├── Boundary Validation (3 tests)
└── Real-World Scenarios (3 tests)
```
