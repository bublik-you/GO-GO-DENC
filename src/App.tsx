import {
  useState,
  useRef,
  useEffect,
  createContext,
  useContext,
  useCallback,
} from "react";
import type { ReactNode, PointerEvent as RPointerEvent } from "react";
import gsap from "gsap";
import {
  Chaos,
  Network,
  Bars,
  Spotlight,
  Memory,
  Judgment,
  Synthesis,
} from "./Scenes";
import Sand from "./Sand";

export const COLORS = ["#172333", "#217B80", "#8ED9C2", "#F09573", "#E9C58A"];
export const chapters = [
  ["От шума к смыслу", "0:00–0:40", "Информационный хаос"],
  ["Увидеть связи", "0:40–1:35", "Сеть знаний"],
  ["Всё взаимосвязано", "1:35–2:40", "Баланс композиции"],
  ["Направить внимание", "2:40–3:35", "Управляемый свет"],
  ["Оставить след", "3:35–4:30", "Образ и память"],
  ["Изменить впечатление", "4:30–5:30", "Честная шкала"],
  ["Собрать главное", "5:30–6:05", "Четыре понятия"],
  ["Открыть смысл", "6:05–7:00", "Финал"],
];
export type Model = {
  bars: number[];
  matched: number[];
  baseline: number;
  connected: number[];
  visits: number[];
  final: boolean;
  chaos: boolean;
};
const initial: Model = {
  bars: [35, 40, 25],
  matched: [],
  baseline: 65,
  connected: [],
  visits: [],
  final: false,
  chaos: false,
};
type World = {
  model: Model;
  patch: (p: Partial<Model>) => void;
  next: () => void;
  dragging: React.MutableRefObject<boolean>;
  paused: boolean;
  reduced: boolean;
  sound: () => void;
};
const WorldContext = createContext<World>(null!);
export const useWorld = () => useContext(WorldContext);
export const point = (e: {
  clientX: number;
  clientY: number;
  currentTarget: EventTarget | null;
}) => {
  const target = e.currentTarget as SVGElement;
  const svg =
    target instanceof SVGSVGElement ? target : target.ownerSVGElement!;
  const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(
    svg.getScreenCTM()!.inverse(),
  );
  return { x: p.x, y: p.y };
};
export function useDrag(
  move: (p: { x: number; y: number }, e: RPointerEvent<SVGElement>) => void,
  end?: () => void,
  start?: (p: { x: number; y: number }) => void,
) {
  const { dragging, paused } = useWorld();
  const active = useRef<number | null>(null);
  useEffect(
    () => () => {
      dragging.current = false;
    },
    [dragging],
  );
  return {
    onPointerDown: (e: RPointerEvent<SVGElement>) => {
      if (paused || (e.pointerType === "mouse" && e.button !== 0)) return;
      e.stopPropagation();
      active.current = e.pointerId;
      dragging.current = true;
      e.currentTarget.setPointerCapture(e.pointerId);
      start?.(point(e));
    },
    onPointerMove: (e: RPointerEvent<SVGElement>) => {
      if (active.current === e.pointerId && !paused) move(point(e), e);
    },
    onPointerUp: (e: RPointerEvent<SVGElement>) => {
      if (active.current !== e.pointerId) return;
      active.current = null;
      dragging.current = false;
      if (e.currentTarget.hasPointerCapture(e.pointerId))
        e.currentTarget.releasePointerCapture(e.pointerId);
      end?.();
    },
    onPointerCancel: () => {
      active.current = null;
      dragging.current = false;
    },
    onLostPointerCapture: () => {
      active.current = null;
      dragging.current = false;
    },
  };
}
export function SvgButton({
  children,
  onClick,
  label,
  x = 0,
  y = 0,
  className = "",
}: {
  children: ReactNode;
  onClick: () => void;
  label: string;
  x?: number;
  y?: number;
  className?: string;
}) {
  const { paused } = useWorld();
  return (
    <g
      transform={`translate(${x} ${y})`}
      role="button"
      tabIndex={0}
      aria-label={label}
      className={`svg-button ${className}`}
      onClick={() => !paused && onClick()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (!paused) onClick();
        }
      }}
    >
      {children}
    </g>
  );
}
export function Title({
  kicker,
  title,
  subtitle,
}: {
  kicker: string;
  title: string[];
  subtitle?: string;
}) {
  return (
    <g className="scene-title">
      <text x="86" y="158" className="eyebrow">
        {kicker}
      </text>
      <text x="82" y="225" className="title">
        {title.map((t, i) => (
          <tspan x="82" dy={i ? 65 : 0} key={t}>
            {t}
          </tspan>
        ))}
      </text>
      {subtitle && (
        <text x="86" y={title.length > 1 ? 335 : 270} className="subtitle">
          {subtitle}
        </text>
      )}
    </g>
  );
}
export function Hint({
  x = 86,
  y = 692,
  children,
}: {
  x?: number;
  y?: number;
  children: ReactNode;
}) {
  return (
    <g className="hint" transform={`translate(${x} ${y})`}>
      <circle r="4" fill="#F09573" />
      <text x="16" y="5">
        {children}
      </text>
    </g>
  );
}
export function Symbol({
  kind,
  x = 0,
  y = 0,
  size = 60,
}: {
  kind: number;
  x?: number;
  y?: number;
  size?: number;
}) {
  const paths = [
    <path d="M-25 21L-7 3L7 10L29-20M12-20H29V-3" />,
    <>
      <circle cx="-22" cy="8" r="9" />
      <circle cx="22" cy="-12" r="9" />
      <path d="M-14 4L14-8" />
    </>,
    <>
      <path d="M0 26V2Q0-16-24-23M0 2Q0-16 24-23M-24-9V-23H-10M10-23H24V-9" />
    </>,
    <>
      <circle r="26" />
      <circle r="7" />
      <path d="M-19-17L-5-4M7 0L25 4M0 7L-8 25" />
    </>,
  ];
  return (
    <g
      transform={`translate(${x} ${y}) scale(${size / 60})`}
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[kind % 4]}
    </g>
  );
}

