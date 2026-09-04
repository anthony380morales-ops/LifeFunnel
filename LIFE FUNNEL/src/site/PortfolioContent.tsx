/**
 * Anthony Morales — cinematic "3D scroll" portfolio (rendered on /results).
 *
 * Style ref: Lando Norris (Awwwards SOTY 2025). Huge condensed display type,
 * a scroll-scrubbed hero "orbit", and scroll-driven reveals, on a deep-navy /
 * metallic-gold palette with Lenis smooth scroll.
 *
 * The hero orbit is drawn to a <canvas> from a frame sequence — the buttery,
 * seek-free technique. Until the real Veo clips are dropped into public/media/
 * (see public/media/README.md), a procedural placeholder built from anthony.jpg
 * stands in, exercising the exact same scrub path. All scroll-driven updates run
 * in a single rAF loop via refs/DOM (no React state), so scrubbing never janks.
 */
import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { siteConfig } from "@/site/siteConfig";
import "@/site/portfolio.css";

const NAME_ROWS = ["ANTHONY", "MORALES"];
const IG_URL = "https://www.instagram.com/ibluezcluezflow/";
const PILLARS = [
  { n: "01", h: "Retirement Certainty", p: "Income strategies built to last — so the market's mood never decides your retirement." },
  { n: "02", h: "Life Protection", p: "Term, whole, and IUL coverage shaped around the people who depend on you." },
  { n: "03", h: "Business Insurance", p: "Key-person, buy-sell, and continuity planning that keeps what you built standing." },
];

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

