# Handover — "The Journey" wedding website

> **New Claude Code session? Start here.**
> 1. Read this file, then `BRIEF.md` for the original intent.
> 2. The real sources are in `assets/` — **that is what you edit**.
> 3. The live site is a separate self-contained bundle. Changing `assets/` does
>    nothing to it until you run `python3 build.py` and the rebuilt files in
>    `UPLOAD-THESE-FILES/` are uploaded to GitHub by hand. See
>    **Publishing** below — nobody on this machine can `git push`.
> 4. Test locally before touching anything else. See **Testing** below.
>
> Last worked on: **22 August 2026** (see *What changed in the second August
> 2026 round*; its last entry, on the wedding crowd, is the newest work).
> **The live site is now behind this folder again: the rebuilt files in
> `UPLOAD-THESE-FILES/` have not been uploaded yet, and there are two of
> them — the page and the music.**

## What this is
An illustrated wedding website the guest **walks through** rather than scrolls.
A stone promenade above the Bay of Kotor with **seven doorways** along it, in the
order the trip happens. Click one → the camera dollies through the arch → a
dedicated illustrated room with the details. Built from `BRIEF.md` (still in the
folder — read it for the original intent).

- **Folder:** `/Users/dana/Downloads/wedding-website`
- **Live:** https://danaismail195-gif.github.io/Wedding-website/ ← note the **capital W**. The lowercase URL 404s; I checked.
- **Also live (identical):** `.../Wedding-website/the-journey.html`
- **Repo:** github.com/danaismail195-gif/Wedding-website (public, GitHub Pages on `main` / root)
- The site is `noindex` + `robots.txt` — public but unlisted, and it will never
  appear in a Google search. Guests reach it only by the link. Delete both if
  that is not what you want.

## ⚠️ Publishing: read this before you change anything

**The live site and the git repository are not the same thing, and the repo is
behind.** This is the single most confusing thing about this project.

| | What it holds |
|---|---|
| **Live `index.html`** on GitHub | The single-file build as of the *first* 21 Aug 2026 pass. **Now well out of date** — four feedback rounds have been built into `UPLOAD-THESE-FILES/` and none uploaded. The live site also has no music file at all, so uploading the HTML on its own would leave it silent. |
| **Everything else** in the GitHub repo | Stale. Loose `app.js`, `content.js`, `main.css`, `scenes.js`, `tween.js`, `art.js`, `audio.js` sit at the repo root, left over from an old flattened upload. Nothing loads them — the live `index.html` is self-contained — so they are harmless, just misleading. There is no `assets/` folder on GitHub at all. |
| **This local repo** | The truth. Real sources in `assets/`, full history, plus `HANDOVER.md` and `build.py` that GitHub has never seen. |

**Consequence: editing `assets/js/content.js` does NOT change the live site.**
The live copy is a separate inlined bundle.

### To change anything the guest sees
1. Edit the real sources in `assets/js/*` and `assets/css/main.css`
2. `python3 build.py`
3. Upload **every file in `UPLOAD-THESE-FILES/`** to the repo root via
   github.com → **Add file ▸ Upload files** → drag them in → **Commit changes**
4. Wait a minute for Pages, then hard-reload (⌘⇧R). Browser cache is the usual
   reason a change "did not work".

⚠️ **It is two files now, not one.** The music is a real recording, so it
cannot be baked into the HTML the way the CSS and the scripts are — a few
megabytes of base64 in front of the page would hold up the whole site. It
travels beside the HTML instead. **If the live site is silent, the mp3 did not
get uploaded** — that is the first thing to check, before touching any code.

`build.py` writes `UPLOAD-THESE-FILES/` (the HTML plus the music, which is
what you upload) and `the-journey.html`, and exits non-zero if a script, the
stylesheet or the music failed to make it into the build. `the-journey.html` is generated — never hand-edit it.

### Why not just `git push`?
Because nobody on this machine can authenticate to GitHub. As of 21 Aug 2026
there is **no `gh` CLI, no SSH key, no stored credential, and GitHub Desktop is
not installed** — a push dies with `could not read Username for
'https://github.com'`. That is why the hand-upload route above exists.

