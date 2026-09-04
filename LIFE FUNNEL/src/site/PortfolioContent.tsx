/**
 * Anthony Morales — cinematic "3D scroll" portfolio (rendered on /results).
 *
 * Style ref: Lando Norris (Awwwards SOTY 2025). Three Veo clips are each turned
 * into a canvas frame-sequence and scroll-scrubbed — a continuous cinematic
 * sequence: (1) HERO the camera orbits you, (2) PILLARS a slow push-in at the
 * desk while the three offerings reveal, (3) FINALE you walk toward camera as
 * "Turning Uncertainty Into Certainty" and the CTAs arrive. All scroll-driven
 * updates run in a single rAF loop via refs/DOM (no React state) so scrubbing
 * stays buttery. Deep-navy / metallic-gold, Lenis smooth scroll.
 *
 * Frames load from public/media/<name>/ (fetch) or inlined data URIs
 * (window.__*_FRAMES__) in the standalone preview build.
 */
import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { siteConfig } from "@/site/siteConfig";
import "@/site/portfolio.css";

const NAME_ROWS = ["ANTHONY", "MORALES"];
const IG_URL = "https://www.instagram.com/ibluezcluezflow/";
const PILLARS = [
  { n: "01", h: "Retirement Certainty", p: "Income strategies built to last, so the market's mood never decides your retirement." },
  { n: "02", h: "Life Protection", p: "Term, whole, and IUL coverage shaped around the people who depend on you." },
  { n: "03", h: "Business Insurance", p: "Key-person, buy-sell, and continuity planning that keeps what you built standing." },
];

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

