## 2026-02-09 - Accessible Number Grids
**Learning:** Interactive number grids built with `div`s and `onClick` are completely inaccessible to keyboard users and screen readers.
**Action:** Always use `<button type="button">` for interactive grid items and reset default button styles (`appearance: none`, `padding: 0`, `border: none`) to maintain design fidelity while gaining semantic benefits and keyboard focus.

## 2026-10-25 - Inline Destructive Actions
**Learning:** Using browser alerts for confirmation feels jarring and outdated. Inline confirmation (swapping the button) keeps context and flow.
**Action:** For list items, use a local state (e.g., `deletingId`) to render confirmation buttons in place of the action button, maintaining spatial context.

## 2026-10-25 - Strategic Complexity vs Simplicity
**Learning:** Users want "advanced" features like Gail Howard's strategies but don't want to configure complex parameters.
**Action:** Encapsulate complex logic (Sum ranges, Even/Odd ratios) into a simple "Smart Pick" button that "just works", providing immediate value without friction.

## 2026-10-25 - Accessible Tabs Navigation
**Learning:** Custom tab implementations using `div`s and `button`s lack semantic meaning for screen readers. Users rely on `role="tablist"`, `role="tab"`, and `role="tabpanel"` to understand the structure.
**Action:** Always wrap tab buttons in a container with `role="tablist"` and use `aria-selected` and `aria-controls`. Wrap content in `role="tabpanel"` and link via `aria-labelledby`.

## 2026-10-26 - Ligature Font Icons Accessibility
**Learning:** Screen readers announce ligature-based font icons (like Google Material Icons) as their raw text values (e.g., "auto_fix_high", "psychology") when used decoratively alongside text labels, creating a confusing and redundant auditory experience.
**Action:** Always add `aria-hidden="true"` to ligature font icon elements (e.g., `<span className="material-icons" aria-hidden="true">`) to ensure they remain strictly visual.

## 2026-10-26 - Accessible Async Button States
**Learning:** Simply setting `disabled={true}` on a button during async operations is insufficient. Screen readers may not promptly announce the state change, and default disabled styling is often too subtle.
**Action:** Enhance async buttons by combining `disabled` with `aria-disabled`, providing immediate visual feedback through dynamic inline styles (`cursor: 'not-allowed'`, `opacity: 0.7`), and wrapping the actionable area in an `aria-live="polite"` container with `aria-busy` to proactively inform screen readers of the loading state.
