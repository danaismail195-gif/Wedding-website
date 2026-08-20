#!/usr/bin/env python3
"""
Rebuild the single-file copy of the site.

The live GitHub Pages copy is one self-contained index.html with the CSS and
all six scripts baked inside, because GitHub's web uploader flattens the
assets/ folder. Edit the real sources in assets/, then run:

    python3 build.py

It writes two identical single-file builds:
    UPLOAD-THIS-ONE-FILE/index.html   <- upload this one to GitHub
    the-journey.html                  <- the same thing, kept in the repo

If you ever publish with GitHub Desktop instead (which preserves folders),
none of this is needed: the normal index.html + assets/ works as it is.
"""
import re, os, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
ORDER = ['tween', 'content', 'art', 'scenes', 'audio', 'app']


def read(*parts):
    with open(os.path.join(ROOT, *parts), encoding='utf-8') as fh:
        return fh.read()


def build():
    html = read('index.html')
    css = read('assets', 'css', 'main.css')
    js = [read('assets', 'js', name + '.js') for name in ORDER]

    head = html.split('<head>', 1)[1].split('</head>', 1)[0].replace(
        '<link rel="stylesheet" href="assets/css/main.css">',
        '<style>\n' + css + '\n</style>')
    body = re.sub(r'<script src="[^"]*"></script>\s*', '',
                  html.split('<body>', 1)[1].split('</body>', 1)[0]).rstrip()
    body += '\n\n<script>\n' + '\n'.join(js) + '\n</script>\n'

    out = ('<!DOCTYPE html>\n<html lang="en">\n<head>' + head +
           '</head>\n<body>\n' + body + '</body>\n</html>\n')

    os.makedirs(os.path.join(ROOT, 'UPLOAD-THIS-ONE-FILE'), exist_ok=True)
    for path in [os.path.join('UPLOAD-THIS-ONE-FILE', 'index.html'), 'the-journey.html']:
        with open(os.path.join(ROOT, path), 'w', encoding='utf-8') as fh:
            fh.write(out)
        print('wrote %s  (%d KB)' % (path, len(out.encode('utf-8')) // 1024))

    # a build that lost a script is worse than no build at all
    for name in ORDER:
        marker = {'tween': 'WW.tween', 'content': 'WW.CONTENT', 'art': 'WW.art',
                  'scenes': 'WW.scenes', 'audio': 'WW.audio', 'app': 'WW.debug'}[name]
        if marker not in out:
            sys.exit('BUILD FAILED: %s is missing from the bundle' % name)
    if 'assets/js/' in out or 'assets/css/' in out:
        sys.exit('BUILD FAILED: the bundle still points at assets/')
    print('all six scripts and the stylesheet are inlined.')


if __name__ == '__main__':
    build()
