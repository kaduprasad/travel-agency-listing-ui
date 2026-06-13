# SKYLINE-TRAVELS ICONS

The PWA manifest references `/icons/icon-192.png` and `/icons/icon-512.png` plus `/icons/badge-72.png` (used by the service-worker notification badge).

The repo ships with `icon.svg` (the source) and `favicon.svg`. To generate PNG icons for the manifest, run any one of these on the SVG:

1. Online: drop `icon.svg` into https://realfavicongenerator.net or https://favicon.io and download PNG sizes.
2. CLI (Node, no install): `npx --yes sharp-cli -i public/icons/icon.svg -o public/icons/icon-192.png resize 192 192`
3. Same again with `512 512` (and `72 72` saved as `badge-72.png`).

If the PNGs aren't present, browsers will still install the PWA using the SVG favicon — they just won't get the prettier home-screen icon. Push notifications will fall back to the default browser icon.