Everything else is already prepared for the day someone can push:

- `origin` is set to `https://github.com/danaismail195-gif/Wedding-website.git`
- The two histories were unrelated (the repo was born from web uploads), so the
  remote history has been merged in with `-s ours` — our tree wins, their
  history is recorded. **`git push origin main` fast-forwards cleanly. No
  `--force` is needed and none should ever be used.**

⚠️ **Every hand-upload creates a new commit on `origin/main` and breaks that
fast-forward again.** After any web upload, before pushing, redo:

```
git fetch origin
git merge origin/main -s ours -m "Merge the manual upload"
git push origin main          # needs credentials
```

To get credentials: install GitHub Desktop (it preserves folders and pushes in
one click) or create a personal access token and push once from Terminal —
macOS keychain remembers it afterwards.

**That push is worth doing.** It replaces the flattened root with `index.html`
plus a real `assets/` folder. Relative paths mean it works fine under the
`/Wedding-website/` sub-path, the loose duplicates disappear, and the whole
"rebuild and re-upload" dance goes away for good.

## How the code is organised
| File | What it does |
|---|---|
| `assets/js/content.js` | **All the words.** Names, dates, venues, hotels, RSVP questions. The only file to edit for copy changes. |
| `assets/js/art.js` | Drawing kit — limestone ridges, houses, cypresses, olive trees, lanterns, boats, and the people (`person()` and friends). |
| `assets/js/scenes.js` | The 8 places: `hub()` (the promenade), `entranceArt(id)` (the 7 doorways), `rooms.*` (7 environments). All procedural SVG. |
| `assets/js/app.js` | Camera, pan/drag, transitions, room rendering, RSVP form, deep links. |
| `assets/js/tween.js` | Tiny animation engine (replaces GSAP). |
| `assets/js/audio.js` | **The music player.** Loads `assets/audio/*.mp3`, loops it, fades it, and turns it down inside a room (`ROOMS`). Starts on "Begin the walk"; the choice is remembered. |
| `assets/audio/` | **The music itself** — a licensed track. See the music section below before replacing it. |
| `assets/css/main.css` | Design tokens at `:root`, layout, all ambient keyframes. |
| `the-journey.html` | Single-file build (same content, no `assets/` needed). Generated — never edit it by hand. |
| `build.py` | Regenerates both single-file builds from `assets/`. Run after every change. |

**Zero dependencies, no build step, no framework.** Classic `<script>` tags so it
opens by double-clicking. Artwork is generated in code — there are no image files.

Palette (from the brief): terracotta `#C4643C`, dusty blue `#7A97A8`, cream
`#F4E7D3`, espresso `#3B2A22`, olive `#7C8B5E`, gold `#E4A853`.
Type: Cormorant Garamond (display) + Karla (body), via Google Fonts.

## Still placeholder — needs real values
- ~~Couple's names~~ — now **Dana & Nadeem** (`content.js` → `couple.names`)
- **Everything about the wedding** — dates (June 2027), venues, hotels, the Explore
  list. All invented for Montenegro / Bay of Kotor as a stand-in until the real
  destination is confirmed. When it is, only the illustrations need redrawing —
  content structure and interactions stay.
- **RSVP goes nowhere.** `content.js` → `rsvpEndpoint: ''`. The form validates and
  thanks the guest but only saves to their own browser. Paste a Formspree URL there
  to actually receive replies. See `README.md` §3.
- **Email** `hello@danaandnadeem.example` — set once in `content.js` → `couple.email`
  and used from there. Still a placeholder address.

## What changed in the August 2026 round

Feedback pass on visuals, navigation, responsiveness and performance. The art
direction was deliberately left alone; everything below is either a fix or an
addition inside the existing style.

**The opening screen** is now aqua/sea blue instead of amber, and the names read
**Dana & Nadeem**.

