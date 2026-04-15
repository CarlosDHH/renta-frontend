---
name: design-taste-frontend
description: Senior UI/UX Engineer. Architect digital interfaces overriding default LLM biases. Enforces metric-based rules, strict component architecture, CSS hardware acceleration, and balanced design engineering. Adapted for Angular 20 + PrimeNG + Tailwind CSS.
---

# High-Agency Frontend Skill (Angular Edition)

## 1. ACTIVE BASELINE CONFIGURATION
* DESIGN_VARIANCE: 8 (1=Perfect Symmetry, 10=Artsy Chaos)
* MOTION_INTENSITY: 6 (1=Static/No movement, 10=Cinematic/Magic Physics)
* VISUAL_DENSITY: 4 (1=Art Gallery/Airy, 10=Pilot Cockpit/Packed Data)

**AI Instruction:** The standard baseline for all generations is strictly set to these values (8, 6, 4). Do not ask the user to edit this file. Otherwise, ALWAYS listen to the user: adapt these values dynamically based on what they explicitly request in their chat prompts. Use these baseline (or user-overridden) values as your global variables to drive the specific logic in Sections 3 through 7.

## 2. DEFAULT ARCHITECTURE & CONVENTIONS
Unless the user explicitly specifies a different stack, adhere to these structural constraints:

* **DEPENDENCY VERIFICATION [MANDATORY]:** Before importing ANY 3rd party library, check `package.json`. If missing, output `npm install package-name` before providing code. **Never** assume a library exists.
* **Framework:** Angular 20 with standalone components (`standalone: true`). No NgModules.
* **Reactivity:** Use Angular Signals (`signal()`, `computed()`, `effect()`) for all local reactive state. Do NOT use RxJS Subject/BehaviorSubject for local UI state — reserve RxJS for HTTP streams and async operations.
* **Component Architecture:** Every component must be `standalone: true` with explicit `imports: []`. Inject services with `inject()` (function-based DI), not constructor injection.
* **State Management:** NgRx only for auth state (already in place). All other feature state uses Signals. Avoid deep prop-drilling by using `inject()` from a shared service with signals.
* **Styling Policy:** Use Tailwind CSS for 90% of utility styling.
    * **TAILWIND VERSION LOCK:** Check `package.json` — this project uses Tailwind v3. Do NOT use v4 syntax.
    * **PREFLIGHT DISABLED:** `preflight: false` in `tailwind.config.js` to avoid conflicts with PrimeNG reset. Never re-enable it.
    * **PrimeNG Integration:** Use PrimeNG 20 (Aura theme) components for forms, tables, dialogs, toasts, buttons. Import each module explicitly (e.g., `ButtonModule`, `TableModule`).
* **ANTI-EMOJI POLICY [CRITICAL]:** NEVER use emojis in code, markup, or text content. Use PrimeIcons (`pi pi-*`) or clean SVG primitives instead.
* **Responsiveness & Spacing:**
  * Standardize breakpoints (`sm`, `md`, `lg`, `xl`).
  * Contain page layouts using `max-w-[1400px] mx-auto` or `max-w-7xl`.
  * **Viewport Stability [CRITICAL]:** NEVER use `h-screen` for Hero sections. ALWAYS use `min-h-[100dvh]`.
  * **Grid over Flex-Math:** NEVER use `w-[calc(33%-1rem)]`. ALWAYS use CSS Grid (`grid grid-cols-1 md:grid-cols-3 gap-6`).
* **Icons:** Use PrimeIcons (`pi pi-*`) as the primary icon system. For advanced SVG icons, use inline SVGs. Standardize icon size with `text-xl` or `text-2xl` on the `<i>` element.
* **Animations:** Use `@angular/animations` for component-level enter/leave transitions. For CSS-driven micro-interactions, use Tailwind's `transition`, `duration`, `ease` utilities. For complex scroll animations, use the Angular CDK `IntersectionObserver` or a minimal vanilla JS approach wrapped in `afterNextRender()`.


## 3. DESIGN ENGINEERING DIRECTIVES (Bias Correction)
LLMs have statistical biases toward specific UI cliché patterns. Proactively construct premium interfaces using these engineered rules:

**Rule 1: Deterministic Typography**
* **Display/Headlines:** Default to `text-4xl md:text-6xl tracking-tighter leading-none`.
    * **ANTI-SLOP:** Discourage `Inter` for "Premium" or "Creative" vibes. Force unique character using `Geist`, `Outfit`, `Cabinet Grotesk`, or `Satoshi` via Google Fonts import in `src/index.html`.
    * **TECHNICAL UI RULE:** Serif fonts are strictly BANNED for Dashboard/Software UIs. Use exclusively high-end Sans-Serif pairings (`Geist` + `Geist Mono` or `Satoshi` + `JetBrains Mono`).
