# Generate the 3 hero clips in Runway — corrected recipe

The first attempt failed because (a) a **full 360° orbit from a single photo** makes
Veo hallucinate your back/sides (you got a weird one-leg pose mid-clip), and (b) the
**raw garden photo** was used as the start frame, so the clip opened in the greenhouse.
Fix = a **two-step pipeline**: build a proper navy-studio base image first, then animate
it with a **gentle** camera move.

## Resolution / settings (all clips)
- **Ratio (16:9): `1920:1080`** ← use this, not 1280:720. Veo 3.1 options are
  `1920:1080`, `1080:1920`, `1280:720`, `720:1280`.
- **Model:** Veo 3.1 · **Duration:** 8s (or 6s) · **Audio:** off
- **Negative prompt (every clip):** `extra limbs, distorted anatomy, dancing, kicking, warping, morphing, blurry face, text, watermark`
- **Wardrobe (keep identical):** black polo, slim black dress pants, black dress shoes.

## 💳 Credits
Veo 3.1 = 20 cr/sec → 8s = 160 cr/clip. Base images (`gen4_image`) are ~5 cr each.
3 clips + 3 base images ≈ **495 cr**; you have ~492 — so do **6s clips (120 each)** to
leave headroom, or top up. (6s × 3 = 360 + ~15 for images = ~375.)

---

## STEP 1 — make a base image for each clip
Runway **Text-to-Image → `gen4_image`**, ratio **`1920:1080`**, add **`anthony.jpg` as a
reference image** (up to 3 for likeness).

- **Hero base:** Anthony, confident, standing centered, hands together in a prayer gesture, in a deep navy-blue void studio with dramatic gold rim lighting. Black polo, slim black dress pants. Cinematic, volumetric light, photoreal, 16:9.
- **Builder base:** Anthony seated at a dark minimalist desk, surrounded by floating translucent holographic screens showing charts and plans, deep navy environment with gold accent light. Black polo. Cinematic, photoreal, 16:9.
- **Closer base:** Anthony standing at the end of a dark gallery lined with glowing screens, deep navy with warm gold light, confident pose, hands together. Black polo, black dress pants. Cinematic, photoreal, 16:9.

Pick the best generation for each — those three images become the Veo start frames.

## STEP 2 — animate each base image (Veo 3.1 · Image-to-Video · `1920:1080`)
Use the matching base image as the start frame. **Gentle camera moves only.**

- **`orbit.mp4`** ← hero base: *Slow, smooth cinematic camera arc partway around him (about 30–45°) with a gentle push-in; he holds the confident prayer pose; gold rim light sweeps across him. Volumetric light, photoreal.*
- **`builder.mp4`** ← builder base: *Slow cinematic push-in toward him as the holographic screens drift gently. Calm, focused. Photoreal.*
- **`closer.mp4`** ← closer base: *He walks slowly toward the camera a few steps and stops in a confident pose, hands together; slow dolly, gold rim light. Photoreal.*

(Include the negative prompt above on all three.)

---

## Send them back
Zip the three mp4s (`orbit.mp4`, `builder.mp4`, `closer.mp4`) and attach the **.zip** here.
I'll extract the orbit into a frame sequence for the scroll-scrub, compress the other two,
drop them into `public/media/`, and re-verify.
