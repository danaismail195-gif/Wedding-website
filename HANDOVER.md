# Handover — "The Journey" wedding website

> **New Claude Code session? Start here.**
> 1. Read this file, then `BRIEF.md` for the original intent.
> 2. The real sources are in `assets/` — **that is what you edit**.
> 3. **Publishing is now just `git push origin main`.** Credentials are in the
>    keychain and the live site is built from the sources in the repo. The old
>    hand-upload dance is over — see **Publishing** below.
> 4. Test locally before touching anything else. See **Testing** below.
>
> Last worked on: **24 August 2026**. **Everything in this folder is live
> and the repository is in sync** — `git rev-list --left-right --count
> origin/main...main` returned `0  0` after the push on 24 August.

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

## Publishing

**This changed completely on 24 August 2026 and most of what you may have
heard about it is now wrong.** For four months the live site was a single
self-contained `index.html` uploaded by hand through the GitHub web form,
because nobody on this machine could authenticate. That is over.

### To change anything the guest sees
1. Edit the real sources in `assets/js/*` and `assets/css/main.css`
2. `python3 build.py`
3. `git commit` and `git push origin main`
4. Wait a minute for Pages, then hard-reload (⌘⇧R). Browser cache is the usual
   reason a change "did not work".

That is the whole process. **A push updates the live site**, because Pages now
serves the repository itself: root `index.html` is the small source page and it
loads a real `assets/` folder beside it. Relative paths work under the
`/Wedding-website/` sub-path — verified live, scripts, stylesheet and mp3 all
200.

### What is where
| | |
|---|---|
| **Live** | https://danaismail195-gif.github.io/Wedding-website/ ← **capital W**; the lowercase URL 404s |
| **Second live URL** | `.../Wedding-website/the-journey.html` — the same page as one self-contained file. **People have this one bookmarked.** `build.py` keeps it in step; it once sat three days out of date and caused real confusion. |
| **Repo** | github.com/danaismail195-gif/Wedding-website, Pages on `main` / root |

### Credentials
A personal access token is in the macOS keychain (`credential.helper =
osxkeychain`), stored on 24 August. `git push origin main` just works, from a
session or from Terminal. If it ever asks for a username again the token has
expired or been revoked: make a new classic token with the `repo` scope and
push once from Terminal to re-store it.

### `build.py`
Writes `UPLOAD-THESE-FILES/` (`index.html`, `the-journey.html`, the mp3) and
`the-journey.html` at the root, and exits non-zero if a script, the stylesheet
or the music failed to make it in. **`the-journey.html` is generated — never
hand-edit it.**

`UPLOAD-THESE-FILES/` is now only a fallback: it exists so somebody without git
can still drag three files into the web uploader. Nothing needs it in the
normal flow. It is gitignored.

⚠️ **If anyone ever does a web upload again**, it lands as a commit on
`origin/main` and breaks the fast-forward. Fix before pushing:

```
git fetch origin
git merge origin/main -s ours -m "Merge the manual upload"
git push origin main
```

⚠️ **The music cannot be inlined.** It is a real recording; a few megabytes of
base64 in front of the page would hold up the whole site. It lives at
`assets/audio/` and is tracked in git. **If the live site is ever silent, check
the mp3 is being served before touching any code.**

## How the code is organised
| File | What it does |
|---|---|
| `assets/js/content.js` | **All the words.** Names, dates, venues, hotels, RSVP questions. The only file to edit for copy changes. |
| `assets/js/art.js` | Drawing kit — limestone ridges, houses, cypresses, olive trees, lanterns, boats, an airliner, a mailbox, and the people (`person()` and friends, plus `bride()`, `groom()` and `bust()`). |
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

