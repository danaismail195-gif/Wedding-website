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
> Last worked on: **21 August 2026**. Live site verified current on that date
> (byte-identical to the local build).

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
| **Live `index.html`** on GitHub | The current single-file build. Up to date. Uploaded by hand through the GitHub web UI on 21 Aug 2026. |
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
| `assets/js/audio.js` | Sea, wind, birdsong and a soft instrumental bed, synthesised in-browser. One mix per place (`MOODS`). Starts on "Begin the walk"; the choice is remembered. |
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

## Not done / open

- **Ten local commits have never reached GitHub** (count as of 21 Aug 2026;
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
