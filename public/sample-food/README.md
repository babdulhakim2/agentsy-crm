# Sample food images

Drop the demo photos here using these exact filenames:

- `sweet-sour-takeaway.jpg` — sweet & sour chicken / takeaway combo with rice + spring rolls + drink
- `ginger-beef.jpg` — beef in ginger & spring onion sauce, served with rice
- `dim-sum-brunch.jpg` — dim sum baskets with bubble tea + spring rolls
- `sichuan-trio.jpg` — mapo tofu + chow mein + kung pao chicken trio

The Today screen's "Social posts drafted" cards reference these paths via `lib/data.ts → social[].imageUrl`. If a file is missing, the UI falls back to a tasteful gradient with the dish name overlaid in serif.

Recommended specs: square (1080×1080) or 4:5 (1080×1350) JPG, ~200–400 KB each.