* **Body/Paragraphs:** Default to `text-base text-gray-600 leading-relaxed max-w-[65ch]`.

**Rule 2: Color Calibration**
* **Constraint:** Max 1 Accent Color. Saturation < 80%.
* **THE LILA BAN:** The "AI Purple/Blue" aesthetic is strictly BANNED. No purple button glows, no neon gradients. Use absolute neutral bases (Zinc/Slate) with high-contrast, singular accents (e.g. Emerald, Electric Blue, or Deep Rose).
* **COLOR CONSISTENCY:** Stick to one palette for the entire output. Do not fluctuate between warm and cool grays within the same project.
* **PrimeNG Theme Tokens:** When customizing PrimeNG components, use CSS custom properties (`--p-*`) from the Aura theme rather than overriding component styles directly.

**Rule 3: Layout Diversification**
* **ANTI-CENTER BIAS:** Centered Hero/H1 sections are strictly BANNED when `DESIGN_VARIANCE > 4`. Force "Split Screen" (50/50), "Left Aligned content/Right Aligned asset", or "Asymmetric White-space" structures.

**Rule 4: Materiality, Shadows, and "Anti-Card Overuse"**
* **DASHBOARD HARDENING:** For `VISUAL_DENSITY > 7`, generic card containers are strictly BANNED. Use logic-grouping via `border-t`, `divide-y`, or purely negative space.
* **Execution:** Use cards ONLY when elevation communicates hierarchy. When a shadow is used, tint it to the background hue.

**Rule 5: Interactive UI States**
* **Mandatory Generation:** Implement full interaction cycles:
  * **Loading:** Use PrimeNG Skeleton or Tailwind shimmer animations matching layout sizes. Avoid generic `p-progressspinner` for inline states.
  * **Empty States:** Beautifully composed empty states using PrimeNG `p-empty-message` or custom layouts.
  * **Error States:** Clear inline error reporting. Use Angular `ReactiveForms` validation with `pInputText` error class binding.
  * **Tactile Feedback:** On `:active`, use `-translate-y-[1px]` or `scale-[0.98]` to simulate physical push.

**Rule 6: Data & Form Patterns**
* **Forms:** Use Angular `ReactiveFormsModule` with `FormBuilder`. Label MUST sit above input. Use `pInputText`, `pTextarea`, `p-select`, etc. from PrimeNG. Apply `ngClass` for error states. Error text below input. Use `gap-2` for input blocks.


## 4. CREATIVE PROACTIVITY (Anti-Slop Implementation)
To actively combat generic AI designs, implement these high-end concepts:

* **"Liquid Glass" Refraction:** When glassmorphism is needed, go beyond `backdrop-blur`. Add a 1px inner border (`border-white/10`) and a subtle inner shadow (`shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]`) to simulate physical edge refraction.
* **Magnetic Micro-physics (If MOTION_INTENSITY > 5):** Implement buttons that pull slightly toward the mouse cursor using Angular host listeners (`@HostListener`) and CSS `transform`. Use `afterNextRender()` to safely bind DOM events.
* **Perpetual Micro-Interactions:** When `MOTION_INTENSITY > 5`, embed continuous, infinite micro-animations (Pulse, Typewriter, Float, Shimmer) using CSS `@keyframes` or `@angular/animations` with `AnimationBuilder`. Apply cubic-bezier easing (`cubic-bezier(0.16, 1, 0.3, 1)`) to all interactive elements.
* **Staggered Orchestration:** Do not mount lists or grids instantly. Use `@angular/animations` `stagger()` or CSS cascade (`animation-delay: calc(var(--index) * 100ms)`) for sequential waterfall reveals. Bind `[style.--index]="i"` on `*ngFor` items.
* **Layout Transitions:** Use `@angular/animations` with `transition()` and `animate()` for smooth enter/leave of lists and dialogs.


## 5. PERFORMANCE GUARDRAILS
* **DOM Cost:** Apply grain/noise filters exclusively to `position: fixed` pseudo-elements with `pointer-events: none`. NEVER on scrolling containers.
* **Hardware Acceleration:** Never animate `top`, `left`, `width`, or `height`. Animate exclusively via `transform` and `opacity`.
* **Z-Index Restraint:** NEVER spam arbitrary `z-50`. Use z-indexes strictly for Sticky Navbars, Modals, Overlays.
* **OnPush Strategy:** For list-heavy components (tables, grids), use `ChangeDetectionStrategy.OnPush` and pass data via `input()` signals to prevent unnecessary re-renders.
* **Defer Blocks:** Use Angular `@defer` for heavy components below the fold (PrimeNG charts, complex tables). Always provide a `@placeholder` and `@loading` block.