export default function App() {
  const [scene, setScene] = useState(0),
    [model, setModel] = useState<Model>(initial),
    [reset, setReset] = useState(0);
  const [panel, setPanel] = useState(false),
    [muted, setMuted] = useState(true),
    [paused, setPaused] = useState(false),
    [transitioning, setTransitioning] = useState(false),
    [status, setStatus] = useState("");
  const [reduced, setReduced] = useState(
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const dragging = useRef(false),
    busy = useRef(false),
    stage = useRef<SVGSVGElement>(null),
    sceneRef = useRef<SVGGElement>(null),
    bridge = useRef<SVGGElement>(null),
    timeline = useRef<gsap.core.Timeline | null>(null),
    audio = useRef<AudioContext | null>(null);
  const patch = useCallback(
    (p: Partial<Model>) => setModel((m) => ({ ...m, ...p })),
    [],
  );
  useEffect(() => {
    const q = matchMedia("(prefers-reduced-motion: reduce)");
    const fn = () => setReduced(q.matches);
    q.addEventListener("change", fn);
    return () => q.removeEventListener("change", fn);
  }, []);
  const sound = useCallback(() => {
    if (muted) return;
    try {
      audio.current ??= new AudioContext();
      const a = audio.current;
      void a.resume();
      const o = a.createOscillator(),
        gain = a.createGain();
      o.type = "triangle";
      o.frequency.setValueAtTime(150, a.currentTime);
      o.frequency.exponentialRampToValueAtTime(45, a.currentTime + 0.35);
      gain.gain.setValueAtTime(0.055, a.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, a.currentTime + 0.4);
      o.connect(gain);
      gain.connect(a.destination);
      o.start();
      o.stop(a.currentTime + 0.4);
    } catch {
      /* Audio is optional. */
    }
  }, [muted]);
  const go = useCallback(
    (target: number) => {
      if (
        busy.current ||
        dragging.current ||
        paused ||
        target === scene ||
        target < 0 ||
        target > 7
      )
        return;
      busy.current = true;
      setTransitioning(true);
      sound();
      const group = sceneRef.current!,
        objects = group.querySelectorAll(".scene-object"),
        b = bridge.current!;
      gsap.set(b, { visibility: "visible" });
      const path = b.querySelector("path")!;
      const fragments = b.querySelectorAll("rect");
      const dust = b.querySelectorAll(".bridge-grain");
      const from = [
        "M1040 430L1040 430L1040 430",
        "M720 405L1020 230L1230 450",
        "M100 228L720 228L1340 228",
        "M720 180L1020 450L1320 180",
        "M380 425L720 425L1060 425",
        "M300 620L720 620L1140 620",
        "M240 430L720 350L1200 430",
        "M240 430L720 430L1200 430",
      ][scene];
      gsap.set(path, {
        attr: { d: from },
        stroke: scene === 6 ? "#E9C58A" : "#217B80",
        strokeWidth: scene === 2 ? 14 : 3,
      });
      gsap.set(fragments, { x: 0, y: 0, rotation: 0, opacity: 0 });
      gsap.set(dust, { opacity: 0, x: 0, y: 0 });
      const tl = gsap.timeline({
        onComplete: () => {
          busy.current = false;
          setTransitioning(false);
          gsap.set(b, { visibility: "hidden" });
        },
      });
      timeline.current = tl;
      const d = reduced ? 0.01 : 0.68;
      if (scene === 6) {
        gsap.set(dust, { opacity: 1 });
        tl.to(
          dust,
          {
            x: (i) => ((i % 15) - 7) * 42,
            y: (i) => 200 + Math.floor(i / 15) * 27,
            duration: reduced ? 0.01 : 1.15,
            stagger: reduced ? 0 : 0.0015,
            ease: "power2.in",
          },
          0,
        );
        tl.to(dust, { opacity: 0, duration: 0.25 }, d + 0.25);
      }
      if (scene === 0)
        tl.to(
          objects,
          {
            x: (_, el) => 1040 - (Number(el.getAttribute("data-x")) || 720),
            y: (_, el) => 430 - (Number(el.getAttribute("data-y")) || 400),
            scale: 0.12,
            transformOrigin: "center",
            duration: d,
            ease: "power2.inOut",
          },
          0,
        );
      else if (scene === 2) {
        tl.to(
          objects,
          { y: -780, stagger: 0.025, duration: d, ease: "power3.in" },
          0,
        );
        tl.to(
          fragments,
          {
            opacity: 1,
            x: (i) => (i - 6) * 55,
            y: (i) => 180 + (i % 4) * 70,
            rotation: (i) => (i - 6) * 17,
            duration: d,
            ease: "power2.in",
          },
          0,
        );
      } else if (scene === 3)
        tl.to(
          objects,
          {
            scale: 3,
            x: -850,
            y: -400,
            transformOrigin: "1020px 440px",
            duration: d,
            ease: "power3.in",
          },
          0,
        );
      else if (scene === 6)
        tl.to(
          objects,
          {
            y: 400,
            scale: 0.2,
            rotation: 12,
            duration: d,
            stagger: 0.04,
            ease: "power2.in",
          },
          0,
        );
      else
        tl.to(
          objects,
          {
            x: scene === 1 ? -240 : 120,
            scale: scene === 1 ? 2.3 : 0.65,
            rotation: scene === 4 ? -8 : 0,
            transformOrigin: "720px 420px",
            duration: d,
            ease: "power2.inOut",
          },
          0,
        );
      tl.to(
        path,
        {
          attr: {
            d:
              target === 2
                ? "M220 580L720 300L1220 580"
                : target === 7
                  ? "M0 650Q720 250 1440 650"
                  : "M100 430Q720 120 1340 430",
          },
          duration: d,
          ease: "power2.inOut",
        },
        0,
      );
      tl.call(
        () => {
          setScene(target);
          setStatus(`Сцена ${target + 1}: ${chapters[target][2]}`);
        },
        [],
        d,
      );
      tl.to(
        path,
        {
          strokeWidth: target === 7 ? 120 : 1,
          attr: {
            d:
              target === 1
                ? "M720 430L1020 230L1230 450"
                : target === 2
                  ? "M220 620L720 620L1220 620"
                  : target === 7
                    ? "M0 740Q720 650 1440 740"
                    : "M100 620Q720 620 1340 620",
          },
          duration: reduced ? 0.01 : 0.55,
          ease: "power2.out",
        },
        d,
      );
      tl.to(fragments, { opacity: 0, duration: 0.25 }, d + 0.25);
      tl.call(
        () => {
          if (sceneRef.current) {
            gsap.fromTo(
              sceneRef.current,
              { y: target === 3 ? 120 : target === 7 ? -60 : 18 },
              { y: 0, duration: reduced ? 0 : 0.55, ease: "power3.out" },
            );
          }
        },
        [],
        d + 0.02,
      );
    },
    [scene, paused, reduced, sound],
  );
  const next = useCallback(() => go(scene + 1), [go, scene]);
  const resetScene = useCallback(() => {
    if (busy.current || dragging.current) return;
    setReset((n) => n + 1);
    setModel((m) => ({
      ...m,
      ...(scene === 0
        ? { chaos: false }
        : scene === 2
          ? { bars: [35, 40, 25] }
          : scene === 3
            ? { visits: [] }
            : scene === 4
              ? { matched: [] }
              : scene === 5
                ? { baseline: 65 }
                : scene === 6
                  ? { connected: [] }
                  : scene === 7
                    ? { final: false }
                    : {}),
    }));
  }, [scene]);
  const fullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else
      void document.documentElement
        .requestFullscreen()
        .catch(() =>
          setStatus("Полноэкранный режим недоступен в этом браузере."),
        );
  };
  useEffect(() => {
    gsap.globalTimeline.paused(paused);
    return () => {
      gsap.globalTimeline.paused(false);
    };
  }, [paused]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (
        (e.target as HTMLElement).matches("input,textarea,select") ||
        e.altKey ||
        e.ctrlKey ||
        e.metaKey
      )
        return;
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        if ((e.target as HTMLElement).closest('[role="slider"], .network'))
          return;
        e.preventDefault();
        go(scene + (e.key === "ArrowRight" ? 1 : -1));
      } else if (e.code === "KeyR") resetScene();
      else if (e.code === "KeyF") fullscreen();
      else if (e.code === "KeyM") setMuted((m) => !m);
      else if (e.code === "KeyP") setPanel((p) => !p);
      else if (e.code === "Space" && e.target === document.body) {
        e.preventDefault();
        setPaused((p) => !p);
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [go, scene, resetScene]);
  useEffect(
    () => () => {
      timeline.current?.kill();
      audio.current?.close();
    },
    [],
  );
  const scenes = [
      Chaos,
      Network,
      Bars,
      Spotlight,
      Memory,
      Judgment,
      Synthesis,
      Sand,
    ],
    Scene = scenes[scene];
  return (
    <WorldContext.Provider
      value={{ model, patch, next, dragging, paused, reduced, sound }}
    >
      <main
        className={`experience ${scene === 3 ? "dark" : ""} ${paused ? "paused" : ""} ${reduced ? "reduced" : ""}`}
      >
        <header>
          <a
            className="brand"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              go(0);
            }}
            aria-label="К началу"
          >
            <span className="brand-mark">
              <i />
              <i />
              <i />
            </span>
            <span>
              ФОРМА<span className="brand-slash">/</span>СМЫСЛ
            </span>
          </a>
          <span className="edition">
            ИНТЕРАКТИВНОЕ ЭССЕ <span>·</span> 07 МИН
          </span>
          <button
            className={`presenter-trigger ${panel ? "active" : ""}`}
            onClick={() => setPanel((p) => !p)}
            aria-expanded={panel}
          >
            <span className="live-dot" />
            Режим выступающего <span>⌘</span>
          </button>
        </header>
        <svg
          ref={stage}
          className="stage"
          viewBox="0 0 1440 810"
          aria-label={`Сцена ${scene + 1}. ${chapters[scene][2]}`}
        >
          <defs>
            <pattern
              id="paper"
              width="9"
              height="9"
              patternUnits="userSpaceOnUse"
            >
              <circle
                cx="1"
                cy="1"
                r=".45"
                fill="currentColor"
                opacity=".055"
              />
            </pattern>
            <pattern
              id="grid"
              width="60"
              height="60"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M60 0H0V60"
                fill="none"
                stroke="#A8B7BC"
                strokeWidth=".6"
                opacity=".35"
              />
            </pattern>
            <filter id="soft">
              <feGaussianBlur stdDeviation="16" />
            </filter>
            <linearGradient id="mint" x2="1" y2="1">
              <stop stopColor="#8ED9C2" />
              <stop offset="1" stopColor="#217B80" />
            </linearGradient>
            <radialGradient id="light">
              <stop stopColor="#E9C58A" stopOpacity=".4" />
              <stop offset="1" stopColor="#E9C58A" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect
            width="1440"
            height="810"
            fill="url(#paper)"
            pointerEvents="none"
          />
          <g
            ref={sceneRef}
            key={`${scene}-${reset}`}
            style={{ pointerEvents: transitioning ? "none" : undefined }}
          >
            <Scene />
          </g>
          <g
            ref={bridge}
            className="transition-bridge"
            visibility="hidden"
            pointerEvents="none"
          >
            <path fill="none" strokeLinecap="round" />
            {Array.from({ length: 14 }, (_, i) => (
              <rect
                key={i}
                x={80 + i * 96}
                y="220"
                width="94"
                height={10 + (i % 3) * 7}
                fill={i % 2 ? "#217B80" : "#172333"}
              />
            ))}
            {Array.from({ length: 90 }, (_, i) => (
              <circle
                className="bridge-grain"
                key={`grain-${i}`}
                cx={290 + (i % 4) * 270 + ((i % 7) - 3) * 7}
                cy={380 + (i % 11) * 7}
                r={1.5 + (i % 3) * 0.6}
                fill="#E9C58A"
              />
            ))}
          </g>
        </svg>
        <footer>
          <div className="chapter-index">
            <span>{String(scene + 1).padStart(2, "0")}</span>
            <span className="index-divider">/</span>
            <span>08</span>
          </div>
          <div className="chapter-name">
            <strong>{chapters[scene][0]}</strong>
            <small>{chapters[scene][1]}</small>
          </div>
          <nav className="timeline" aria-label="Сцены">
            {chapters.map((c, i) => (
              <button
                key={i}
                className={i === scene ? "current" : i < scene ? "past" : ""}
                onClick={() => go(i)}
                aria-label={`${i + 1}. ${c[2]}`}
                aria-current={i === scene ? "step" : undefined}
                disabled={transitioning || paused}
              >
                <span />
                {i === scene && <small>{String(i + 1).padStart(2, "0")}</small>}
              </button>
            ))}
          </nav>
          <button
            className="skip"
            disabled={transitioning || paused || scene === 7}
            onClick={next}
          >
            {scene === 7 ? "Финал" : "Дальше"}{" "}
            <span>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  d="M5 19L19 5M5 5H19V19"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
            </span>
          </button>
        </footer>
        {panel && (
          <aside className="presenter" aria-label="Панель выступающего">
            <div className="panel-heading">
              Управление{" "}
              <button
                onClick={() => setPanel(false)}
                aria-label="Закрыть панель"
              >
                ×
              </button>
            </div>
            <div className="control-row">
              <button onClick={() => setPaused((p) => !p)}>
                {paused ? "▶ Продолжить" : "Ⅱ Пауза"}
              </button>
              <button onClick={() => setMuted((m) => !m)}>
                {muted ? "♫ Звук выкл." : "♫ Звук вкл."}
              </button>
            </div>
            <div className="control-row">
              <button onClick={resetScene}>↺ Сбросить</button>
              <button onClick={fullscreen}>⛶ Весь экран</button>
            </div>
            <select
              aria-label="Открыть сцену"
              value={scene}
              onChange={(e) => go(Number(e.target.value))}
              disabled={paused || transitioning}
            >
              {chapters.map((c, i) => (
                <option value={i} key={i}>
                  {i + 1}. {c[2]}
                </option>
              ))}
            </select>
            <p>
              ← → сцены · R сброс · F экран
              <br />M звук · P панель · пробел пауза
            </p>
            <a href="./MONOLOG.md" target="_blank" rel="noreferrer">
              Текст выступления ↗
            </a>
            <a href="./SOURCES.md" target="_blank" rel="noreferrer">
              Научные источники ↗
            </a>
            <small>
              Сложные жесты дублируются доступными кнопками. Пауза останавливает
              анимации и взаимодействие.
            </small>
          </aside>
        )}
        {paused && (
          <div className="pause-label" role="status">
            Пауза <button onClick={() => setPaused(false)}>Продолжить →</button>
          </div>
        )}
        <span className="sr-only" role="status" aria-live="polite">
          {status}
        </span>
      </main>
    </WorldContext.Provider>
  );
}
