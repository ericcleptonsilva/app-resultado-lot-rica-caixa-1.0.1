## 2026-02-09 - Accessible Number Grids
**Learning:** Interactive number grids built with `div`s and `onClick` are completely inaccessible to keyboard users and screen readers.
**Action:** Always use `<button type="button">` for interactive grid items and reset default button styles (`appearance: none`, `padding: 0`, `border: none`) to maintain design fidelity while gaining semantic benefits and keyboard focus.

## 2026-02-10 - Inline Destructive Confirmation
**Learning:** For list items like saved games, immediate deletion is dangerous and modals are heavy.
**Action:** Use an inline state-based confirmation (swap "Delete" button with "Confirm/Cancel") to keep the user in context and provide a safer, smoother experience.
