# NXG portfolio media — drop your Veo clips here

The cinematic `/results` portfolio looks for these files. Until they exist, the
page shows tasteful procedural placeholders (using `anthony.jpg`), so nothing
looks broken.

## Files the page uses

| Slot | Path | Source |
|------|------|--------|
| **Hero orbit** (scroll-scrubbed) | `public/media/orbit/frame_0001.jpg … frame_NNNN.jpg` + `public/media/orbit/manifest.json` | Clip 1 (360° orbit), exported to frames |
| **The Builder** (pillars bg) | `public/media/builder.mp4` | Clip 2 |
| **The Closer** (finale bg) | `public/media/closer.mp4` | Clip 3 |

`manifest.json` shape: `{ "count": 120, "pattern": "frame_%04d.jpg", "width": 1920, "height": 1080 }`

## Preparing the hero orbit frame sequence (from the Veo mp4)

Scroll-scrubbing is done by drawing a **frame sequence** to a canvas (buttery,
no video-seek jank). Extract ~120 frames from the 8s orbit clip and compress:

```bash
mkdir -p public/media/orbit
ffmpeg -i orbit.mp4 -vf "fps=15,scale=1280:-2" -q:v 4 public/media/orbit/frame_%04d.jpg
# then write manifest.json with the real count (ls public/media/orbit | wc -l)
```

## Compressing the builder / closer clips for web

```bash
ffmpeg -i builder.mp4 -c:v libx264 -crf 26 -preset slow -an -movflags +faststart -vf "scale=1280:-2" public/media/builder.mp4
ffmpeg -i closer.mp4  -c:v libx264 -crf 26 -preset slow -an -movflags +faststart -vf "scale=1280:-2" public/media/closer.mp4
```

Send me the three raw Veo mp4s and I'll run all of this and wire them in.