## 6. TECHNICAL REFERENCE (Dial Definitions)

### DESIGN_VARIANCE (Level 1-10)
* **1-3 (Predictable):** Flexbox `justify-center`, strict 12-column symmetrical grids, equal paddings.
* **4-7 (Offset):** Use `margin-top: -2rem` overlapping, varied image aspect ratios, left-aligned headers over center-aligned data.
* **8-10 (Asymmetric):** Masonry layouts, CSS Grid with fractional units (`grid-template-columns: 2fr 1fr 1fr`), massive empty zones (`padding-left: 20vw`).
* **MOBILE OVERRIDE:** For levels 4-10, any asymmetric layout above `md:` MUST fall back to strict single-column (`w-full`, `px-4`, `py-8`) on viewports `< 768px`.

### MOTION_INTENSITY (Level 1-10)
* **1-3 (Static):** No automatic animations. CSS `:hover` and `:active` states only.
* **4-7 (Fluid CSS):** `transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1)`. Use `animation-delay` cascades for load-ins. Focus on `transform` and `opacity`.
* **8-10 (Advanced Choreography):** Complex scroll-triggered reveals. Use Angular CDK `IntersectionObserver` or `afterNextRender()` for scroll bindings. NEVER use `window.addEventListener('scroll')` in components without cleanup in `ngOnDestroy`.

### VISUAL_DENSITY (Level 1-10)
* **1-3 (Art Gallery Mode):** Lots of white space. Huge section gaps. Everything feels very expensive and clean.
* **4-7 (Daily App Mode):** Normal spacing for standard web apps.
* **8-10 (Cockpit Mode):** Tiny paddings. No card boxes; just 1px lines to separate data. Everything is packed. **Mandatory:** Use Monospace (`font-mono`) for all numbers.


## 7. AI TELLS (Forbidden Patterns)
To guarantee a premium, non-generic output, strictly avoid:

### Visual & CSS
* **NO Neon/Outer Glows:** Use inner borders or subtle tinted shadows.
* **NO Pure Black:** Never use `#000000`. Use Off-Black, Zinc-950, or Charcoal.
* **NO Oversaturated Accents:** Desaturate accents to blend elegantly with neutrals.
* **NO Excessive Gradient Text:** Do not use text-fill gradients for large headers.

### Typography
* **NO Inter Font:** Banned. Use `Geist`, `Outfit`, `Cabinet Grotesk`, or `Satoshi`.
* **NO Oversized H1s:** Control hierarchy with weight and color, not just massive scale.
* **Serif Constraints:** Use Serif fonts ONLY for creative/editorial designs. NEVER on Dashboards.

### Layout & Spacing
* **NO 3-Column Card Layouts:** The generic "3 equal cards horizontally" feature row is BANNED. Use a 2-column Zig-Zag, asymmetric grid, or horizontal scrolling approach.
* **Align & Space Perfectly:** Padding and margins must be mathematically consistent.

### Content & Data
* **NO Generic Names:** "John Doe", "Sarah Chan" are banned. Use realistic, creative names.
* **NO Fake Numbers:** Avoid `99.99%`, `50%`. Use organic data (`47.2%`, `+1 (312) 847-1928`).
* **NO Startup Slop Names:** "Acme", "Nexus", "SmartFlow". Use premium, contextual brand names.
* **NO Filler Words:** Avoid "Elevate", "Seamless", "Unleash", "Next-Gen". Use concrete verbs.

### Angular-Specific Anti-Patterns
* **NO Constructor Injection:** Always use `inject()`.
* **NO ngModel for complex forms:** Use `ReactiveFormsModule` with `FormBuilder`.
* **NO `any` types:** TypeScript strict mode is active. Always type everything.
* **NO direct DOM manipulation:** Never use `document.querySelector` in components. Use Angular's `ElementRef` + `Renderer2` or signals-based approaches.
* **NO `*ngIf`/`*ngFor`:** Use Angular 17+ control flow (`@if`, `@for`, `@switch`, `@defer`).


## 8. THE CREATIVE ARSENAL (High-End Inspiration)
Pull from this library of advanced concepts to ensure visually striking, memorable output:

### Hero Sections
* Stop doing centered text over a dark image. Try asymmetric Heroes: Text cleanly left or right aligned. Background with a high-quality image fading gracefully into the background color.

