# Image ingestion and performance workflow

## Content Studio workflow

1. Keep the original photograph archived separately; the website repository is not the master photo archive.
2. Run `npm run admin` and open the private local URL.
3. In **Add image**, choose an owner-supplied JPG, PNG, WebP or AVIF up to 20 MB and write useful alt text.
4. Select **Optimize selected image**. The pipeline auto-orients the source and creates 320, 640, 960, 1280, 1600 and 2048 pixel widths without upscaling.
5. WebP quality is 82 and AVIF quality is 68 with 4:4:4 chroma. These settings preserve photographic detail while keeping delivery sizes controlled.
6. Open the target album and choose **Add latest optimized image**. Confirm caption, layout and ordering, then save.
7. Run `npm test && npm run build`, review locally, commit the data and `assets/images/library/` derivatives, then push.

The full-resolution working source is kept in local `_media-originals/`, ignored by Git and excluded from the public build. Back it up elsewhere before cleaning the local folder.

## Command-line workflow

Run:

```bash
npm run images -- --input /path/to/photo.jpg --slug meaningful-name --alt "Useful visual description"
```

The command prints the complete content record: fallback source, WebP `srcset`, AVIF `srcset`, thumbnail, intrinsic width/height, aspect ratio and content hash. Copy the record into the album through Content Studio or its structured data source.

## Delivery architecture

- Content-hashed output directories make each derivative URL immutable. Replacing a source creates a new hash and avoids stale browser/CDN images.
- GitHub Pages supplies the edge CDN. No paid image CDN has been introduced.
- The browser selects AVIF when supported and WebP otherwise, then chooses the closest width using `srcset` and `sizes`.
- The homepage hero is preloaded and high priority. Secondary images use async decoding and lazy loading.
- Gallery markup reserves intrinsic dimensions, reports broken files gracefully and renders 18 frames per batch.
- Only a 25-item thumbnail window exists in the fullscreen viewer, preventing a 500-photo album from creating 500 thumbnail nodes.
- Gallery frames after the first six use off-screen rendering containment.

## Replacement and cleanup

Replacing a photograph creates a new content-hashed directory. Update the content record and verify the live page before removing an unreferenced derivative directory. Treat cleanup as a separate reviewed change; never delete the only archived original.