**Round seven: "Enter" under the arch, and the room stopped cropping feet.**
Two pieces of feedback, and the second one turned out to be a framing bug that
had been there since the rooms were built.

  **"Enter" moved to just under the curve of the arch** — 59% of the 460-tall
  entrance box, y=271. The opening's semicircle springs at y=254, so that is
  the first clear line below the curve.

  **The ink had to change with it, and this is the part worth knowing.** The
  doorway interiors are lit at the lintel and deep at the threshold, so the
  higher the word sits the paler its background. Measured against all seven
  gradients, the old ivory scored **1.5–1.9:1** at the new height — invisible.
  What the measuring also turned up is that ivory had never really worked:
  at its *old* position it was running at **1.9–2.6:1** on six of the seven
  doorways. It only ever looked right on the After-Party. The word is now
  espresso `#3B2A22` at 88%, which measures **5.1–6.1:1** on six of them.

  The After-Party is the exception and stays the weakest at about 3.6:1: its
  lintel was `#B98CC9`, a mid lavender that neither a light nor a dark ink can
  sit on. Lightening it to `#DCC0E8` is what got it that far. If it ever needs
  to be better, the lever is the lintel colour, not the ink.

  **Four doorways had art on the new line** and it has been moved down:
  the After-Party glow disc (`ay+96` → `ay+132`), the Explore path apex
  (`ay+76` → `ay+112`), the Travel aeroplane (`ay+74` → `ay+116`) and its pale
  cloud (`ay+88` → `ay+128`), and the RSVP envelope (`ay+52` → `ay+104`) with
  its gold pulse. A pale shape behind the letters washes them out however dark
  the ink is. **If you move "Enter" again, walk all seven and check.**

  **The rooms were cropping people's feet on wide screens.** Room layers are
  1600x900 and CSS slices them to fill the window. The slice was centred
  (`xMidYMid`), so on anything wider than 16:9 the crop came out of the height
  — off the top *and the bottom*. On a 2:1 laptop the bottom cut landed at
  about **y=829**, straight through everybody's shins, which is exactly what
  Dana's screenshot showed. It was never visible on a 16:10 window, which is
  why it survived this long.

  Two changes fix it, and they go together:
  - `wrapRoom()` in `scenes.js` slices room layers **bottom-anchored**
    (`xMidYMax`), so the whole crop is spent on sky. The hub still uses the
    centred `wrap()` — do not change that one.
  - `.room-art` no longer bleeds past the bottom: `inset: -8% -4% 0` instead
    of `-4%`. The bleed exists for the `scale(1.07)` entrance and is fine on
    the top and sides, but at the bottom it was pushing the ground line 66
    units below the window.

  Measured after the fix, **y=900 sits exactly on the foot of the frame at
  every aspect ratio** — verified at 1.33, 1.89, 2.09 and 2.40, plus the
  mobile bottom-sheet layout, which was already bottom-anchored and is
  unaffected. The cost is sky at the top: the After-Party moon is cropped on
  a wide window now. That is the right trade — nobody misses sky, everybody
  notices severed feet.

  **The guests grew about 18%** into the strip of terrace that fix bought:
  heights 104–164 (from 88–136), and there are seventeen of them rather than
  nineteen, because a fixed-width terrace holds either more people or bigger
  people. **`baseY = 0.99h + 727`**, which lands every head top on y=727 —
  figures standing on level ground share a head line at the viewer's eye
  level, and that is what lets the sizes vary this much without anybody
  floating. Change a height, move its baseY by the same rule. Feet now reach
  y=891 against a frame bottom of 900.

  Re-measured off the rendered SVG: seventeen figures, closest approach
  **15.2 units**, no overlaps, at every aspect ratio tested.

