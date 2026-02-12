## 2026-02-09 - Accessible Number Grids
**Learning:** Interactive number grids built with `div`s and `onClick` are completely inaccessible to keyboard users and screen readers.
**Action:** Always use `<button type="button">` for interactive grid items and reset default button styles (`appearance: none`, `padding: 0`, `border: none`) to maintain design fidelity while gaining semantic benefits and keyboard focus.

## 2026-10-25 - Inline Destructive Actions
**Learning:** Using browser alerts for confirmation feels jarring and outdated. Inline confirmation (swapping the button) keeps context and flow.
**Action:** For list items, use a local state (e.g., `deletingId`) to render confirmation buttons in place of the action button, maintaining spatial context.
