# The Journey — your wedding website

An illustrated world your guests walk through. They land on a stone promenade
above the Bay of Kotor, walk left and right along it, and step through seven
doorways — one for each part of the trip. A lantern in the corner takes them
straight to the RSVP from anywhere.

Everything is drawn in code. There are no image files to lose, no fonts to
install, no build step, and no monthly bill.

---

## 1. Looking at it

**The quickest way:** double-click `index.html`. It opens in your browser and
works.

**The proper way** (recommended before you send the link to anyone — it behaves
exactly as it will online). In Terminal, from this folder:

```bash
python3 -m http.server 3000
```

Then open **http://localhost:3000** in your browser. Press `Ctrl + C` in
Terminal to stop it.

---

## 2. Changing the words

Open **`assets/js/content.js`** in any text editor (TextEdit, Notepad, VS Code).
Everything a guest reads lives in that one file — names, dates, venues, hotel
links, the RSVP questions. Nothing else needs touching.

The rules:

- Change what's **between the quote marks**. Leave the quote marks alone.
- Leave the commas at the end of each line.
- To delete a card or a fact, delete its whole `{ ... }` block, including the
  comma after it.
- Save the file, then reload the page in your browser.

If you break something, the page will come up blank — undo your last change
(`Cmd + Z`), save, reload, and it will come back. Nothing is ever permanently
broken.

### The seven doorways

They appear on the path in the order they are listed in `content.js`, which is
the order the trip actually happens:

| # | Doorway | What it holds |
|---|---------|---------------|
| 1 | Welcome Dinner | Date, time, venue, dress code, a note from you |
| 2 | The Wedding | Date, arrival time, ceremony time, venue, dress code |
| 3 | The After-Party | Time, venue, dress, theme, small print |
| 4 | Explore | Ten things to do, filterable by mood |
| 5 | Where to Stay | Hotels with price tier, distance, booking links |
| 6 | Travel Details | Airports, transfers, visas, buses |
| 7 | RSVP | The form, deadline, plus-one and children policy |

To add an eighth doorway you would also need a new illustrated room, so ask
Claude Code for that rather than editing by hand.

---

## 3. Collecting real RSVPs

Out of the box the form validates properly, saves the answer in the guest's own
browser and thanks them — good enough for testing, but **the answers do not
reach you**. To actually receive them:

1. Go to **https://formspree.io** and make a free form. Free covers 50 replies a
   month; their cheapest paid tier covers a normal wedding.
2. They give you a web address like `https://formspree.io/f/abcdwxyz`.
3. Open `assets/js/content.js`, find the line near the top that reads
   `rsvpEndpoint: '',` and paste the address between the quote marks:

   ```js
   rsvpEndpoint: 'https://formspree.io/f/abcdwxyz',
   ```

4. Save, reload, and send yourself a test RSVP.

Every reply then arrives in your inbox with the name, email, which events they
are coming to, plus-one, children, food needs and their note.

If the internet drops mid-reply the site says so and tells the guest to email
you instead, so nobody's answer is silently lost.

---

## 4. Putting it online

The whole site is a folder of plain files, so almost anything will host it —
free.

- **Netlify Drop** (easiest, about a minute): go to
  https://app.netlify.com/drop and drag this whole folder onto the page. You
  get a link immediately. To update it later, drag the folder again.
- **GitHub Pages**, **Cloudflare Pages**, **Vercel** — all work the same way,
  no settings to change.

Guests can also be sent straight to one part: add `#rsvp`, `#travel`, `#stay`
and so on to the end of the address. For example
`https://yoursite.com/#rsvp` opens the RSVP room directly. Handy for the
"please reply!" reminder message.

---

## 5. What's in the folder

```
index.html               the page itself
assets/css/main.css      all styling, colours and ambient animation
assets/js/content.js     ← every word on the site. This is your file.
assets/js/scenes.js      the eight illustrated places (hub + seven rooms)
assets/js/art.js         the drawing kit: cliffs, houses, olive trees, lanterns
assets/js/app.js         the camera, transitions, RSVP form
assets/js/tween.js       a small animation engine (replaces GSAP)
assets/js/audio.js       ambient sea and wind, generated live, off by default
BRIEF.md                 the original project brief
```

Colours live at the top of `assets/css/main.css` under `:root` — terracotta,
dusty blue, cream, espresso, olive, gold. Change them there and the whole site
follows, illustrations included.

---

## 6. How guests move around

- **Walk the path:** drag, scroll, trackpad-swipe, or the `←` `→` keys. On a
  phone, swipe.
- **Enter a doorway:** click or tap it. The camera glides through the arch.
- **Come back:** "Back to the path" bottom-left, the `Esc` key, or the browser's
  back button. They return to the doorway they came out of, not the far end.
- **Skip ahead:** the dots along the bottom jump to any doorway; the "Previous /
  Next" links inside a room walk on without going outside first.
- **RSVP from anywhere:** the glowing lantern, bottom-right.
- **Sound:** off by default. The speaker button top-right turns on wind and sea.

---

## 7. Things worth knowing

- **Montenegro is a placeholder.** When the venue is confirmed, only the
  illustrations change — every date, list and interaction stays exactly as it
  is. Ask Claude Code to "redraw the scenes for <place>".
- **It works on phones.** Portrait screens get a tighter camera, lighter
  transitions, fewer drifting lights, and rooms become an illustration above a
  content sheet. Every button is at least 44px.
- **It respects accessibility settings.** Guests with "reduce motion" turned on
  get clean cross-fades and a still scene, with all the same content. The
  doorways are real buttons, so keyboard and screen-reader users can tab
  through them.
- **It works offline** once loaded, and from a USB stick.
- **Nothing tracks your guests.** No analytics, no cookies, no third-party
  scripts. The only outside request is for the two fonts, and the site still
  looks right if that fails.