**Round eight: the seven doorway interiors are seven different colours.**
Welcome, Where to Stay and RSVP were three warm ambers within a few points of
each other — measured at their midpoints, Welcome and RSVP were an RGB
distance of **12** apart, which is to say the same colour. Where to Stay went
to olive (its shutters, the olive groves), RSVP to rose (a letter and a wax
seal), and Welcome deepened to a redder russet so it is not simply a paler
Wedding. Explore and Travel were nudged apart at the same time, since they
became the closest pair once the ambers were fixed. **The closest any two now
sit is 39.**

  The hues, in order along the promenade: 22° · 26° · 89° · 172° · 216° ·
  274° · 346°.

  Two constraints on any future change here. The **top** of each gradient has
  to carry the espresso "Enter" at y=271 — the current set measures 5.0–6.1:1
  on six of the seven, with the After-Party the exception at 3.9:1 (its
  lavender is a mid tone no ink sits well on; the lever there is the lintel
  colour, not the ink). And art inside the opening has to stay off the word:
  the RSVP gold pulse had to drop to `ay+152` because at `ay+116` its top edge
  cut straight across the letters.

  A quick way to judge them as a set, rather than one at a time by walking the
  promenade: in the console, build a row of `WW.scenes.entranceArt(id)` for
  all seven ids and look at them side by side. That is how the duplicate
  ambers became obvious.

**Round nine: the compositor was running out of texture, and the landing
page reads names-first.**

  **The glitching had a measurable cause.** Dana sent a screenshot of the
  promenade with whole doorways missing their stonework and hard rectangular
  seams across the sky. That is not a drawing bug — it is the compositor
  dropping tiles. Measured in a 1900x950 window, the hub is **nine layers,
  each as wide as the whole promenade, 25.7 megapixels between them**. Every
  one carried `will-change: transform`, which tells Chrome to rasterise the
  layer *in full and up front* instead of tiling it lazily around the
  viewport. At 4 bytes a pixel that is ~98 MB — and on a Retina laptop,
  rastered at 2x in each direction, closer to **390 MB**. Chrome will not
  hand that out, so it drops tiles, and a dropped tile is a rectangle of
  missing artwork.

  `will-change` is gone from `.layer` and `.room-layer`. The layers are still
  composited — `applyCamera()` moves them with translate3d, which promotes
  them anyway — but Chrome now rasterises only what is near the viewport.
  **Do not put it back.** If panning needs to be smoother, make the layers
  narrower or fewer; do not ask for more texture.

  Honest caveat: measured in the preview browser, which had no memory
  pressure to begin with, this trades a little smoothness for the memory —
  50.7 → 47.3 fps idle, 50.0 → 44.9 while panning, with a handful of long
  frames appearing where there were none. That is raster-on-demand, and it is
  the right trade against tiles being dropped outright. If the real machine
  still stutters, the next levers are **fewer layers** (sky+clouds and the two
  ridges could merge, at a small cost in distant parallax) and **fewer
  animated nodes** — 148 of them currently dirty their layers every frame at
  idle, and each dirty tile is a re-rasterisation of a very large texture.

  **The landing page** now reads names first, with the date and place beneath
  them.

  **The names in the top bar** carry the landing page's sea colour into the
  walk, a step larger than before, in `#1D5F70`.

  Getting that colour right took a correction worth recording. The first
  attempt was measured against `#8FB0C4`, the top stop of the sky gradient —
  **which is never on screen.** The camera is anchored to the ground, so the
  blue top of the sky is scrolled off, and Dana pointed out that what is
  actually behind the names is beige. Worse, it is not one colour at all: it
  depends on the shape of the window. Measured at the brand's own position,
  the sky there is `#E4CAB1` on a phone, `#DCC5B3` on a tall window, and
  `#ABB7BE` on a 1440x900 laptop, where it is still grey-blue at that height.

  **Anything chosen here has to survive the worst of those, not the beige.**
  Against `#ABB7BE`: `#1D5F70` is 3.51:1, `--sea-deep` would be 2.68:1, and
  the bright `--sea-mid` 1.17:1. So the turquoise cannot go lighter than it
  now is. 3.51:1 clears the 3:1 bar for large text, which these are at the top
  of their clamp, and the cream glow does the rest.

  `window.__skyBehindNames()` — the console helper used to measure this — is
  not in the code, but it is three lines: map the brand's screen position back
  through the sky layer's viewBox and evaluate the gradient at that y.

  **Where to Stay stayed a plain door.** It was built out into a room — a bed
  along the wall, a shuttered window with the bay outside — and next to six
  doorways that each hold one simple idea it read as clutter. Dana called it
  and it went back. The lesson is in the comment on that branch: these arches
  carry one idea each.