export function PortfolioContent() {
  const rootRef = useRef<HTMLDivElement>(null);
  const heroWrapRef = useRef<HTMLDivElement>(null);
  const pillarsWrapRef = useRef<HTMLDivElement>(null);
  const closerWrapRef = useRef<HTMLDivElement>(null);
  const heroCanvasRef = useRef<HTMLCanvasElement>(null);
  const pillarsCanvasRef = useRef<HTMLCanvasElement>(null);
  const closerCanvasRef = useRef<HTMLCanvasElement>(null);
  const railRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current!;
    const letters = Array.from(root.querySelectorAll<HTMLElement>(".pf-letter"));
    const subtitle = root.querySelector<HTMLElement>(".pf-subtitle");
    const hint = root.querySelector<HTMLElement>(".pf-scrollhint");
    const pillarEls = Array.from(root.querySelectorAll<HTMLElement>(".pf-pillar"));
    const finaleInner = root.querySelector<HTMLElement>(".pf-finale-inner");
    const railFill = railRef.current?.querySelector("i") as HTMLElement | null;

    // ---- frame loading: inlined data URIs (preview) else fetch manifest ----
    const mk = (src: string) => { const im = new Image(); im.src = src; return im; };
    function loadSet(inlineKey: string, manifestUrl: string, dir: string) {
      const holder = { frames: [] as HTMLImageElement[] };
      const inlined = (window as unknown as Record<string, string[]>)[inlineKey];
      if (Array.isArray(inlined) && inlined.length) {
        holder.frames = inlined.map(mk);
      } else {
        fetch(manifestUrl)
          .then((r) => (r.ok ? r.json() : Promise.reject()))
          .then((m: { count: number; pattern: string }) => {
            holder.frames = Array.from({ length: m.count }, (_, i) => {
              const name = m.pattern.replace(/%0(\d)d/, (_s, d) => String(i + 1).padStart(Number(d), "0"));
              return mk(`${dir}/${name}`);
            });
          })
          .catch(() => { /* frames missing — navy fallback */ });
      }
      return holder;
    }
    const orbit = loadSet("__ORBIT_FRAMES__", "/media/orbit/manifest.json", "/media/orbit");
    const builder = loadSet("__BUILDER_FRAMES__", "/media/builder/manifest.json", "/media/builder");
    const closer = loadSet("__CLOSER_FRAMES__", "/media/closer/manifest.json", "/media/closer");

    const placeholder = new Image();
    placeholder.src = siteConfig.advisorPhotoSrc || "/anthony.jpg";

    const canvases = [heroCanvasRef.current!, pillarsCanvasRef.current!, closerCanvasRef.current!];
    const ctxs = canvases.map((c) => c.getContext("2d")!);

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvases.forEach((c, i) => {
        c.width = Math.round(c.clientWidth * dpr);
        c.height = Math.round(c.clientHeight * dpr);
        ctxs[i].setTransform(dpr, 0, 0, dpr, 0, 0);
      });
    }
    resize();
    window.addEventListener("resize", resize);

    function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, w: number, h: number, scale: number, panX: number, alignY: number) {
      const ir = img.naturalWidth / img.naturalHeight;
      const cr = w / h;
      let dw = w * scale, dh = h * scale;
      if (ir > cr) dw = dh * ir; else dh = dw / ir;
      ctx.drawImage(img, (w - dw) / 2 + panX, (h - dh) * alignY, dw, dh);
    }

    // hero procedural fallback (shows only until orbit frames arrive)
    function heroPlaceholder(ctx: CanvasRenderingContext2D, w: number, h: number, p: number) {
      const cx = w / 2, cy = h * 0.46, min = Math.min(w, h);
      drawCover(ctx, placeholder, w, h, 1.16 - p * 0.14, (p - 0.5) * w * 0.05, 0.16);
      ctx.fillStyle = "rgba(6,10,22,0.5)"; ctx.fillRect(0, 0, w, h);
      const ang = p * Math.PI * 2;
      const lx = cx + Math.cos(ang) * w * 0.34, ly = cy + Math.sin(ang) * h * 0.16;
      const rg = ctx.createRadialGradient(lx, ly, 0, lx, ly, Math.max(w, h) * 0.5);
      rg.addColorStop(0, "rgba(246,222,134,0.30)"); rg.addColorStop(0.5, "rgba(201,162,39,0.06)"); rg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = rg; ctx.fillRect(0, 0, w, h);
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(ang);
      ctx.strokeStyle = "rgba(201,162,39,0.22)"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.ellipse(0, 0, min * 0.36, min * 0.13, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }

    function drawStage(ci: number, frames: HTMLImageElement[], p: number, alignY: number, vignette: number, useHeroFallback = false) {
      const ctx = ctxs[ci], canvas = canvases[ci];
      const w = canvas.clientWidth, h = canvas.clientHeight, cx = w / 2, cy = h * 0.46;
      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.85);
      bg.addColorStop(0, "#0e1830"); bg.addColorStop(1, "#05080f");
      ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
      if (frames.length && frames[0]?.complete) {
        const idx = clamp(Math.round(p * (frames.length - 1)), 0, frames.length - 1);
        const f = frames[idx];
        if (f && f.complete) drawCover(ctx, f, w, h, 1, 0, alignY);
      } else if (useHeroFallback && placeholder.complete && placeholder.naturalWidth) {
        heroPlaceholder(ctx, w, h, p);
      }
      const v = ctx.createRadialGradient(cx, cy, h * 0.28, cx, cy, Math.max(w, h) * 0.78);
      v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, `rgba(5,8,15,${vignette})`);
      ctx.fillStyle = v; ctx.fillRect(0, 0, w, h);
    }

    const prog = (wrap: HTMLElement) => clamp(-wrap.getBoundingClientRect().top / (wrap.offsetHeight - window.innerHeight || 1));

    function update() {
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      if (railFill) railFill.style.width = `${clamp(window.scrollY / (docH || 1)) * 100}%`;

      const hp = prog(heroWrapRef.current!);
      if (hp > -0.05 && hp < 1.05) drawStage(0, orbit.frames, hp, 0.16, 0.82, true);
      const revealW = 0.55;
      letters.forEach((el, i) => el.classList.toggle("is-in", hp > (i / letters.length) * revealW + 0.02));
      subtitle?.classList.toggle("is-in", hp > 0.52);
      if (hint) hint.style.opacity = hp > 0.06 ? "0" : "0.9";

      const pp = prog(pillarsWrapRef.current!);
      if (pp > -0.05 && pp < 1.05) drawStage(1, builder.frames, pp, 0.5, 0.5);
      const th = [0.12, 0.42, 0.7];
      pillarEls.forEach((el, i) => el.classList.toggle("is-in", pp > th[i]));

      const cp = prog(closerWrapRef.current!);
      if (cp > -0.05 && cp < 1.05) drawStage(2, closer.frames, cp, 0.4, 0.46);
      finaleInner?.classList.toggle("head-in", cp > 0.12);
      finaleInner?.classList.toggle("cta-in", cp > 0.6);
    }

    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    let rafId = 0;
    function raf(time: number) { lenis.raf(time); update(); rafId = requestAnimationFrame(raf); }
    rafId = requestAnimationFrame(raf);
    placeholder.onload = () => update();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      lenis.destroy();
    };
  }, []);

  return (
    <div className="pf" ref={rootRef} id="top">
      <span className="pf-progress" ref={railRef}><i /></span>
      <div className="pf-grain" aria-hidden />

      {siteConfig.logoSrc ? (
        <a className="pf-logo" href="#top" aria-label={siteConfig.companyName}>
          <img src={siteConfig.logoSrc} alt={`${siteConfig.companyName} logo`} />
          <span>{siteConfig.companyName}</span>
        </a>
      ) : null}

      {/* ---------- HERO ORBIT ---------- */}
      <section className="pf-stage-wrap pf-hero" ref={heroWrapRef}>
        <div className="pf-stage">
          <canvas className="pf-canvas" ref={heroCanvasRef} aria-hidden />
          <div className="pf-hero-overlay">
            <h1 className="pf-title pf-gold">
              {NAME_ROWS.map((row) => (
                <span className="row" key={row}>
                  {row.split("").map((ch, i) => (<span className="pf-letter" key={`${row}-${i}`}>{ch}</span>))}
                </span>
              ))}
            </h1>
            <p className="pf-subtitle">Life Insurance Agent</p>
          </div>
          <div className="pf-scrollhint">Scroll</div>
        </div>
      </section>

      {/* ---------- THREE PILLARS (Builder scrub) ---------- */}
      <section className="pf-stage-wrap pf-pillars" ref={pillarsWrapRef}>
        <div className="pf-stage">
          <canvas className="pf-canvas" ref={pillarsCanvasRef} aria-hidden />
          <div className="pf-veil pf-veil--side" aria-hidden />
          <div className="pf-pillars-inner">
            <p className="pf-eyebrow">What I build for you</p>
            {PILLARS.map((p) => (
              <div className="pf-pillar" key={p.n}>
                <span className="num">{p.n}</span>
                <div className="body">
                  <h3 className="pf-gold">{p.h}</h3>
                  <p>{p.p}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- FINALE (Closer scrub) ---------- */}
      <section className="pf-stage-wrap pf-closer" ref={closerWrapRef}>
        <div className="pf-stage">
          <canvas className="pf-canvas" ref={closerCanvasRef} aria-hidden />
          <div className="pf-veil pf-veil--center" aria-hidden />
          <div className="pf-finale-inner">
            <h2 className="pf-gold">Turning Uncertainty<br />Into Certainty</h2>
            <div className="pf-cta">
              <a className="pf-btn pf-btn--ghost pf-btn--xl" href={IG_URL} target="_blank" rel="noreferrer">Follow @ibluezcluezflow</a>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- FOOTER (static) ---------- */}
      <footer className="pf-footer-block">
        <div className="pf-footer">
          <span>{siteConfig.companyName} © 2026</span>
          <span className="sep">·</span>
          <span>CA License #{siteConfig.advisor.license}</span>
          <span className="sep">·</span>
          <a href={IG_URL} target="_blank" rel="noreferrer">Instagram</a>
          <span className="sep">·</span>
          <a href="/dashboard">Client Login</a>
        </div>
        <p className="pf-disclaimer">
          Educational information only. Not financial, legal, or tax advice. Insurance and annuity products involve
          fees, limitations, and surrender periods; guarantees are backed by the issuing insurer's claims-paying
          ability. Product availability varies by state and underwriting.
        </p>
      </footer>
    </div>
  );
}
