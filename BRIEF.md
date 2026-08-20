# Destination Wedding Website — Build Prompt
### "The Journey" — An Interactive Walkthrough Experience

Reference inspiration: [Summer Afternoon by Vicente Lucendo](https://summer-afternoon.vlucendo.com/) — a WebGL 3D scene experiment with camera movement, ambient animation, and immersive scroll/navigation through an illustrated environment.

---

## 1. Concept Summary

The website is structured as a **navigable illustrated space** — not a scrolling page, but a small 3D or 2.5D "world" the guest walks through, similar to exploring a courtyard with several doorways. Each doorway is an "entrance" leading to one piece of wedding information. After viewing an entrance, the guest returns to the main pathway to choose the next one.

**The core interaction loop:**
1. Guest lands on the **Main Pathway** — a wide illustrated scene (a garden, courtyard, or hillside path) with several visible entrances/doors/gates positioned at different points in the space.
2. Guest clicks/taps an entrance.
3. Camera animates (glides, zooms, or dollies) toward and through that entrance.
4. The scene transitions into a dedicated "room" for that entrance — a full illustrated environment specific to that content, with event details overlaid.
5. Guest exits (via a "back" arrow or by clicking a visible pathway back) and the camera reverses/returns to the Main Pathway.
6. Guest selects the next entrance.

This mirrors the reference site's feeling of physically moving through a place rather than clicking through pages.

---

## 2. Entrances / Rooms to Build — FINALIZED

Seven entrances total, arranged in **chronological order** along the main pathway — guests discover the site in the same order the actual trip unfolds. This gives the courtyard scene a natural left-to-right (or near-to-far) narrative flow.

| # | Entrance Name | Suggested Visual | Content Overlay |
|---|---|---|---|
| 1 | **Welcome Dinner** | Intimate courtyard/terrace, early evening light, string lights just switching on | Date, time, venue, dress code, short "meet & greet" note |
| 2 | **The Wedding** | Mountain/cliffside venue view, golden hour light | Date, time, venue name, short welcome note |
| 3 | **The After-Party** | Different venue mood — evening, string lights, dancefloor | Date, time, dress code, theme, venue |
| 4 | **Explore** *(merged Things To Do + Must-See)* | Wide landscape / map-like illustrated view with points of interest and landmarks together | Mixed cards — activities AND curated highlights/landmarks in one browsable set, optionally grouped by type (adventure / relaxation / culture / sights) |
| 5 | **Where to Stay** | Row of illustrated buildings/hotels along a street or cliffside | Hotel options, booking links, price tiers, proximity to venue |
| 6 | **Travel Details** | Airport/road/boat illustration depending on destination | Flight info, transfers, visa notes, arrival windows |
| 7 | **RSVP** | Its own dedicated room — a welcoming "final destination" visual, e.g. a gate, a guestbook table, or a mailbox motif | RSVP form, deadline, plus-one/kids policy, contact for questions |

Each "room" should feel like a distinct location within the same illustrated world — consistent art style, lighting, and color palette throughout, but a different vignette per entrance.

### RSVP visibility — important exception to strict chronological order

Although RSVP is #7 chronologically, it is the single most action-critical entrance on the site. Guests should never have to "walk the whole path" just to find it. Implement a **persistent RSVP indicator**:

- A small glowing marker, floating chip, or subtly animated icon (e.g. a lantern, a firefly, a wax-seal envelope motif) visible from the Main Pathway at all times, regardless of which entrance the guest is near.
- Clicking/tapping it jumps directly into the RSVP room, bypassing the need to navigate there in sequence.
- This does not change the underlying chronological layout — it's an accessibility/priority layer on top of it, similar to a "fast travel" option in a game map.
- Recommend the RSVP indicator uses a distinct color or motion from the rest of the UI so it reads as "always available" rather than "just another entrance."

---

## 3. Technical Approach

### Recommended stack

- **Three.js** (WebGL) — for true 3D camera movement through a scene, exactly like the reference site. Best fidelity, most work.
- **Alternative — GSAP + layered 2D illustrations (parallax)** — much faster to build, still achieves a strong "walking through" feeling using scaling, panning, and depth-layered parallax instead of true 3D. Recommended if timeline is tight (weddings have deadlines!).
- **Framer Motion / GSAP ScrollTrigger** — for UI transitions, text overlay reveals, and camera-adjacent animation curves (ease-in-out, momentum).

**Recommendation for a wedding site on a deadline:** build with the **2.5D parallax approach** (layered illustrated flat art, panned and scaled with GSAP), not full Three.js. It gets 80% of the visual magic of the reference site with a fraction of the development time and risk, and is far more reliable on mobile devices (many wedding guests will view this on their phones).

### Illustration style

- Single illustrator (or consistent AI-generated style) creates ALL scenes as **flat, layered illustrations** — foreground, midground, background as separate transparent PNG/SVG layers, so each can move independently for the parallax effect.
- **Placeholder destination: Montenegro.** Recommend a warm, painterly, slightly folkloric illustration style capturing the Adriatic coast — dramatic limestone cliffs dropping into turquoise bay water, terracotta-roofed stone towns (Kotor, Perast-style architecture), olive groves, cypress trees, golden-hour Mediterranean light. This palette pairs naturally with a warm terracotta / dusty blue color system.
- When the final destination is confirmed, only the background illustration layers need to change — content structure, UI, and interactions remain the same.

---

## 4. Scene-by-Scene Build Instructions

### A. Main Pathway (hub scene)

- Wide illustrated environment (courtyard, garden path, hillside) at least 2500–3500px wide, designed to pan left-right or be explored via mouse-move/scroll.
- 4–6 entrances visible as distinct illustrated elements (archways, doors, gates, paths) placed at different points along the width.
- Each entrance has a **hover/tap state**: subtle glow, label fade-in ("The Wedding", "Where to Stay", etc.), and a light idle animation (swaying leaves, flickering lantern) to signal interactivity.
- Ambient looping animation across the whole scene: birds, drifting light particles, gentle cloud movement — this is what gives the reference site its "alive" feeling.
- Background ambient audio (optional, muted by default with a toggle) — wind, distant music, birdsong.

### B. Entrance transition

- On click: camera (or scene) animates toward the selected entrance — combine a **scale-up + slight pan + fade/mask transition** so it feels like walking *through* the doorway, not just cutting to a new page.
- Duration: 1.2–2 seconds, eased (GSAP `power2.inOut` or similar) — fast enough not to frustrate repeat visitors, slow enough to feel cinematic.
- Loading of the next scene's assets should be pre-fetched in the background the moment the guest hovers an entrance (perceived performance).

### C. Individual room scenes

- Each room = one full illustrated environment representing that content category, at the same fidelity/style as the main pathway.
- Event details overlay as clean typographic cards/panels — semi-transparent or solid background chip so text stays legible over the illustration (this is where your MERU-adjacent brand system — periwinkle / terracotta / cream / espresso, or whatever palette you choose for the wedding — can carry through consistently).
- A **visible "return" cue** — an arrow, a path leading back, or a small "back to courtyard" label — always present, bottom-left or bottom-center, so guests never feel lost.
- Optional: small ambient motion specific to that room (dancers swaying for after-party, waves for a coastal "must-see", luggage/plane trail for travel details) to keep it from feeling static.

### D. Return transition

- Mirror of the entrance transition, reversed — camera pulls back out through the doorway to the main pathway.
- Main pathway should visually remember the guest's position (return them near the entrance they came from, not reset to the far left every time).

---

## 5. Content Structure Per Entrance

> **Note on visuals:** Use **Montenegro** (Adriatic coastline, terracotta-roofed towns, dramatic limestone mountains dropping into the bay, olive groves, stone architecture) as the **placeholder visual identity** for all illustrated scenes until the final destination is confirmed. This keeps development moving without locking in artwork tied to the wrong location — when the venue is finalized, only the illustrated backgrounds need to be swapped; the structure, content fields, and interactions stay the same.

Prepare this content in advance for each room before development begins:

**Welcome Dinner**
- Date & time
- Venue name + one-line description
- Dress code
- Short "meet & greet" note from the couple

**The Wedding**
- Date & time
- Venue name + one-line description
- Ceremony start time / arrival time
- Optional: short welcome note from the couple

**The After-Party**
- Date & time (if different from main event)
- Venue name
- Dress code
- Theme (if any)
- Any special notes (e.g. "shoes optional," "live DJ till 2am")

**Explore** *(merged Things To Do + Must-See)*
- 6–10 cards mixing activities and curated highlights — name, one-line description, optional link/map pin
- Consider grouping by type (adventure / relaxation / culture / sights) with a filter or tab if the list grows long

**Where to Stay**
- Hotel/villa options with name, price tier, distance from venue, booking link
- Optional filter by price or by proximity

**Travel Details**
- Nearest airport(s) + transfer info
- Recommended arrival window
- Visa/entry requirements if relevant
- Contact for logistics questions

**RSVP**
- RSVP form (name, attendance per event, meal preference, plus-one, kids)
- RSVP deadline
- Plus-one / kids policy
- Contact for questions
- Persistent access point from the Main Pathway (see Section 2 note on RSVP visibility)

---

## 6. Mobile Considerations

- Full 3D/parallax experiences are heavy — test thoroughly on mobile Safari and Chrome Android.
- Consider a **simplified mobile mode**: same entrances, same content, but with lighter cross-fade transitions instead of full camera movement, to protect load times and battery.
- All overlay text must be legible and tap targets large enough (minimum 44px touch targets) since most guests will RSVP/browse from their phones.

---

## 7. Suggested Build Order (for a developer or Claude Code)

1. Design and finalize all illustrated scenes (main pathway + 6 rooms) as layered flat art assets.
2. Build static HTML/CSS layout of the main pathway with all entrances positioned correctly, no animation yet.
3. Add hover/tap states and idle ambient animation to the main pathway.
4. Build one complete room (e.g. "The Wedding") end-to-end, including entrance transition + content overlay + return transition. Use this as the template for the rest.
5. Duplicate the template for the remaining 5 rooms, swapping art and content.
6. Add ambient audio, loading states, and mobile-specific simplifications.
7. Cross-browser and cross-device testing, especially transition performance on older phones.
8. Add analytics/RSVP tracking if needed (e.g. which entrances guests visit most, RSVP form submissions).

---

## 8. Reference for Tone/Direction

Send the developer or designer the reference link directly: **https://summer-afternoon.vlucendo.com/** — and clarify that you want the *feeling* of movement, ambient life, and discovery from that site, translated into a wedding-appropriate, warmer, more romantic illustrated world rather than a literal copy of its visual style.
