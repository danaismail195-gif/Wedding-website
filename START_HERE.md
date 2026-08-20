# Start Here — Wedding Website Project

## What's in this folder
- `BRIEF.md` — the full project spec. Claude Code will read this to build your site.

## What you need first (one-time setup on your computer)

1. **Install Node.js** (if you don't already have it)
   Go to https://nodejs.org and download the "LTS" version. Install it like any normal app.

2. **Install Claude Code**
   Open the Terminal app (Mac: search "Terminal" in Spotlight; Windows: search "Command Prompt" or "PowerShell").
   Paste this in and hit Enter:
   ```
   npm install -g @anthropic-ai/claude-code
   ```
   Wait for it to finish.

## Every time you want to work on the site

1. Open Terminal.
2. Navigate into this folder. If you put this folder on your Desktop, type:
   ```
   cd Desktop/wedding-website
   ```
3. Start Claude Code:
   ```
   claude
   ```
4. Once it says it's ready, paste this as your first message:
   ```
   Read BRIEF.md in this folder and build this website. Start with Section 7's build order — first, static HTML/CSS for the Main Pathway with all 7 entrances positioned, no animations yet.
   ```
5. Let it work. It will create files in this same folder.
6. When you want to see progress, ask it: "start a local server so I can preview this in my browser." It will give you a link like `http://localhost:3000` — open that in Chrome or Safari.

## That's it

Every time after this, just repeat steps 1–3 (open Terminal, `cd` into the folder, type `claude`) and it will remember everything about your project from before.

---

## ✅ The site is built

It's in this folder now. To look at it, double-click **`index.html`** — that's it,
it opens in your browser and works.

**Read `README.md` next.** It's written for you, not for a developer, and it
covers:

- where to change the dates, venues, hotels and RSVP questions (one file:
  `assets/js/content.js`)
- how to make the RSVP form actually send replies to your inbox
- how to put the site online for free, in about a minute
- how everything works if you want to hand it to someone else later

When the real venue is confirmed, come back here, run `claude`, and say:
*"redraw the illustrated scenes for [wherever it is]"* — all the words, dates
and the RSVP form stay exactly as they are.
