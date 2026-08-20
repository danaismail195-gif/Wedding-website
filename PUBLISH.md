# Putting the site on GitHub

Everything on this side is done. The folder is already a git repository with
your commits made and ready to publish.

Creating the repository on GitHub needs your GitHub login, which isn't on this
computer (no GitHub CLI, no saved credentials, no SSH key), so the last two
steps are yours. Pick whichever route suits you — about five minutes either way.

No remote is configured, deliberately: that's what lets GitHub Desktop offer you
its **Publish repository** button, which creates the repository for you.

Once it's live the address will be:

**https://danaismail195-gif.github.io/wedding-website/**

> **One thing to know:** GitHub Pages is free only for **public** repositories,
> so the files will be readable by anyone who finds the address. That's normal
> for a wedding site and the content is still placeholder. I've added a
> `robots.txt` and a `noindex` tag so it won't show up in Google — people need
> the link. If you'd rather it be genuinely private, use Netlify Drop instead
> (see README section 4) or tell me and I'll suggest a password-protected host.

---

## Route A — GitHub Desktop (easiest, no terminal)

1. Download **GitHub Desktop**: https://desktop.github.com — install it like
   any app, then sign in to GitHub when it asks (it opens a normal browser
   login, no tokens or codes to copy).
2. In GitHub Desktop: **File → Add Local Repository…**
3. Choose this folder:
   `/Users/dana/Downloads/wedding-website`
   It will recognise it straight away and show the commit that's already there.
4. Click the **Publish repository** button at the top.
   - Name: `wedding-website`
   - **Untick "Keep this code private"** (Pages needs it public)
   - Click **Publish repository**
5. Now turn the website on. Go to
   https://github.com/danaismail195-gif/wedding-website/settings/pages
   - **Source:** Deploy from a branch
   - **Branch:** `main`, folder `/ (root)`
   - Click **Save**
6. Wait about a minute, then open
   **https://danaismail195-gif.github.io/wedding-website/**

After this, any change you make to `assets/js/content.js` is published by
clicking **Commit** and then **Push** in GitHub Desktop.

---

## Route B — All in the browser, nothing to install

1. Go to https://github.com/new
   - **Repository name:** `wedding-website`
   - **Public**
   - Do **not** tick "Add a README file"
   - Click **Create repository**
2. On the empty repository page, click the link **"uploading an existing file"**.
3. Open the `wedding-website` folder in Finder. Select these four items:
   `index.html`, `README.md`, `robots.txt`, and the `assets` folder — then drag
   them onto the GitHub page. (Ignore the greyed-out hidden files; they aren't
   needed.)
4. Scroll down and click **Commit changes**.
5. Turn the website on, exactly as in step 5 above:
   https://github.com/danaismail195-gif/wedding-website/settings/pages
   → Deploy from a branch → `main` → `/ (root)` → **Save**.
6. Wait a minute, then open
   **https://danaismail195-gif.github.io/wedding-website/**

To update the site later you repeat the upload, which is why Route A is nicer
in the long run.

---

## Route C — Terminal, if you're comfortable with it

Create the empty repository first (Route B step 1), then:

```bash
git remote add origin https://github.com/danaismail195-gif/wedding-website.git
```

```bash
git push -u origin main
```

Git will ask for a username and password. The password is **not** your GitHub
password — it has to be a Personal Access Token, which you make at
https://github.com/settings/tokens (Generate new token → classic → tick the
`repo` box). macOS will remember it after the first push, so you only do this
once. Then enable Pages as in step 5 above.

---

## When it's live

Tell Claude Code "it's published" and it will open the live address, walk
through all seven doorways and confirm everything survived the trip.