**Round ten: the things inside the doorways sway.** Every arch now has one
element leaning very slightly on its own base — the dinner table, the couple,
the After-Party lanterns, the Explore signpost, the Where to Stay door, the
RSVP mailbox. The class is `ww-lean` in §10 of `main.css`: a rotation of
±1.2°, seven to nine seconds a cycle, each use carrying **its own origin,
delay and duration** so the seven doorways never sway in step.

  Measured travel, corner to corner: 2.1px on the table, 3.1px on the couple,
  3.3px on the door, 3.8–4.1px on the lanterns, 4.2px on the signpost, 4.8px
  on the mailbox. That is the register Dana asked for — you notice the doorway
  is alive, you do not catch anything moving.

  Three things worth knowing before adding more:
  - **`ww-lean` deliberately sets no `transform-box`.** Its initial value is
    already `view-box`, which is the coordinate system the inline
    `transform-origin` values are written in. Adding `fill-box` to the class
    would re-create the bug that once threw the urn leaves clear of their pot.
  - **The pivot has to be the object's own base**, or a hanging point for
    something hung. Travel scales with the distance from origin to the
    farthest corner, so the same 1.2° gives 2px on a table and 5px on a
    mailbox — which is right, taller things sway more.
  - **Check what already animates.** The Travel ferry got a lean and it was
    removed again: `A.boat()` already wraps itself in `ww-bob`, so the lean
    bought 0.8px of travel and a second animated node for nothing. The RSVP
    envelope (`ww-hover-bob`), the key (`ww-swing`), the candles
    (`ww-flicker`) and the dancers are all likewise already moving.

  `ww-lean` is in the `#hub.is-moving` pause list with everything else —
  verified paused while the camera moves, running when it stops. The hub went
  from 148 animated nodes to 155.

  **The Explore path is not animated, on purpose.** Dana asked for "the
  signage and path"; the signpost sways, the path does not. It is ground, and
  leaning the ground reads as the world tilting rather than as air moving.

## Round eleven: the flickering, the doorway labels, and the couple everywhere

A written feedback pass from Dana. One critical bug, one navigation
inconsistency, and five additions. The art direction is unchanged.

### The flickering had a second cause, and it was the cursor

**This is the important entry in this file.** Round nine found the
force-rasterised layers and removed `will-change`. It did not fix what Dana
was seeing, because it was only half of it. The other half:

> **Every layer on the page moved a few pixels whenever the mouse moved.**

`applyCamera()` took the pointer's y and gave each hub layer a vertical
offset of up to five pixels; `applyRoomParallax()` did the same inside a
room, at 22px horizontally and 12px vertically. Neither cost anything on
paper. Both are catastrophic here, because the layers are enormous and they
are **not cheap textures the compositor can slide about**: the camera above
them carries its own `will-change` and a scale, so a change to a child's
transform is paid for in raster, not in compositing.

Measured, in a 904x935 window on a Retina screen, before the fix:

| | idle | with the cursor moving |
|---|---|---|
| the promenade (9 layers of 3311x1364) | 50.3fps, 0 long frames | 38.3fps, **23** frames over 32ms in 2s |
| the Wedding room (5 layers of ~1Mpx) | 49.3fps, 1 | 37.8fps, **29** in 2.5s |

And the control that settles it: writing the *same* transform to all nine
hub layers every frame cost nothing at all (50.3fps, 0 long frames). Writing
one that varied by those same few pixels cost 25. It is not the number of
writes, it is that the value changes.