export function PortfolioContent() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const pillarsRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const root = rootRef.current!;
    const letters = Array.from(root.querySelectorAll<HTMLElement>(".pf-letter"));
    const subtitle = root.querySelector<HTMLElement>(".pf-subtitle");
    const hint = root.querySelector<HTMLElement>(".pf-scrollhint");
    const pillarEls = Array.from(root.querySelectorAll<HTMLElement>(".pf-pillar"));
    const railFill = railRef.current?.querySelector("i") as HTMLElement | null;

    // ---- media: real frame sequence if present, else placeholder photo ----
    const placeholder = new Image();
    placeholder.src = siteConfig.advisorPhotoSrc || "/anthony.jpg";
    let frames: HTMLImageElement[] = [];

    fetch("/media/orbit/manifest.json")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((m: { count: number; pattern: string }) => {
        frames = Array.from({ length: m.count }, (_, i) => {
          const img = new Image();
          const name = m.pattern.replace(/%0(\d)d/, (_s, d) =>
            String(i + 1).padStart(Number(d), "0"),
          );
          img.src = `/media/orbit/${name}`;
          return img;
        });
      })
      .catch(() => { /* no footage yet — placeholder stays */ });

    // Nudge the background videos to play (covers iOS/Safari, which sometimes
    // ignore the autoplay attribute even when muted + playsInline).
    root.querySelectorAll<HTMLVideoElement>("video.pf-bg").forEach((v) => {
      const tryPlay = () => v.play().catch(() => { /* will retry on first interaction */ });
      tryPlay();
      v.addEventListener("canplay", tryPlay, { once: true });
    });

    // ---- hi-DPI canvas sizing ----
    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    function drawCover(img: HTMLImageElement, w: number, h: number, scale: number, panX: number, alignY = 0.5) {
      const ir = img.naturalWidth / img.naturalHeight;
      const cr = w / h;
      let dw = w * scale, dh = h * scale;
      if (ir > cr) dw = dh * ir; else dh = dw / ir;
      ctx.drawImage(img, (w - dw) / 2 + panX, (h - dh) * alignY, dw, dh);
    }

    function drawHero(p: number) {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      const cx = w / 2, cy = h * 0.46;
      const min = Math.min(w, h);
      // navy void
      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.85);
      bg.addColorStop(0, "#0e1830"); bg.addColorStop(1, "#05080f");
      ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);

      if (frames.length && frames[0]?.complete) {
        const idx = clamp(Math.round(p * (frames.length - 1)), 0, frames.length - 1);
        const f = frames[idx];
        if (f && f.complete) drawCover(f, w, h, 1, 0);
      } else if (placeholder.complete && placeholder.naturalWidth) {
        // full-bleed graded subject with a slow scrub-driven push (biased up to keep the face in frame)
        drawCover(placeholder, w, h, 1.16 - p * 0.14, (p - 0.5) * w * 0.05, 0.16);
        ctx.fillStyle = "rgba(6,10,22,0.5)"; ctx.fillRect(0, 0, w, h);
        // sweeping gold rim light (the "camera orbit")
        const ang = p * Math.PI * 2;
        const lx = cx + Math.cos(ang) * w * 0.34, ly = cy + Math.sin(ang) * h * 0.16;
        const rg = ctx.createRadialGradient(lx, ly, 0, lx, ly, Math.max(w, h) * 0.5);
        rg.addColorStop(0, "rgba(246,222,134,0.30)");
        rg.addColorStop(0.5, "rgba(201,162,39,0.06)");
        rg.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = rg; ctx.fillRect(0, 0, w, h);
        // rotating orbit ring + particles
        ctx.save(); ctx.translate(cx, cy); ctx.rotate(ang);
        ctx.strokeStyle = "rgba(201,162,39,0.22)"; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.ellipse(0, 0, min * 0.36, min * 0.13, 0, 0, Math.PI * 2); ctx.stroke();
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2;
          const px = Math.cos(a) * min * 0.36, py = Math.sin(a) * min * 0.13;
          ctx.fillStyle = `rgba(246,222,134,${0.25 + 0.5 * (0.5 + 0.5 * Math.sin(a + ang))})`;
          ctx.beginPath(); ctx.arc(px, py, 2.4, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
      }
      // vignette to seat the type
      const v = ctx.createRadialGradient(cx, cy, h * 0.28, cx, cy, Math.max(w, h) * 0.78);
      v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(5,8,15,0.82)");
      ctx.fillStyle = v; ctx.fillRect(0, 0, w, h);
    }

    // ---- scroll → visual state (single rAF loop) ----
    function update() {
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      const sp = clamp(window.scrollY / (docH || 1));
      if (railFill) railFill.style.width = `${sp * 100}%`;

      const hero = heroRef.current!;
      const hp = clamp(-hero.getBoundingClientRect().top / (hero.offsetHeight - window.innerHeight || 1));
      drawHero(hp);
      const window55 = 0.55;
      letters.forEach((el, i) => {
        el.classList.toggle("is-in", hp > (i / letters.length) * window55 + 0.02);
      });
      subtitle?.classList.toggle("is-in", hp > 0.52);
      if (hint) hint.style.opacity = hp > 0.06 ? "0" : "0.9";

      const pw = pillarsRef.current!;
      const pp = clamp(-pw.getBoundingClientRect().top / (pw.offsetHeight - window.innerHeight || 1));
      const th = [0.1, 0.4, 0.68];
      pillarEls.forEach((el, i) => el.classList.toggle("is-in", pp > th[i]));
    }

    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    let rafId = 0;
    function raf(time: number) {
      lenis.raf(time);
      update();
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);
    placeholder.onload = () => update();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      lenis.destroy();
    };
  }, []);

  const calendarUrl = (import.meta.env.VITE_CALENDAR_URL as string) || "#top";

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
      <section className="pf-hero" ref={heroRef}>
        <div className="pf-hero-stage">
          <canvas className="pf-canvas" ref={canvasRef} aria-hidden />
          <div className="pf-hero-overlay">
            <h1 className="pf-title pf-gold">
              {NAME_ROWS.map((row) => (
                <span className="row" key={row}>
                  {row.split("").map((ch, i) => (
                    <span className="pf-letter" key={`${row}-${i}`}>{ch}</span>
                  ))}
                </span>
              ))}
            </h1>
            <p className="pf-subtitle">Life Insurance Agent</p>
          </div>
          <div className="pf-scrollhint">Scroll</div>
        </div>
      </section>

      {/* ---------- THREE PILLARS ---------- */}
      <section className="pf-pillars" ref={pillarsRef}>
        <div className="pf-pillars-stage">
          <video className="pf-bg" poster="/media/builder-poster.jpg"
            autoPlay muted loop playsInline preload="auto" style={{ opacity: 0.88 }}>
            <source src="/media/builder.webm" type="video/webm" />
            <source src="/media/builder.mp4" type="video/mp4" />
          </video>
          <div className="pf-bg-fallback" aria-hidden />
          <div className="pf-veil" aria-hidden />
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

      {/* ---------- FINALE ---------- */}
      <section className="pf-finale">
        <video className="pf-bg" poster="/media/closer-poster.jpg"
          autoPlay muted loop playsInline preload="auto" style={{ opacity: 0.75 }}>
          <source src="/media/closer.webm" type="video/webm" />
          <source src="/media/closer.mp4" type="video/mp4" />
        </video>
        <div className="pf-bg-fallback" aria-hidden />
        <div className="pf-veil" aria-hidden />
        <div className="pf-finale-inner">
          <h2 className="pf-gold">Turning Uncertainty<br />Into Certainty</h2>
          <div className="pf-cta">
            <a className="pf-btn pf-btn--gold" href={calendarUrl}>Book a Strategy Session</a>
            <a className="pf-btn pf-btn--ghost" href={IG_URL} target="_blank" rel="noreferrer">Follow @ibluezcluezflow</a>
          </div>

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
            Educational information only — not financial, legal, or tax advice. Insurance and annuity products involve
            fees, limitations, and surrender periods; guarantees are backed by the issuing insurer's claims-paying
            ability. Product availability varies by state and underwriting.
          </p>
        </div>
      </section>
    </div>
  );
}
