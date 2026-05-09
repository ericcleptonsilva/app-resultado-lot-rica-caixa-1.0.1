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
## $(date +%Y-%m-%d) - Actionable AI Content
**Learning:** Users experience high friction when AI generates data (like numbers) that must be manually memorized and re-entered into the primary interface.
**Action:** Always provide an actionable shortcut (e.g., "Jogar Agora") alongside AI-generated content to automatically apply the results to the application state, reducing cognitive load.

## $(date +%Y-%m-%d) - Dynamic Accessibility Properties
**Learning:** React re-renders can sometimes cause standard `disabled` attributes on buttons to drop temporarily or not be read correctly during complex async transitions.
**Action:** When dynamically disabling interactive elements for loading states, always explicitly pair the native `disabled={condition}` with `aria-disabled={condition}` for maximum screen reader compatibility.
