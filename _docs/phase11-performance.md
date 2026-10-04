# Phase 11 mobile performance report

Measured 2026-10-04 in headless Chromium at a 390×844 viewport, device scale factor 2, 150 ms latency and approximately 1.6 Mbps download throughput. Measurements use the local production source with an empty browser cache.

| Page | Transfer | Requests | Image requests | LCP | CLS | Result |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| Homepage | 284 KB | 9 | 2 | 1.63 s | 0 | Pass |
| Weddings category | 282 KB | 10 | 2 | 2.02 s | 0 | Pass |
| Published album | 484 KB | 10 | 3 | 1.40 s | 0.096 | Pass |

All three pages selected AVIF, had no broken loaded images and had no horizontal overflow. The album initially rendered five available frames; four were lazy. With the private 500-photo fixture, the same renderer exposes only 18 gallery frames per batch and 25 fullscreen thumbnails at a time. The 500 records are divided into 28 progressive batches.

The album CLS remains inside the “good” threshold of 0.1 but is the closest metric to its limit. It should be remeasured after real portfolio content replaces the demonstration assets.

These numbers are controlled comparisons, not a guarantee for every visitor. Device performance, distance to the GitHub Pages edge and future photograph dimensions affect field results.

