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

## 2026-10-25 - Ligature Icons and Screen Readers
**Learning:** Decorative font icons that use ligatures (like Google Material Icons rendering 'auto_fix_high' or 'psychology') are read aloud by screen readers as the literal ligature text, confusing users.
**Action:** Always add `aria-hidden="true"` to ligature icon elements (`<span className="material-icons">`) to prevent screen readers from announcing their internal text.

## 2026-10-25 - Dynamic Disabled States
**Learning:** When interactive elements like buttons are visually disabled or conceptually disabled in logic, failing to set appropriate HTML attributes leaves screen readers unaware of the state change.
**Action:** When conditionally disabling an element based on a state (e.g. length of selected numbers), explicitly add both `disabled={condition}` and `aria-disabled={condition}` to ensure standard behavior and maximal compatibility during React re-renders.