**People.** `art.js` gained a proper figure kit — `person()`, `chatGroup()`,
`diner()`, `plate()`, `airplane()`. Limbs are round-capped polylines that start
at the shoulder or hip they belong to, with a sleeve drawn over the joint, so an
arm can never float free of its body. Poses live in one `POSES` table as
fractions of the figure's height. `dancer()` is now built on the same rules —
this is what fixed the after-party characters, keeping them quirky rather than
making them realistic. A seated figure is *not* a standing one lowered: the
`sit` / `table` poses put the head 0.44 of a standing height above the seat.
  - Welcome Dinner: guests down both sides of the existing table, plates with
    food on them, one guest still on their feet with a glass.
  - The Wedding: the couple under the arch, guests in the chairs, three knots of
    people talking, a photographer, two strolling. Everything is inside the
    900-tall frame — anything below that is cropped away.
  - Travel doorway: the iron gate bars are gone, replaced by an aeroplane
    crossing the opening. The boat stayed.

**The doorways stopped running away.** The hub used to pan itself whenever the
cursor drifted into the outer 20% of the screen. Hovering a doorway near an edge
therefore scrolled it out from under the pointer, which read as "the entrance
disappears", and the resulting mouse travel tripped the `dragMoved` guard so the
first click was swallowed — the "I have to click twice" problem. The edge-pan is
deleted. Focus no longer moves the camera unless the guest is actually tabbing
(`keyboardNav`), so a click can never "centre" instead of opening. Hover now
scales from the doorway's own base rather than lifting it, so the cursor stays
inside it. Every doorway carries a small permanent **Enter** chip.

**Performance.** Three changes, in order of how much they mattered:
  1. `#hub.is-moving` pauses every ambient animation while the camera moves. A
     lantern flickering during a 1.4s dolly is invisible, but repainting several
     3400px-wide SVG layers 60 times a second is not. See §10 of `main.css`.
  2. The camera only writes transforms when something changed (`camDirty`), and
     pointer parallax is applied from the frame loop instead of from every
     `pointermove`.
  3. Fewer separately-animated SVG nodes: water glints roughly halved and two in
     three of them left still, same for grass. 242 animated nodes in the hub
     became 141. `backdrop-filter` is gone from anything that sits over moving
     artwork.
  Wheel travel is 2.4x per notch with a firmer spring (damping 11), which is the
  "scrolling is too slow" fix.

**Mobile** rooms are now a bottom sheet: a third of the screen by default,
draggable (or tap the tab) up to 88%, with the artwork keeping the top two
thirds. The artwork is drawn to the full width and anchored to the foot of its
band, with the room's own sky colour continuing above it — that is what
`--room-sky` in `app.js` is for. Without it, a portrait phone slices a narrow
vertical strip out of a 16:9 scene and you lose most of the composition.