On this machine that is jank. On a machine with real memory pressure it is
dropped tiles — rectangles of missing artwork and wrong colour, which is
exactly the "mountains and graphics flickering and changing colour" Dana
reported, and exactly the corruption in the screenshot from 23 August.

**Both parallaxes are gone. There is no `pointermove` listener on the
artwork at all any more.** Nothing on this site moves because the cursor
moved; the world moves only when the guest moves it — a drag, the wheel, the
arrow keys, the path map. After the fix, three seconds of the cursor
crossing the whole screen gives **50fps and not one frame over 32ms**, on
the promenade and inside a room, which is what sitting still gives. The
layer transforms are provably unchanged across a sweep.

**Do not add another one.** Five pixels of head-tilt is not worth a page
that flickers, and the depth in these scenes is drawn in — the ridges, the
water, the terrace — it does not need the cursor's help.

**The hub is six layers now, not eight.** Sky and clouds are one; the far
ridge and the middle ridge are one. Same measurement, same window: panning
nine layers ran at 36.5fps with 27 long frames in two seconds, five ran at
49.5fps with one. A realistic drag now measures 50fps / 0, a continuous
wheel 45.6fps / 13 over three seconds. The parallax given up is between a
cloud and the sky behind it, and between two ranges of hills forty units
apart. **Adding a layer here is expensive** — if something needs its own
depth, take it out of an existing layer rather than adding a seventh.

### One rule for all seven doorway labels

