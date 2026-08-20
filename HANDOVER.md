# Handover — "The Journey" wedding website

## What this is
An illustrated wedding website the guest **walks through** rather than scrolls.
A stone promenade above the Bay of Kotor with **seven doorways** along it, in the
order the trip happens. Click one → the camera dollies through the arch → a
dedicated illustrated room with the details. Built from `BRIEF.md` (still in the
folder — read it for the original intent).

- **Folder:** `/Users/dana/Downloads/wedding-website`
- **Live:** https://danaismail195-gif.github.io/Wedding-website/ ← note the **capital W**, the URL is case-sensitive
- **Also live (identical):** `.../Wedding-website/the-journey.html`
- **Private preview:** https://claude.ai/code/artifact/49a2e1ea-4a10-4582-9f78-b0e18646e9c1
- **Repo:** github.com/danaismail195-gif/Wedding-website (public, GitHub Pages on `main` / root)
- Local git repo exists with full history. No remote configured.

## ⚠️ Read this before changing anything
The **live** `index.html` is a *single self-contained build* — the CSS and all six
JavaScript files are baked inside it (~155KB). This was a workaround: GitHub's
web uploader flattened the `assets/` folder, so the normal `index.html` couldn't
find its files.

**Consequence: editing `assets/js/content.js` does NOT change the live site.**
The live copy has its own inlined duplicate.

The correct workflow is:
1. Edit the real source in `assets/js/*` and `assets/css/main.css`
2. Rebuild the single file (script below)
3. Upload the rebuilt `index.html` to GitHub

Better long-term fix: publish via **GitHub Desktop** instead of the web uploader
(it preserves folders), then delete the loose `app.js`, `main.css` etc. currently
sitting at the repo root and let `index.html` use `assets/` normally. See `PUBLISH.md`.

Rebuild command (regenerates the single-file `index.html` from source):
```
python3 - <<'PY'
import re, os
html = open('index.html', encoding='utf-8').read()
css  = open('assets/css/main.css', encoding='utf-8').read()
js   = [open('assets/js/%s.js' % n, encoding='utf-8').read()
        for n in ['tween','content','art','scenes','audio','app']]
head = html.split('<head>',1)[1].split('</head>',1)[0].replace(
    '<link rel="stylesheet" href="assets/css/main.css">', '<style>\n'+css+'\n</style>')
body = re.sub(r'<script src="[^"]*"></script>\s*', '',
              html.split('<body>',1)[1].split('</body>',1)[0]).rstrip()
body += '\n\n<script>\n' + '\n'.join(js) + '\n</script>\n'
os.makedirs('UPLOAD-THIS-ONE-FILE', exist_ok=True)
open('UPLOAD-THIS-ONE-FILE/index.html','w',encoding='utf-8').write(
    '<!DOCTYPE html>\n<html lang="en">\n<head>'+head+'</head>\n<body>\n'+body+'</body>\n</html>\n')
print('rebuilt')
PY
```

## How the code is organised
| File | What it does |
|---|---|
| `assets/js/content.js` | **All the words.** Names, dates, venues, hotels, RSVP questions. The only file to edit for copy changes. |
| `assets/js/art.js` | Drawing kit — limestone ridges, houses, cypresses, olive trees, lanterns, boats, dancers. |
| `assets/js/scenes.js` | The 8 places: `hub()` (the promenade), `entranceArt(id)` (the 7 doorways), `rooms.*` (7 environments). All procedural SVG. |
| `assets/js/app.js` | Camera, pan/drag, transitions, room rendering, RSVP form, deep links. |
| `assets/js/tween.js` | Tiny animation engine (replaces GSAP). |
| `assets/js/audio.js` | Ambient sea/wind synthesised in-browser. Off by default. |
| `assets/css/main.css` | Design tokens at `:root`, layout, all ambient keyframes. |
| `the-journey.html` | Single-file build (same content, no `assets/` needed). |

**Zero dependencies, no build step, no framework.** Classic `<script>` tags so it
opens by double-clicking. Artwork is generated in code — there are no image files.

Palette (from the brief): terracotta `#C4643C`, dusty blue `#7A97A8`, cream
`#F4E7D3`, espresso `#3B2A22`, olive `#7C8B5E`, gold `#E4A853`.
Type: Cormorant Garamond (display) + Karla (body), via Google Fonts.

## Still placeholder — needs real values
- **Couple's names** — currently "Mira & Sam" (`content.js` → `couple.names`)
- **Everything about the wedding** — dates (June 2027), venues, hotels, the Explore
  list. All invented for Montenegro / Bay of Kotor as a stand-in until the real
  destination is confirmed. When it is, only the illustrations need redrawing —
  content structure and interactions stay.
- **RSVP goes nowhere.** `content.js` → `rsvpEndpoint: ''`. The form validates and
  thanks the guest but only saves to their own browser. Paste a Formspree URL there
  to actually receive replies. See `README.md` §3.
- **Email** `hello@miraandsam.example` appears in several places.

## Deliberate decisions worth knowing
- **2.5D parallax, not Three.js** — the brief recommended this for reliability on phones.
- **Procedural SVG instead of an illustrator's files** — one consistent hand, nothing to commission. To swap in real artwork later, replace a layer's `svg` with `<img>` at the same viewBox proportions.
- **A `noindex` tag + `robots.txt`** keep it out of Google. It's public but unlisted. Delete both if you want it findable.
- Mobile gets a tighter camera crop, an illustration band above a content sheet, lighter transitions, fewer particles. `prefers-reduced-motion` fully supported.

## Bugs already found and fixed (don't reintroduce)
- `pointer-events: none` on `.layer` also killed the doorway buttons → `.entrance { pointer-events: auto }`
- `setPointerCapture` on the hub stole clicks from the doorways → removed, drag tracked on `window`
- Nearest-doorway highlight only re-evaluated on index change → now tracks distance too
- Panel copy was hidden behind a reveal animation → visibility is now the default, with a 1.5s safety timeout
- Portrait framing showed 40% empty sky → camera crop now derived from aspect ratio, anchored to the ground
- Tab-switching mid-transition left the site stuck → tweens resolve on `visibilitychange`
- `history.pushState` throws in sandboxed frames → wrapped in `safeHistory()`

## Not done
- **Vercel.** The connector is authenticated (team "DNA") and deployments are
  publicly reachable, but its API only accepts file contents pasted inline, and
  hand-copying 155KB was judged too error-prone. **Now that the GitHub repo exists,
  `create_git_project` can link it to Vercel in one call with no payload** — that's
  the clean way to get a `vercel.app` URL or a custom domain.
- Loose `app.js`, `main.css`, `scenes.js` etc. at the repo root are leftovers from
  the flattened upload. Unused and harmless; delete when convenient.
