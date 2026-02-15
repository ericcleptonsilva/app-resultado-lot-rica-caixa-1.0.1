## 2026-02-09 - Accessible Number Grids
**Learning:** Interactive number grids built with `div`s and `onClick` are completely inaccessible to keyboard users and screen readers.
**Action:** Always use `<button type="button">` for interactive grid items and reset default button styles (`appearance: none`, `padding: 0`, `border: none`) to maintain design fidelity while gaining semantic benefits and keyboard focus.

## 2026-10-25 - Inline Destructive Actions
**Learning:** Using browser alerts for confirmation feels jarring and outdated. Inline confirmation (swapping the button) keeps context and flow.
**Action:** For list items, use a local state (e.g., `deletingId`) to render confirmation buttons in place of the action button, maintaining spatial context.

## 2026-10-25 - Strategic Complexity vs Simplicity
**Learning:** Users want "advanced" features like Gail Howard's strategies but don't want to configure complex parameters.
**Action:** Encapsulate complex logic (Sum ranges, Even/Odd ratios) into a simple "Smart Pick" button that "just works", providing immediate value without friction.

## 2027-02-14 - Semantic Tab Navigation
**Learning:** Standard "button-based" tabs fail accessibility checks because screen readers perceive them as independent actions rather than a view-switching mechanism.
**Action:** Always wrap tab buttons in a `role="tablist"` container and explicitly assign `role="tab"` and `aria-selected` to the buttons. This provides crucial context about the relationship between the controls and the content.