**Sound** is a rewrite. Four buses — sea, wind, birds, and a slow pentatonic
instrumental bed through a synthesised reverb — mixed per place by the `MOODS`
table in `audio.js`. It starts on "Begin the walk" (a real click is the
browser's price of admission for audio) and the guest's choice is remembered in
`localStorage` under `ww-audio`.

> **On the two music links in the feedback:** those are YouTube tracks. They
> cannot be downloaded and re-hosted — it is against YouTube's terms and the
> recordings are somebody's copyright — so what is here is an original
> synthesised bed that follows the *mood* of each room. If you want those actual
> tracks, you need a licence (or a royalty-free equivalent from Epidemic Sound,
> Artlist or similar); then drop the file in and point the `music` bus at an
> `<audio>` element. The sea, wind and birds can stay exactly as they are.

## What changed in the second August 2026 round

A written feedback pass on the header, the doorway labels, the plants, the
people in three scenes, and the music. The art direction is unchanged; every
item below is either a fix or a refinement inside the existing style.

**The names.** Centred at the top on every screen, and the plaque behind them
on desktop is gone — it read as a piece of interface pasted onto the picture.
They are plain type now, held off the sky by the soft cream glow that was
already in §9 of `main.css`. `.brand` is positioned absolutely inside
`.top-bar` so the sound button can keep the right-hand end without dragging
the names off centre.

**"Enter" moved onto the doorway.** (Round two took its shadow away as well:
lighter weight, wider tracking, 72% opacity, no halo at all. The doorway
gradients are deep enough by now to carry it, and the halo was what kept
making the letters look stuck on rather than part of the picture. Two pieces
of art moved off the line it sits on — the Travel cloud and the RSVP
envelope.) It used to be a terracotta pill under each
arch: seven of them along the promenade, all competing with the artwork, and
the orange was the first thing the eye went to. It is now warm ivory type
inside the opening, at the middle of the arch (69% of the 460-tall entrance
box), with no chip at all. To make one ink work on all
seven interiors, the door gradients were deepened towards the threshold —
which also looks more like a lit room seen from outside. Two pieces of art
moved out of the way of the word: the RSVP envelope now hangs in the upper
half of its arch, and the Travel aeroplane already crossed above it.

**The plants stopped running away.** This was one bug, and it was in the
stylesheet: every ambient class carried `transform-box: fill-box`, while
`art.js` and `scenes.js` pass a `transform-origin` in the layer's own
coordinates. So the urn's leaves were rotating about a point measured from
the corner of their own bounding box — roughly 1300 units below where they
actually grow — and a 1.4° sway threw them a whole leaf-cluster clear of the
pot. Every inline origin now sets `transform-box: view-box` alongside it, and
the urn's spray was redrawn so each leaf grows on a stem out of the mouth of
the pot. Measured: the leaves travel about 3.6px on a phone across the whole
sway, and the base never moves.

**One intensity for everyone.** The same `fill-box` bug was why some guests at
the wedding barely twitched while others swayed about: a figure's rotation was
pivoting on a point hundreds of units away, and *how far* away depended on
where in the scene they happened to be standing. Figures now pivot on the
ground beneath their own feet, and every figure carries `--ww-amp-y` /
`--ww-amp-x`, set by `art.js` as a fraction of its own height — so a 96-tall
guest at the back and a 300-tall one at the table breathe by the same amount
*of themselves*. Amplitudes were pulled down at the same time (`ww-talk` from
±1.2° to ±0.9°, `ww-laugh` slower and shallower). If you add a figure
animation, scale it from those two variables or it will not match.

**The people were redrawn**, following the reference illustration that came
with the feedback: chunkier proportions, a bigger head, thicker limbs with
hands on the ends of them, eight hair styles (`crop`, `bob`, `long`, `bun`,
`curls`, `pony`, `wave`, `part`) and a face with eyes, a smile and a little
blush. Hair that falls past the jaw is drawn *before* the body so it hangs
behind the shoulders instead of lying across the chest. Trousers are their own
colour now, not a darker shade of the shirt.

  One subtlety worth keeping: scenes seed their guests from a counter (400,
  411, 422 …), and the plain linear generator in `rand()` turns neighbouring
  seeds into near-identical streams — which is how a whole row of chairs ended
  up dressed in the same colour. `person()` scrambles its seed before use. Only
  people do this; the ridges, houses and olive groves are untouched, so the
  world still looks the way it did.

**The figures grew up.** Round two of the feedback called them childish and
stick-like. Three things fixed most of it:
  - **Proportions.** The head was 0.224 of the height — four and a half heads
    tall, which is a child. It is 0.19 now, just over five heads, with the
    neck taking up the difference.
  - **Tapered limbs.** A limb is drawn in two pieces — upper arm thicker than
    forearm, thigh thicker than calf (`limb()` in `art.js`). One width for the
    whole limb is most of what makes a figure read as a diagram of a person
    rather than a drawing of one; the round caps close the elbow and the knee
    by themselves.
  - **Edges.** A hem where the shirt ends, a collar, and shoes with a toe on
    them instead of flat beans.

**Heads and arms move on their own now.** `person()` takes `headAnim` and
`armAnim`; each wraps that part in its own group pivoting on a real joint (the
base of the neck, the shoulder), with `ww-nod`, `ww-nod-slow`, `ww-arm-talk`
and `ww-arm-raise` in §10 of `main.css`. **Use them only where the guest is
close enough to see it.** The dinner table gets all of it. The seated wedding
guests in the chairs get none — thirty distant figures all gesturing is noise
— but the standing crowd on the terrace does, at Dana's request: see
`chatGroup(..., { lively: true })`, which puts everyone on `ww-mingle` (a
weight-shift, more than idling and a long way short of dancing), nods most
heads and gives the talkers their hands. "Everyone in one scene moves in one
register" is still the rule; the register for that scene just went up.

**Welcome Dinner.** Every seat has somebody in it — seven along the far side,
six on the near side, and the table was widened to 1240 to hold them. The
guest who stood on their own at the right-hand end has gone; they read as an
offcut rather than as part of the party. Guests lean and turn towards each
other (`tableUp` and `tableIn` are new poses) instead of facing front in a row.

  Round two: this is the closest the guest ever gets to anybody, and it was
  the one scene where "subtle" had gone too far. Every guest now nods, or
  gestures, or lifts a glass, each on their own clock — see the `BEATS` table
  in `rooms.welcome`. **There is a waiter**, coming up to the head of the
  table with a tray; he stands on the *left* because on a laptop the details
  panel covers everything past about x=1050, and at the other end half the
  guests would never see him.

  Two fixes went with it. The seated poses used to stop the hands .15 of a
  height below the shoulder, which left thirteen people sitting with their
  palms in mid-air about seventy units above the cloth; forearms now come down
  to meet the table edge. And the candles moved to sit *between* the place
  settings — their soft halo used to land exactly on somebody's forearm and
  read as a glowing ball being held.

**The Wedding doorway** (the arch on the promenade, not the room) was rebuilt.
It used to be the garland, a flat slab of teal with a hard edge across it, and
a cypress that read as a dark leaf. Now you look through it onto the ceremony
terrace at golden hour: two headlands, the bay with the sun's path on it, a
parapet, a stone floor with petals down it — and **the couple, hand in hand**,
she in cream with a bouquet, he in navy. They stand with their **backs to us,
looking out over the bay, and they have no faces** — Dana's call, and a good
one: at that size a face is three dots, and three dots on the two people whose
wedding this is looked like a cartoon of them. From behind they are anybody,
which is the point. The whole interior is clipped to the
arch (`clipPath`) so the sea and the floor can run to the jambs without
spilling onto the stone.

  Two numbers hold that composition together. The horizon sits at
  `baseY - 100` so it falls *below* the "Enter" — the word needs the plain
  warm gradient behind it, and the couple's heads want sky around them rather
  than a band of water at eye level. And the couple are placed at `cx ± 20`
  because a figure's hand reaches 0.233 of its own height forward in the
  `listen` pose: move one of them and you have to move the other, or the hands
  come apart.

**The Wedding room.** Four figures came out of the middle of this scene. Two were
drifting across the aisle on a `ww-stroll`, directly between the guest and the
arch. The other two were the couple themselves — a white dress and a dark suit
under the arch — and **removing them was Dana's call, made explicitly**: at
150px tall they could not carry being "the couple", and the scene is stronger
as the ceremony space before everyone is called in. The arch stands dressed,
the petals are down, the aisle is open. Do not put figures back under it
without asking. Everyone else was lifted about 30 units so their feet clear
the bottom of the camera crop (the room is drawn 1600x900, but a laptop crops
roughly the last 33 units), and one more guest joined the group on the right
so nobody stands alone.

**Evening wear.** `person()` takes `evening: true` and dresses itself: a gown
to the floor in one of the GOWNS colours, or a suit from SUITS with a shirt
wedge, two lapels and a tie. `gown: true` / `suit: true` force one or the
other. Two things about gowns are easy to break:
  - A gown's **legs are drawn in the fabric colour**, not skin. The skirt only
    draws for a figure who is standing, so a seated guest in a gown would
    otherwise be sitting there in bare legs — which is exactly what happened
    the first time, in a chair, in front of everybody.
  - A standing gown **gets no shoes**, because a floor-length skirt covers
    them. A pair of shoes poking through the hem is the giveaway.

**The Wedding crowd, again.** Round four: everyone was facing front, banked up
on one side of the terrace, and overlapping badly enough to produce visible
artifacts. It is now scattered the full width in evening dress, turned every
which way — the knots face inward, one guest watches the arch with their back
to us, the photographer is side-on. Three rules hold it together, and they are
written out in full above the cast list in `rooms.wedding`. The important one:

> **No two standing figures overlap in x. At all — not just within a depth
> band.** There is about fifty units of terrace to play with, which is far too
> little for a nearer figure to read as *in front of* another rather than
> *stuck to* it. Depth is carried by size instead: 92–96 at the back against
> 120–128 at the front. If you add a guest, find a gap — the spans are laid
> out in the comment, every one of them at least fifty units clear of the
> next. Do not tuck somebody in behind an existing group.

**The After-Party.** The DJ was 470 units clear of the nearest dancer, which
read as somebody who had wandered off on their own. The decks came in to meet
the floor (now at x=1103 instead of 1276) and the whole thing reads as one
crowd. Round three: the two figures who stood at the far left holding drinks
are gone — next to seven people moving, two people not moving read as a glitch
rather than as a quiet corner — and the floor now runs the full width, seven
dancers plus the DJ. The dancing itself got its energy back: `ww-dance` had
been flattened when every figure animation was scaled down, and is now ±4° with
a lift of 0.052 of the figure's height.

**The music is a licensed recording, and `audio.js` is now tiny.** It went
through three versions before this one — sea-and-wind ambience, then a
synthesised nylon-guitar piece ("somber", and it was), then a synthesised jazz
trio — all because there was no file we were allowed to play. There is now.

  The track is **"Swing Jazz Midnight Club" by Alex Morgan, from Pixabay**
  (track 568167), kept at `assets/audio/swing-jazz-midnight-club.mp3`. The
  Pixabay Content License covers use on a website, commercial or not, with no
  attribution required — which is why this one can be here when the earlier
  suggestions could not. **If you swap it, check the new licence covers a
  *website*,** not just video: most "free for YouTube" music does not, and
  check whether it wants a credit line.

  `audio.js` is an element, a volume and a fade. Two decisions in it are
  deliberate and worth not undoing:
  - **No Web Audio.** Routing the element through an `AudioContext` would buy
    a per-room filter and cost the whole thing working when someone opens the
    HTML by double-clicking it — a media element through an AudioContext goes
    silent under `file://`. Volume alone is enough; at background level nobody
    hears a lowpass. Rooms differ by level, in the `ROOMS` table.
  - **A list of paths, not one.** `SOURCES` holds the file both as
    `assets/audio/…` and as a bare filename, because the site is published two
    ways — with a real `assets/` folder, and flattened to the root of the
    repository with the mp3 beside the HTML. The first path that loads wins.
    Add to the front of that list, never take from the end.

  The `<audio>` element is appended to the document with `id="ww-music"`, so
  the next person wondering whether the music is actually playing can find it
  in the inspector rather than guessing.

> **Recordings Dana sends will keep needing this check.** Round one was two
> YouTube links; round two was an mp3 of a commercially released piano record,
> ripped from YouTube. Neither could go on the site — somebody's copyright,
> and the rips break YouTube's terms as well. Round three was a Pixabay track,
> which is fine, and is what is playing. If a future track arrives from
> anywhere else, the question is always the same: what does its licence say
> about a website? Epidemic Sound, Artlist and Musicbed all licence this kind
> of music properly for a small annual fee.

**The wedding crowd, one more time — and the chairs are gone.** Round five:
the guests were still touching each other. Spacing the `chatGroup` calls apart
had never been the fix, because the overlap was *inside* each group: a chat
group packs its figures 0.42 of a height apart, which is narrower than their
shoulders are wide. Whatever you do with the groups, the people in them
overlap. So `rooms.wedding` does not use `chatGroup` at all. The terrace is
one flat table — `GUESTS` — of figures placed by hand.

  **The chairs went too**, at Dana's request, along with the thirteen guests
  sitting in them. Twenty seats in a 1600-wide scene left nowhere for anybody
  to stand, and the rows were the densest thing in the picture. `chair()` is
  still defined at the bottom of `scenes.js`, unused, if they ever come back.

**Round six: nineteen guests, closer together, and the whole width in
colour.** The brief was more people, more colour, everybody gathered rather
than dotted about, and no dead ground — in particular the empty stretch under
the arch. All three are done, and the aisle now has four people standing in
it. Nobody stands directly under the keystone, so the arch still reads.

  **The width arithmetic was wrong, and this is the thing to remember.** A
  limb in `person()` hangs off the **shoulder**, at x ± 0.132h — the numbers
  in the `POSES` table are measured from there, not from the figure's centre
  line. A `chat` arm whose hand sits .170h along the pose therefore reaches
  0.132 + 0.170 + a 0.036 hand radius = **0.338h**, and 0.379h with a glass in
  it. Round five had assumed a flat 0.235h either side — wrong by a third of a
  figure — and got away with it only because the gaps were wide. Tightening
  the crowd is what exposed it.

  Extents are now worked out **per pose and per side** (a flipped figure has
  them mirrored), with floors of 0.20h for a gown's hem, 0.15h for the ground
  shadow and 0.14h for head and hair. The table is written out in the comment
  above `GUESTS`. Measured on the rendered SVG rather than trusted from the
  model, the closest any two drawn figures come is **15.7 units** and nothing
  overlaps. Gaps run 16–35, unevenly, so the row breaks into knots.

  **If you add or move a guest, do the same arithmetic.** One symmetric margin
  will not do it, and eyeballing it is what put us here twice.

  **The palettes were widened**, in `art.js`: `GOWNS` went from 12 muted jewel
  tones to 19 that are all actual colours — pink, red, orange, yellow, purple,
  blue, green, teal, magenta — with ivory the one pale note left. The greyed
  neutrals were deleted rather than kept, because a scene only draws a dozen
  gowns and every muted entry spent a draw that could have been a colour.
  `SUITS` gained burgundy, deep teal, forest, plum, tobacco and royal, so the
  men are not all charcoal; they stay dark because a pale suit at 120px tall
  reads as pyjamas. Nineteen guests currently come out in fifteen distinct
  outfit colours. **Both lists are used only by the wedding room** — nothing
  else in the site passes `evening: true` — so widening them is safe, and the
  couple in the Wedding doorway are dressed explicitly and were not touched.

  Three more things that are easy to undo by accident:
  - **The gaps are uneven on purpose.** Evenly spaced, nineteen people on a
    strip of terrace read as railings.
  - **Depth is size, and baseY follows it.** 88–96 at the back against
    124–136 at the front, and the sizes alternate along the row instead of
    receding left to right, which is what stops it looking like a queue.
    There is only about fifty units of walkable terrace, so size does nearly
    all the work.
  - **A guest's seed is their row number**, fixed before the draw order is
    sorted by height. Tie it to the draw order instead and changing one
    person's height reshuffles what everybody else is wearing.

  Measured on the terrace layer specifically (parallax means the sky layer
  answers differently): a laptop sees room x=59 across to where the details
  panel starts — 859 at 1280x820, 903 at 1440x900 — and down to y=866.7. Feet
  are at 860 or above, and a shoe hangs about 0.013h below its baseY. Which
  guests fall outside the frame changes with the window; the ones at the far
  ends drop out on a narrow one, which is fine — a crowd should run past the
  edges.

  Heads and hands are animated only on the figures big enough to show it
  (`h >= 100` for a nod, `h >= 110` for talking hands). Nineteen people all
  gesturing is both noise and a lot of separately-animated nodes.

## Deliberate decisions worth knowing
- **2.5D parallax, not Three.js** — the brief recommended this for reliability on phones.
- **Procedural SVG instead of an illustrator's files** — one consistent hand, nothing to commission. To swap in real artwork later, replace a layer's `svg` with `<img>` at the same viewBox proportions.
- **A `noindex` tag + `robots.txt`** keep it out of Google. It's public but unlisted. Delete both if you want it findable.
- Mobile gets a tighter camera crop, artwork over the top two thirds with a
  draggable bottom sheet under it, lighter transitions, fewer particles.
  `prefers-reduced-motion` fully supported.

## Testing

`file://` will not do — the browser blocks the sub-resources. Serve the folder:

```
python3 -m http.server 8912          # then open http://localhost:8912/index.html
```

Two traps that cost real time last session:

- **The preview browser caches hard.** Editing a file and reloading can still
  run the old JavaScript, which looks exactly like "my change did nothing".
  Serving on a **fresh port number** each time is the reliable fix; a
  `Cache-Control: no-store` header on its own was not enough.
- **Test the bundle too, not just `index.html`.** Load `the-journey.html` after
  `python3 build.py` — that file is what the live site actually is. A change
  that works in `index.html` but never got rebuilt is invisible to guests.

Worth checking after any change to the camera or the doorways: park the cursor
at the far-left edge of the hub for two seconds and confirm the doorways do not
drift. That drift was the root cause of three separate complaints.

## Bugs already found and fixed (don't reintroduce)
- `pointer-events: none` on `.layer` also killed the doorway buttons → `.entrance { pointer-events: auto }`
- `setPointerCapture` on the hub stole clicks from the doorways → removed, drag tracked on `window`
- Nearest-doorway highlight only re-evaluated on index change → now tracks distance too
- Panel copy was hidden behind a reveal animation → visibility is now the default, with a 1.5s safety timeout
- Portrait framing showed 40% empty sky → camera crop now derived from aspect ratio, anchored to the ground
- Tab-switching mid-transition left the site stuck → tweens resolve on `visibilitychange`
- `history.pushState` throws in sandboxed frames → wrapped in `safeHistory()`
- Cursor-following edge-pan made doorways slide out from under the pointer →
  removed entirely (drag, wheel, arrow keys and the path map all still work)
- A flipped figure's torso path used direction-swapped hip points and drew
  itself as a bow tie → the torso outline uses unflipped hips
- Programmatic `.focus()` after a mouse click painted a focus ring around the
  whole panel/doorway → focus is only restored for keyboard users
- `transform-box: fill-box` in the stylesheet against user-space
  `transform-origin` values in the JS: leaves swung clear of their pots and
  figures animated by wildly different amounts depending on where they stood →
  every inline origin now carries `transform-box: view-box` with it. **If you
  add an animated element with an explicit origin, it needs both.**
- Nearby integer seeds (400, 411, 422 …) through the linear `rand()` produced
  near-identical colour choices → `person()` scrambles its seed first

## Not done / open

- **The feedback rounds are not live yet.** `python3 build.py` has been run and
  `UPLOAD-THESE-FILES/` is current; both files in it still have to be dragged
  into github.com → Add file ▸ Upload files. Until then the live site shows the
  orange "Enter" chips, the plaque behind the names, and the old ambience.
- **Twelve local commits have never reached GitHub** (count as of 21 Aug 2026;
  `git log --oneline origin/main..main` is the live answer). No credentials on
  this machine. See **Publishing**. Until someone pushes, this folder is the
  only copy of the real sources and of the history — *it is not backed up
  anywhere.* Worth saying out loud to Dana.
- **The repo's loose root files are stale duplicates.** The push fixes them; a
  hand-upload does not. Harmless meanwhile — nothing loads them.
- **The RSVP form still goes nowhere.** `content.js` → `rsvpEndpoint`. One
  Formspree URL turns it on. This is the highest-value five minutes left on the
  project: right now a guest can fill it in, be thanked, and have their reply
  saved only to their own browser where nobody will ever read it.
- **Every date, venue and hotel is invented.** Montenegro is a stand-in.
- **Vercel.** The connector is authenticated (team "DNA"). Its API only takes
  inline file contents, so pasting a 190KB bundle is a bad idea — but
  `create_git_project` can link the existing GitHub repo in one call with no
  payload, which is the clean way to a `vercel.app` URL or a custom domain.
  Note it would deploy *the repo*, which is behind the live site until a push
  happens.
- **The real music.** See the note above about the two YouTube links.
