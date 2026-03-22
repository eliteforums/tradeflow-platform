

## Plan: Beautify Quest Cards with Solitaire-Style Visual Design

### What Changes
Redesign the Quest Cards page visually to feel like a premium solitaire card game — rich card backs with patterns, smooth flip animations, card shadows, a proper deck stack, and a felt-like table surface. All 2D with CSS.

### Changes to `src/App.css`
Add richer card animation utilities:
- Card hover lift with shadow (`card-hover`)
- Smoother flip transition with spring-like easing
- Card deal stagger animation (cards slide in one by one on load)
- Subtle card wobble on hover
- Green felt-like table background class

### Changes to `src/pages/dashboard/QuestCards.tsx`
- **Table surface**: Wrap card grid in a felt-green rounded container with inner shadow (like a card table)
- **Card backs**: Replace emoji + plain gradient with a rich patterned design — ornate border pattern using CSS, a central logo/emblem, and a gradient back (teal-to-lavender). Add inner decorative border lines using `before`/`after` pseudo-elements or nested divs
- **Card fronts**: Add a parchment-like light background, decorative corner ornaments (Unicode suits or symbols), cleaner typography
- **Hover**: Cards lift up with shadow on hover, slight wobble
- **Flip**: Smoother 600ms transition with ease-out-back curve
- **Deal animation**: Cards stagger-animate in from the deck position on mount (translate + fade, 100ms stagger per card)
- **Deck stack**: Make deck look more realistic — 5 stacked cards with slight offsets, card back pattern visible
- **Completed cards**: Subtle golden glow border, checkmark overlay
- **Answer panel**: Styled as a card-table overlay with glass effect

### Changes to `src/index.css`
Add a `.card-table` utility class with the felt-like green-dark background and inner shadow.

### Files to modify
- `src/pages/dashboard/QuestCards.tsx` — Visual redesign
- `src/App.css` — Card animation utilities
- `src/index.css` — Card table utility class