`.is-near` marks whichever doorway the camera is standing in front of, and it
used to reveal that doorway's **title** as well as scaling it. So on a laptop
there was permanently one name on screen with its six neighbours waiting to
be hovered — which reads as a bug in the navigation, because the guest cannot
see the rule that produced it. (Dana saw it as "The After-Party is always
labelled"; which doorway it happens to be is just where the camera stopped.)

Titles are now **hover and keyboard focus only**, on all seven, with nothing
permanently open. `.is-near` keeps the quiet half of its job — the small
scale and the brighter "Enter" — which reads as depth rather than as a label
somebody left on.

A touch screen has no hover, and there `.is-near` is the only thing that can
ever show a name, so under `@media (hover: none)` it keeps the title. Still
one rule for all seven doorways on any given device.

### "Start here", over the first doorway only

Small caps type and a hairline arrow above the Welcome Dinner, in the same
espresso ink as "Enter", breathing very slightly and fading out when that
doorway is hovered so it never sits under the title.

Two things about it are load-bearing. It is **bottom-anchored at 76%**, not
hung off `top`: the button is 460 units tall and the stonework only starts at
unit 128 of that, so a cue positioned from the top floats a hundred pixels
clear of the arch it is pointing at. And **the opening pan changed** — the
walk used to land 6% along the promenade, which cut the first doorway in half
on a laptop. It now lands at whichever is smaller, that 6% or "the first
doorway's left edge, 46px in". Half a doorway is a poor thing to be told to
start at.

### Dana and Nadeem, in six places

The couple now appear on the Wedding terrace, on the After-Party floor, in a
window on the Where to Stay street, in the aeroplane on Travel Details,
posting the reply at the RSVP gate, and (as before) inside the Wedding
doorway on the promenade. **They are recognisably the same two people in all
of them**, and that is what `A.COUPLE`, `A.bride()` and `A.groom()` in
`art.js` are for: one ivory gown, one deep navy tuxedo, one white bow tie,
one veil, set once. Nothing else in the site dresses itself from that table.
If any of it changes, it changes there and every scene follows.

`person()` gained `veil` and `bowTie` to make this work, and **both draw
whatever `flat` says** — on the after-party floor the couple are silhouettes
and the veil and the bow tie are the only white things on them, which is the
entire trick of that scene. Two traps found the hard way:
  - The veil has to flare to **0.235 of the figure's height**. A standing
    gown's hem reaches 0.20 either side and the shoulders 0.132, so the first
    attempt at 0.15 was drawn entirely behind the bride and only its cap ever
    showed — which read as a white band across her brow.
  - The cap sits on the **crown**, not the hairline. At the first value it
    came down level with the eyes and read as a blindfold.
  - `groom()` has to set `dress: false` and its own `pants`. `person()`
    gives anybody a 45% chance of a dress, and trousers only follow the
    jacket when `evening` is set — which a groom drawn on his own is not. The
    first render put him in a skirt and brown trousers.

`A.bust(win, o)` is new: a whole figure, drawn the ordinary way and clipped
to an opening, for the people at the windows on Where to Stay and in the
aeroplane. It takes a rectangle or a circle. **Drawing a second, simplified
upper-body kit would have been less code today and two kits drifting apart by
the next round of feedback** — this way the people in the windows have the
same heads, hair, faces and animations as everybody else.

### The Wedding: the couple are back under the arch

They were taken out at Dana's request in an earlier round, on the grounds
that at 150px tall two figures could not carry being "the couple". They are
back at Dana's request, and this time they can, because the guest has met
them five times before they get here.

**Three guests came out to make the room** — the ones at x=526, 632 and 713,
directly under the arch. Fourteen are left. The couple stand at 586 and 684
facing each other, on the same head line as everybody else
(`baseY = 0.99h + 727`), sized 152 and 158 — the largest pair on the terrace.
Worked the usual way, per pose and per side: `listen` reaches .283h near and
.238h far, the veil .235h, so the bride occupies 550.3–629.0 and the groom
639.3–721.6. Ten units of daylight between them, their raised hands
twenty-one apart, and about sixty units of empty terrace either side of the
pair. **That space is the composition** — if you add anybody back into it,
you lose the focal point. They move on `ww-idle` and a slow nod, not the
`ww-mingle` the party is on: everybody else is waiting for something to
start, these two are the something.

### The RSVP room: somebody posting the reply

The guestbook table, the quill and the three candles have gone. A table and a
book are a still life, and this is the one doorway that asks the guest to do
something. In their place: a figure at a mailbox with a letter **half inside
the slot**.

The letter is genuinely half in, and that is a clip, not a trick of layering.
The envelope is drawn as its own element (it cannot be clipped from inside
`person()`) carrying the same `ww-post` class, origin and delay as the arm
holding it, so the two move as one; the clip is two rectangles — everything
short of the box, plus the slot band itself — so past the near cheek only a
sliver of envelope survives.

Every number in that scene depends on the others and they are written out in
full in the comment. The one to know: `straight: true` turns off the random
lean and shoulder tilt every other figure gets, because with them on the hand
lands up to three units from where the envelope was calculated to be. The
other: the first attempt put the hand exactly on the lip of the slot, which
is where a hand actually goes, and left barely a corner of the envelope
showing — it has to stand off a little for a letter to read as a letter.

`ww-post` is mostly a slide with a degree and a half of turn in it. A pure
rotation about the shoulder moved the hand *down*, because the arm is nearly
horizontal at the slot.

### Where to Stay: the street is occupied

Six of the eighteen windows have somebody in them and two of the five
doorways, in no pattern. **Not every window** — somebody at every opening is
a doll's house, not a street.

The **top storey of the second house is one wide window** rather than two
narrow ones, because two heads will not go in 52 units side by side, and the
bride and groom are in it. The second house on purpose: on a laptop the
details panel covers the room from about x=900, so the fifth house is never
seen and the fourth only half.

### Travel Details: an aeroplane with the couple aboard

The 100-unit silhouette that used to cross this sky on a 34-second loop has
gone. Dana asked for people visible through the windows, and the two are not
compatible: a shape that small has no windows, and one that crosses the frame
would show its passengers for part of a minute at a time. `A.airliner()` is
new — 556 long, fuselage 84 deep, six round windows about 38 across, which is
the smallest a window can be and still hold a face. It holds its position and
drifts on `ww-cruise`, and the contrail does the work of saying it is moving.

**It sits at x=540, and that number is two crops at once.** A laptop sees the
room from x≈80 to wherever the panel starts, around 1020. A phone is tight at
the *other* end — the artwork is drawn wider than the screen and centred, so
a 375-wide phone sees x=229 to x=1371. At the first position, x=430, the tail
was cut ninety units short on every phone. **Check both ends when you place
anything large in a room.** The contrail is deliberately longer than either
crop: a vapour trail that ends inside the frame looks like a scratch.

Bride in the third window, groom in the fourth, four other passengers, and
**one seat with nobody at the window** — an aeroplane with a face in every
opening reads as a diagram.

## Round twelve: why the walk was slow

Dana reported the site as "very slow" and asked for the cache to be cleared.
The cache was not it — a cold cache makes a page slower, not faster — and
the load was never the problem either: **2.2s and 85KB over the wire**, all
of it scripts and one stylesheet, measured on the live site. What was slow
was the walk itself, and it was measured rather than guessed at.

### The layers were being rasterised full-width

Measured live at 1280x800 on a Retina screen: the promenade idled at 50fps
and panned at **33.5fps with a 120ms hitch**. Three experiments found it:

| | |
|---|---|
| same seven layers, artwork removed | 49.9fps, 1 long frame |
| artwork, clipped to the viewport | 46.9fps, 3 |
| as shipped | 30.4fps, 44 |

So compositing the surfaces is free and **rasterising the artwork is the
whole cost** — and Chrome was rasterising the entire 2176px width of every
layer even though only 1280px of any of them is ever on screen.

**The fix is one static clip per layer.** A layer at depth *d* only ever
translates by `pan * d`, so the strip of it that can ever be seen is
`viewport + maxPan * d` wide; everything past that is artwork the guest
could not reach by walking the promenade end to end. `layout()` now clips
it away. With the ambient animations paused the way they are while the
camera moves: **34.8fps / 28 long frames → 48.5fps / 4**, and panning is now
flat at 50fps at every speed from 4 to 60 pixels a frame.

Two things that cost an experiment each and are worth not rediscovering:
- **The clip has to be static.** One recomputed each frame to follow the pan
  is *worse than none* — 22fps — because changing it forces the re-raster it
  was meant to avoid.
- **A wrapper with `overflow: hidden` does not work.** Each layer inside a
  static viewport-sized window measured 29.9fps, worse than plain. It has to
  be a clip on the layer itself.

The doorway plane is deliberately left unclipped: it is exactly world-width
anyway, and it is the one layer with things drawn outside the arch.

### The doorway transitions were the worst moment on the site

Dolly in measured **28.8fps with a 260ms hitch**, dolly out **20.8fps with
300ms** — a lurch at exactly the moment the guest has just clicked. Two
causes, both now moved off the critical frame:

- **The room was built on the frame it appeared.** Parsing ~90KB of SVG into
  five layers and laying out the panel costs 23–36ms, and it was landing on
  the same frame as the browser's first raster of a room it had never drawn.
  `openRoom` now calls `renderRoom(id, true)` at the *start* of the walk
  through the doorway — the room is `visibility: hidden` until `is-open`, so
  a second and a half early shows nothing. The staggered arrival of the copy
  had to be split out into `revealPanel()`, or it would have played and its
  own 1.5s safety timeout fired before the guest ever saw the room.
- **The hub came back from nothing at 3.4x.** It is `visibility: hidden`
  while the guest is in a room, so its textures are gone; `closeRoom` made it
  visible again at full zoom and started the zoom-out on the same frame. The
  veil is fully opaque there and does not lift for another 120ms, so the
  zoom-out now waits 34ms and lets that first raster land behind it.

### On measuring this at all

The preview browser's `requestAnimationFrame` died partway through this
round, which makes every frame-rate number and every tween unrunnable.
**`tween.js` snaps all pending tweens to their end on `visibilitychange`,
and the preview document reports itself hidden** — so dispatching that event
by hand drives the whole open/close/step state machine synchronously. That
is how the transition changes were verified without frames: room built
before the swap, stagger not started early, `busy` released, camera back to
identity, room-to-room stepping intact. Worth remembering; it is the only
way to test transitions when frames are not running.

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
- **Artwork moving because the cursor moved.** Both parallaxes read the
  pointer and rewrote every layer's transform on `pointermove`; the layers
  are large and are rasterised rather than composited, so the mouse crossing
  the screen made the page drop frames and, under memory pressure, drop
  tiles — the flickering and colour-shifting Dana photographed. Removed
  entirely, on the hub and in the rooms. **There is no `pointermove`
  listener on the artwork; do not add one.**
- `.is-near` revealed the centred doorway's title, so one of the seven was
  always labelled and the other six were not → titles are hover/focus only
  on a device that has hover, `.is-near` on one that does not
- A cue positioned with `top` above an `.entrance` floats ~115px clear of the
  arch, because the button is 460 units tall and the stonework starts at unit
  128 → "Start here" is bottom-anchored at 76%
- `groom()` drawn without `evening` inherited `person()`'s 45% chance of a
  dress and a random pair of trousers → it sets `dress: false` and its own
  `pants`
- A veil narrower than 0.235h is drawn entirely behind the bride (the gown's
  hem reaches 0.20h) and only its cap shows, which reads as a headband

## Not done / open

- **The RSVP form still goes nowhere.** `content.js` → `rsvpEndpoint: ''`. One
  Formspree URL turns it on. **This is the highest-value five minutes left on
  the project**: right now a guest can fill it in, be thanked, and have their
  reply saved only to their own browser, where nobody will ever read it. The
  site is live and the RSVP doorway is the loudest thing on the promenade.
- **Every date, venue and hotel is invented.** Montenegro is a stand-in until
  the real destination is confirmed. When it is, only the illustrations need
  redrawing — the content structure and the interactions stay.
- **The email is a placeholder** — `hello@danaandnadeem.example`, set once in
  `content.js` → `couple.email`.
- **Speed.** Round twelve took panning from 33.5fps to ~50 and moved the
  two big transition hitches off the frame the guest sees. The frame-rate
  ceiling in the preview browser is 50fps, so "50fps / 0 long frames" means
  "as smooth as this browser goes", not 60. **Nobody has measured on Dana's
  machine.** If it is still not smooth there, the remaining lever is the
  dolly itself: the zoom alone measured 44fps because scaling the world
  re-rasterises every layer every frame, and the ways down are a smaller `Z`
  or a shorter transition, both of which change how it feels.
- **The glitching: reproduced, measured and fixed.** Round nine's cause was
  real but only half of it; round eleven found the other half — every layer
  moved a few pixels on every `pointermove` — and it *was* reproducible, at
  38fps with 23 long frames in two seconds against 50fps and none when
  still. Both parallaxes are gone and the hub is six layers rather than
  eight. Worth confirming on Dana's machine, but this one was measured
  rather than guessed at. If anything still stutters, the remaining lever is
  **fewer animated nodes** — 155 of them dirty their layers at idle on the
  promenade, 87 in the Wedding room.
- **Vercel.** The connector is authenticated (team "DNA"). Its API only takes
  inline file contents, so pasting a 200KB bundle is a bad idea, but
  `create_git_project` can link the GitHub repo in one call with no payload —
  the clean route to a `vercel.app` URL or a custom domain. Now that the repo
  is the source of truth, deploying it would give the same site.
- **The real music.** See the licence note above. Any new track needs a licence
  that covers *a website*.
