import { useState, useRef, useEffect } from "react";
import type { PointerEvent as RP } from "react";
import gsap from "gsap";
import { Title, useWorld } from "./App";

type Grain = { x: number; y: number; vx: number; vy: number; life: number };
const AREA = { x: 220, y: 300, w: 1000, h: 315 };
export default function Sand() {
  const { model, patch, paused, reduced, dragging } = useWorld();
  const canvas = useRef<HTMLCanvasElement>(null),
    particles = useRef<HTMLCanvasElement>(null),
    layer = useRef<HTMLDivElement>(null);
  const [broom, setBroom] = useState({ x: 720, y: 700 }),
    [held, setHeld] = useState(false),
    [progress, setProgress] = useState(model.final ? 100 : 0),
    [epoch, setEpoch] = useState(0);
  const pos = useRef({ x: 720, y: 700 }),
    previous = useRef(pos.current),
    active = useRef(false),
    pointer = useRef<number | null>(null),
    timer = useRef<ReturnType<typeof setTimeout> | null>(null),
    pauseRef = useRef(paused),
    done = useRef(model.final),
    cells = useRef(new Set<number>()),
    grains = useRef<Grain[]>([]),
    finishTween = useRef<gsap.core.Tween | null>(null),
    stripe = useRef<gsap.core.Tween | null>(null),
    row = useRef(0);
  pauseRef.current = paused;
  const finish = () => {
    if (done.current) return;
    done.current = true;
    active.current = false;
    dragging.current = false;
    setHeld(false);
    patch({ final: true });
    setProgress(100);
    if (canvas.current) {
      finishTween.current = gsap.to(canvas.current, {
        y: reduced ? 0 : 210,
        opacity: 0,
        duration: reduced ? 0.01 : 1.2,
        ease: "power2.in",
      });
    }
    pos.current = { x: 1280, y: 700 };
    setBroom(pos.current);
  };
  const erase = (p: { x: number; y: number }, from = previous.current) => {
    if (done.current || pauseRef.current) return;
    const ctx = canvas.current?.getContext("2d");
    if (!ctx) return;
    const dist = Math.hypot(p.x - from.x, p.y - from.y),
      steps = Math.max(1, Math.ceil(dist / 25));
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineWidth = 125;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(p.x, p.y, 62.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    for (let step = 0; step <= steps; step++) {
      const x = from.x + ((p.x - from.x) * step) / steps,
        y = from.y + ((p.y - from.y) * step) / steps;
      for (let r = 0; r < 21; r++)
        for (let c = 0; c < 50; c++) {
          const cx = AREA.x + (c + 0.5) * 20,
            cy = AREA.y + (r + 0.5) * 15;
          if (Math.hypot(cx - x, cy - y) < 60) cells.current.add(r * 50 + c);
        }
    }
    const covered = cells.current.size / (50 * 21);
    setProgress(Math.round(covered * 100));
    if (!reduced && dist > 1) {
      for (let i = 0; i < 6; i++) {
        grains.current.push({
          x: p.x + (Math.random() - 0.5) * 100,
          y: p.y + (Math.random() - 0.5) * 45,
          vx: (p.x - from.x) * 0.08 + (Math.random() - 0.5) * 3,
          vy: (p.y - from.y) * 0.08 + Math.random() * 2,
          life: 1,
        });
      }
      if (grains.current.length > 280)
        grains.current.splice(0, grains.current.length - 280);
    }
    previous.current = p;
    if (covered >= 0.8) finish();
  };
  useEffect(() => {
    const c = canvas.current!,
      ctx = c.getContext("2d")!;
    gsap.set(c, { opacity: 1, y: 0 });
    ctx.clearRect(0, 0, 1440, 810);
    if (model.final) {
      ctx.clearRect(0, 0, 1440, 810);
      done.current = true;
      return;
    }
    done.current = false;
    cells.current.clear();
    grains.current = [];
    row.current = 0;
    setProgress(0);
    pos.current = { x: 720, y: 700 };
    previous.current = pos.current;
    setBroom(pos.current);
    // One textured bitmap plus a small, capped particle pool. No per-grain DOM.
    const gradient = ctx.createLinearGradient(0, 280, 0, 650);
    gradient.addColorStop(0, "#DEC491");
    gradient.addColorStop(0.5, "#E2C99A");
    gradient.addColorStop(1, "#D5B582");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(AREA.x - 30, AREA.y - 20, AREA.w + 60, AREA.h + 40, 24);
    ctx.fill();
    let seed = 417;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    for (let i = 0; i < 42000; i++) {
      const x = AREA.x - 25 + random() * (AREA.w + 50),
        y = AREA.y - 15 + random() * (AREA.h + 30);
      ctx.fillStyle =
        i % 3 === 0 ? "#A5885644" : i % 3 === 1 ? "#FFF5DB77" : "#BD9F6D55";
      const s = 0.5 + random() * 1.4;
      ctx.fillRect(x, y, s, s);
    }
    return () => {
      finishTween.current?.kill();
      stripe.current?.kill();
      if (timer.current) clearTimeout(timer.current);
      dragging.current = false;
    };
    // Rebuild only on an explicit replay; completion must not repaint sand.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [epoch]);
  useEffect(() => {
    let frame = 0,
      last = 0;
    const draw = (now: number) => {
      const ctx = particles.current?.getContext("2d");
      if (ctx && !pauseRef.current) {
        const dt = Math.min(2, (now - last) / 16.7 || 1);
        ctx.clearRect(0, 0, 1440, 810);
        for (const p of grains.current) {
          if (done.current) p.vy += 0.3 * dt;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.vx *= 0.94;
          p.vy *= 0.94;
          ctx.fillStyle = "#B3925D";
          ctx.fillRect(p.x, p.y, 2, 2);
        }
      }
      last = now;
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, []);
  const local = (e: { clientX: number; clientY: number }) => {
    const r = layer.current!.getBoundingClientRect();
    return {
      x: Math.max(80, Math.min(1360, ((e.clientX - r.left) / r.width) * 1440)),
      y: Math.max(270, Math.min(720, ((e.clientY - r.top) / r.height) * 810)),
    };
  };
  const release = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    pointer.current = null;
    active.current = false;
    dragging.current = false;
    setHeld(false);
  };
  const sweepRow = () => {
    if (paused || done.current || stripe.current?.isActive()) return;
    const y = AREA.y + 55 + row.current * 95;
    row.current++;
    dragging.current = true;
    const obj = { x: AREA.x - 25 };
    previous.current = { x: obj.x, y };
    stripe.current = gsap.to(obj, {
      x: AREA.x + AREA.w + 25,
      duration: reduced ? 0.01 : 1.1,
      ease: "none",
      onUpdate: () => {
        const p = { x: obj.x, y };
        erase(p);
        pos.current = p;
        setBroom(p);
      },
      onComplete: () => {
        dragging.current = false;
      },
    });
  };
  return (
    <>
      <Title
        kicker="08 / МЕНЬШЕ ШУМА. БОЛЬШЕ СМЫСЛА."
        title={["Открыть главное."]}
      />
      <g className="scene-object">
        <text x="720" y="355" textAnchor="middle" className="final-quote">
          <tspan x="720">Сила инфографики и презентаций —</tspan>
          <tspan x="720" dy="61">
            не в красоте изображений,
          </tspan>
          <tspan x="720" dy="61">
            а в способности превращать
          </tspan>
          <tspan x="720" dy="61" className="emphasis">
            информацию в понимание.
          </tspan>
        </text>
        {model.final && (
          <>
            <text x="720" y="595" textAnchor="middle" className="final-note">
              <tspan x="720">
                Хорошая визуализация помогает увидеть главное.
              </tspan>
              <tspan x="720" dy="31">
                Великая — позволяет понять, почему это главное.
              </tspan>
            </text>
            <text x="720" y="691" textAnchor="middle" className="final-thanks">
              СПАСИБО ЗА ВНИМАНИЕ
            </text>
          </>
        )}
      </g>
      <foreignObject width="1440" height="810" pointerEvents="none">
        <div ref={layer} className="sand-layer">
          <canvas
            ref={canvas}
            width="1440"
            height="810"
            className="sand-canvas"
            aria-hidden="true"
          />
          <canvas
            ref={particles}
            width="1440"
            height="810"
            className="sand-canvas"
            aria-hidden="true"
          />
          <button
            className="broom"
            aria-label="Веник. Enter — взять, стрелки — сметать песок"
            aria-pressed={held}
            style={{
              left: `${broom.x / 14.4 - 4}%`,
              top: `${(broom.y - 210) / 8.1}%`,
              pointerEvents: paused || model.final ? "none" : "auto",
              transform: `rotate(${held ? -9 : 8}deg) translateY(${held ? -5 : 0}px)`,
            }}
            onPointerDown={(e: RP<HTMLButtonElement>) => {
              if (
                paused ||
                done.current ||
                pointer.current !== null ||
                (e.pointerType === "mouse" && e.button !== 0)
              )
                return;
              e.preventDefault();
              e.currentTarget.setPointerCapture(e.pointerId);
              pointer.current = e.pointerId;
              dragging.current = true;
              const lift = () => {
                active.current = true;
                setHeld(true);
                previous.current = pos.current;
              };
              if (e.pointerType === "touch")
                timer.current = setTimeout(lift, 450);
              else lift();
            }}
            onPointerMove={(e) => {
              if (pointer.current !== e.pointerId || !active.current || paused)
                return;
              const p = local(e);
              erase(p);
              pos.current = p;
              setBroom(p);
            }}
            onPointerUp={release}
            onPointerCancel={release}
            onLostPointerCapture={release}
            onKeyDown={(e) => {
              if (paused || done.current) return;
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                active.current = !active.current;
                setHeld(active.current);
                previous.current = pos.current;
              }
              if (e.key.startsWith("Arrow")) {
                e.preventDefault();
                e.stopPropagation();
                if (!active.current) {
                  active.current = true;
                  setHeld(true);
                }
                const p = {
                  x: clampPosition(
                    pos.current.x +
                      (e.key === "ArrowRight"
                        ? 55
                        : e.key === "ArrowLeft"
                          ? -55
                          : 0),
                    80,
                    1360,
                  ),
                  y: clampPosition(
                    pos.current.y +
                      (e.key === "ArrowDown"
                        ? 45
                        : e.key === "ArrowUp"
                          ? -45
                          : 0),
                    270,
                    720,
                  ),
                };
                erase(p);
                pos.current = p;
                setBroom(p);
              }
            }}
          >
            <svg viewBox="0 0 110 240">
              <defs>
                <linearGradient id="wood">
                  <stop stopColor="#7D5037" />
                  <stop offset=".5" stopColor="#C49563" />
                  <stop offset="1" stopColor="#8D5A39" />
                </linearGradient>
              </defs>
              <rect
                x="49"
                y="5"
                width="11"
                height="161"
                rx="5"
                fill="url(#wood)"
              />
              <path
                d="M43 152Q54 145 66 152L88 222Q55 238 20 222Z"
                fill="#CB9C53"
              />
              {Array.from({ length: 27 }, (_, i) => (
                <path
                  key={i}
                  d={`M${44 + i * 0.8} 158Q${25 + i * 2} 195 ${21 + i * 2.5} ${221 + (i % 4) * 2}`}
                  fill="none"
                  stroke={i % 3 ? "#9D713A" : "#E9C58A"}
                  strokeWidth="1.2"
                />
              ))}
              <path
                d="M40 166Q54 172 69 166M38 174Q55 181 72 174"
                fill="none"
                stroke="#217B80"
                strokeWidth="5"
              />
              <path d="M52 10v130" stroke="#F0D2A1" opacity=".5" />
            </svg>
          </button>
          {!model.final && (
            <>
              <span className="broom-hint">Удержи веник и смети песок</span>
              <span className="sand-progress" aria-live="off">
                Открыто {progress}%
              </span>
            </>
          )}
          <div className="final-controls">
            {!model.final ? (
              <button onClick={sweepRow} disabled={paused}>
                Смести следующую полосу ↗
              </button>
            ) : (
              <button
                onClick={() => {
                  release();
                  patch({ final: false });
                  setEpoch((n) => n + 1);
                }}
              >
                ↺ Повторить финал
              </button>
            )}
          </div>
        </div>
      </foreignObject>
    </>
  );
}
const clampPosition = (v: number, a: number, b: number) =>
  Math.max(a, Math.min(b, v));