### Navigation
* **Magnetic Button:** Buttons that physically pull toward the cursor (use `@HostListener('mousemove')`).
* **Dynamic Island:** A pill-shaped UI that morphs to show status/alerts via `@angular/animations`.
* **Mega Menu Reveal:** Full-screen dropdowns that stagger-fade complex content.

### Layout & Grids
* **Bento Grid:** Asymmetric, tile-based grouping (Apple Control Center style).
* **Masonry Layout:** Staggered grid without fixed row heights (Pinterest style) via CSS `columns`.
* **Split Screen Scroll:** Two screen halves sliding in opposite directions.

### Cards & Containers
* **Parallax Tilt Card:** 3D-tilting card tracking mouse via `@HostListener`.
* **Spotlight Border Card:** Card borders that illuminate dynamically under cursor.
* **Glassmorphism Panel:** True frosted glass with inner refraction borders.

### Scroll-Animations
* **Sticky Scroll Stack:** Cards that stick to the top and physically stack via `position: sticky`.
* **Zoom Parallax:** A central background image zooming in/out on scroll (CSS `scale` via IntersectionObserver).
* **Scroll Progress Path:** SVG lines that draw themselves as the user scrolls.

### Micro-Interactions
* **Skeleton Shimmer:** Use `@keyframes shimmer` shifting light across placeholder boxes.
* **Directional Hover Aware Button:** Hover fill entering from the exact side the mouse entered.
* **Ripple Click Effect:** Visual waves rippling from click coordinates via Angular event + CSS animation.
* **Mesh Gradient Background:** Organic, lava-lamp-like animated color blobs via CSS `@keyframes`.


## 9. THE "MOTION-ENGINE" BENTO PARADIGM
When generating modern SaaS dashboards or feature sections, utilize this Bento 2.0 architecture:

### A. Core Design Philosophy
* **Aesthetic:** High-end, minimal, and functional.
* **Palette:** Background `#f9fafb`. Cards pure white (`#ffffff`) with a 1px border of `border-slate-200/50`.
* **Surfaces:** Use `rounded-[2.5rem]` for all major containers. Apply "diffusion shadow" (`shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]`).
* **Typography:** Strict `Geist`, `Satoshi`, or `Cabinet Grotesk`. Use `tracking-tight` for headers.
* **Pixel-Perfection:** Use generous `p-8` or `p-10` padding inside cards.

### B. Animation Engine (Angular Adaptation)
All cards must contain "Perpetual Micro-Interactions":
* **Spring-like Physics:** Simulate spring easing with `cubic-bezier(0.34, 1.56, 0.64, 1)` for bouncy entries.
* **Angular Animations:** Use `@angular/animations` `trigger()`, `state()`, `transition()`, `animate()` for enter/leave. Use `query()` + `stagger()` for list animations.
* **Infinite Loops:** Every card must have a looping "Active State" (Pulse, Typewriter, Float, Shimmer) using CSS `animation: infinite`.
* **Performance:** Isolate heavy animations in separate child components with `ChangeDetectionStrategy.OnPush`.

### C. The 5-Card Archetypes
1. **The Intelligent List:** Vertical stack with Angular CDK `DragDropModule` sorting animation or `@angular/animations` stagger reorder.
2. **The Command Input:** `pAutoComplete` or custom input with Typewriter Effect cycling through prompts via a `signal` + `setInterval` in `afterNextRender()`.
3. **The Live Status:** Scheduling interface with "breathing" status dots using CSS `animation: pulse`. PrimeNG `p-badge` with overshoot spring entry via `@angular/animations`.
4. **The Wide Data Stream:** Horizontal `marquee` equivalent with `overflow: hidden` + CSS `translateX` infinite animation for seamless data card loops.
5. **The Contextual UI (Focus Mode):** Document view with Angular `@defer` + staggered highlight via CSS cascade `animation-delay`.


## 10. FINAL PRE-FLIGHT CHECK
Evaluate code against this matrix before outputting:
- [ ] Is mobile layout collapse (`w-full`, `px-4`, `max-w-7xl mx-auto`) guaranteed for high-variance designs?
- [ ] Do full-height sections safely use `min-h-[100dvh]` instead of `h-screen`?
- [ ] Are `effect()` or `afterNextRender()` animation bindings cleaned up properly?
- [ ] Are empty, loading (`@defer @loading`), and error states provided?
- [ ] Are PrimeNG components imported explicitly in the component's `imports: []` array?
- [ ] Is `ChangeDetectionStrategy.OnPush` applied to list-heavy components?
- [ ] Are Angular 17+ control flow (`@if`, `@for`, `@defer`) used instead of legacy directives?
- [ ] Is `inject()` used for all dependency injection (no constructor injection)?
- [ ] Are TypeScript types explicit (no `any`)?
