# Handover — "The Journey" wedding website

> **New Claude Code session? Start here.**
> 1. Read this file, then `BRIEF.md` for the original intent.
> 2. The real sources are in `assets/` — **that is what you edit**.
> 3. The live site is a separate self-contained bundle. Changing `assets/` does
>    nothing to it until you run `python3 build.py` and the rebuilt
>    `UPLOAD-THIS-ONE-FILE/index.html` is uploaded to GitHub by hand. See
>    **Publishing** below — nobody on this machine can `git push`.
> 4. Test locally before touching anything else. See **Testing** below.
>
> Last worked on: **21 August 2026** (second round — see *What changed in the
> second August 2026 round*). **The live site is now behind this folder again:
> the rebuilt `UPLOAD-THIS-ONE-FILE/index.html` has not been uploaded yet.**

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
| **Live `index.html`** on GitHub | The single-file build as of the *first* 21 Aug 2026 pass. **Now out of date** — the feedback round below has been built into `UPLOAD-THIS-ONE-FILE/index.html` but not uploaded. |
| **Everything else** in the GitHub repo | Stale. Loose `app.js`, `content.js`, `main.css`, `scenes.js`, `tween.js`, `art.js`, `audio.js` sit at the repo root, left over from an old flattened upload. Nothing loads them — the live `index.html` is self-contained — so they are harmless, just misleading. There is no `assets/` folder on GitHub at all. |
| **This local repo** | The truth. Real sources in `assets/`, full history, plus `HANDOVER.md` and `build.py` that GitHub has never seen. |

**Consequence: editing `assets/js/content.js` does NOT change the live site.**
The live copy is a separate inlined bundle.

### To change anything the guest sees
1. Edit the real sources in `assets/js/*` and `assets/css/main.css`
2. `python3 build.py`
3. Upload `UPLOAD-THIS-ONE-FILE/index.html` to the repo root via
   github.com → **Add file ▸ Upload files** → drag it in → **Commit changes**
4. Wait a minute for Pages, then hard-reload (⌘⇧R). Browser cache is the usual
   reason a change "did not work".

`build.py` writes `UPLOAD-THIS-ONE-FILE/index.html` (the one to upload) and
`the-journey.html`, and exits non-zero if a script or the stylesheet failed to
make it into the bundle. `the-journey.html` is generated — never hand-edit it.

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
| `assets/js/audio.js` | **The music.** A nylon-string guitar (Karplus–Strong), a string pad and a soft bass, synthesised in-browser and sequenced live. One key, tempo and mix per place (`MOODS`). No sea, wind or birdsong — those buses are gone. Starts on "Begin the walk"; the choice is remembered. |
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
close enough to see it.** The dinner table gets all of it; the wedding crowd
deliberately gets none, because thirty distant figures all gesturing is noise,
and "everyone in one scene moves in one register" is still the rule.

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

**The After-Party.** The DJ was 470 units clear of the nearest dancer, which
read as somebody who had wandered off on their own. The decks came in to meet
the floor (now at x=1103 instead of 1276), a sixth dancer fills the space
between, and the whole thing reads as one crowd.

**The music is new, and it is only music.** `audio.js` was rewritten. The sea,
wind and birdsong buses are deleted — the feedback asked for no environmental
sound at all, and there is none. In their place: a piece built on the
Andalusian cadence (i–VII–VI–V), played by a nylon-string guitar, a three-voice
string pad and a soft bass through a synthesised hall. Each room shifts the
key, the tempo and the balance — the same band, a different part of the
evening. The guitar is Karplus–Strong (a noise burst fed back through its own
delay line), which is what makes it sound like gut and wood rather than an
oscillator. The after-party keeps a muted kick on the beat; it is an
instrument, not a room recording.

  Levels were checked rather than guessed: rendered offline, the piece peaks
  around -4 dBFS on the loudest room and -6 dBFS elsewhere, with nothing
  clipping. `OUT` in `audio.js` is the single make-up gain if it needs to be
  louder or quieter overall; the per-room numbers next to it are a *balance*
  between the three instruments, not a volume.

> **Still true, and worth repeating to Dana:** the two tracks in the original
> feedback were YouTube links. They cannot be downloaded and re-hosted — it is
> against YouTube's terms and the recordings are somebody's copyright. If she
> wants a specific recording, it needs a licence (Epidemic Sound, Artlist or
> similar); then drop the file in, delete the scheduler, and point the music
> bus at an `<audio>` element. The mixing, the per-room levels and the ducking
> all keep working.

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

- **The feedback round is not live yet.** `python3 build.py` has been run and
  `UPLOAD-THIS-ONE-FILE/index.html` is current; it still has to be dragged into
  github.com → Add file ▸ Upload files. Until then the live site shows the
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
