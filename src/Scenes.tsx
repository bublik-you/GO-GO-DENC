import { useState, useRef, useEffect } from "react";
import * as d3 from "d3";
import gsap from "gsap";
import {
  COLORS,
  Title,
  Hint,
  SvgButton,
  Symbol,
  point,
  useDrag,
  useWorld,
} from "./App";
import {
  clamp,
  redistribute,
  chartHeight,
  displayPercentages,
} from "./math.mjs";

export function Chaos() {
  const { next, patch, dragging, paused } = useWorld();
  const [pos, setPos] = useState({ x: 1130, y: 560 }),
    [near, setNear] = useState(false);
  const posRef = useRef(pos);
  const done = useRef(false);
  const finish = () => {
    if (done.current) return;
    done.current = true;
    patch({ chaos: true });
    next();
  };
  const drag = useDrag(
    (p) => {
      const q = { x: clamp(p.x, 180, 1300), y: clamp(p.y, 190, 650) };
      posRef.current = q;
      setPos(q);
      setNear(Math.hypot(q.x - 1040, q.y - 395) < 110);
    },
    () => {
      if (Math.hypot(posRef.current.x - 1040, posRef.current.y - 395) < 110)
        finish();
    },
  );
  const noise = [
    "68",
    "данные",
    "↗",
    "01",
    "форма",
    "74%",
    "?",
    "контекст",
    "128",
    "×",
    "история",
    "+",
    "100",
    "сигнал",
    "//",
    "42",
    "связь",
    "факт",
    "8.4",
    "идея",
    "∆",
    "шум",
  ];
  return (
    <>
      <Title
        kicker="01 / ВИЗУАЛЬНАЯ КОММУНИКАЦИЯ"
        title={["Сила инфографики", "и презентаций"]}
      />
      <text x="86" y="390" className="intro-copy">
        <tspan x="86">Информации всё больше.</tspan>
        <tspan x="86" dy="31">
          Понимание не возникает само собой.
        </tspan>
      </text>
      <g className="scene-object" data-x="1040" data-y="395">
        <circle
          cx="1040"
          cy="395"
          r={near ? 148 : 132}
          className={`magnet ${near ? "near" : ""}`}
          fill="none"
          stroke="#217B80"
          strokeDasharray="2 9"
        />
        <circle cx="1040" cy="395" r="88" fill="url(#light)" />
        <path d="M1025 395H1055M1040 380V410" stroke="#217B80" opacity=".45" />
        <text x="1040" y="445" textAnchor="middle" className="micro">
          МЕСТО ДЛЯ СМЫСЛА
        </text>
      </g>
      {noise.map((n, i) => {
        const angle = i * 2.39996,
          r = 148 + (i % 4) * 24;
        const x = 1040 + Math.cos(angle) * r,
          y = 390 + Math.sin(angle) * r;
        const magnet = near ? 0.7 : 1;
        return (
          <g
            key={i}
            className="scene-object"
            data-x={x}
            data-y={y}
            transform={`translate(${1040 + (x - 1040) * magnet} ${395 + (y - 395) * magnet})`}
            opacity={0.2 + (i % 4) * 0.13}
          >
            <g className={`float float-${i % 3}`}>
              <text
                textAnchor="middle"
                fontSize={18 + (i % 4) * 7}
                fill={COLORS[i % 4]}
                transform={`rotate(${((i % 5) - 2) * 10})`}
              >
                {n}
              </text>
            </g>
          </g>
        );
      })}
      <g className="scene-object">
        <path
          d="M830 300L1210 500M860 550L1190 240M810 420L1280 350"
          stroke="#A8B7BC"
          fill="none"
          opacity=".35"
        />
        <circle cx="812" cy="420" r="5" fill="#217B80" />
        <circle cx="1210" cy="500" r="7" fill="#F09573" />
      </g>
      <g
        {...drag}
        transform={`translate(${pos.x} ${pos.y})`}
        className="draggable meaning"
        role="button"
        tabIndex={0}
        aria-label="Перенести смысл в центр"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (!paused) {
              dragging.current = false;
              finish();
            }
          }
        }}
      >
        <rect x="-101" y="-32" width="202" height="64" rx="32" fill="#217B80" />
        <text
          textAnchor="middle"
          y="8"
          fontSize="22"
          letterSpacing="5"
          fill="#F7F4EC"
        >
          СМЫСЛ
        </text>
        <circle cx="-75" cy="0" r="3" fill="#8ED9C2" />
      </g>
      <g transform="translate(87 532)">
        <path
          d="M0 0H35M23-10L35 0L23 10"
          stroke="#F09573"
          fill="none"
          strokeWidth="1.8"
        />
        <text x="52" y="6" className="body-small">
          Из шума — в ясную картину.
        </text>
        <text x="52" y="30" className="muted-small">
          История, которую вы собираете сами.
        </text>
      </g>
      <Hint>
        Перетащи «СМЫСЛ» в пунктирный круг · или выбери его и нажми Enter
      </Hint>
      <text x="1315" y="692" textAnchor="end" className="micro">
        НЕ СМОТРЕТЬ. УЧАСТВОВАТЬ.
      </text>
    </>
  );
}

const nodes = [
  { x: 720, y: 425, label: "ВИЗУАЛЬНАЯ", sub: "КОММУНИКАЦИЯ" },
  { x: 380, y: 300, label: "ВНИМАНИЕ" },
  { x: 1040, y: 280, label: "ПОНИМАНИЕ" },
  { x: 400, y: 590, label: "ПАМЯТЬ" },
  { x: 1080, y: 570, label: "СУЖДЕНИЕ" },
];
const details = [
  ["Иерархия", "Контраст", "Выделяет главное"],
  ["Связи", "Структура", "Объясняет отношения"],
  ["Образы", "Согласованность", "Помогает узнавать"],
  ["Масштаб", "Контекст", "Влияет на выводы"],
];
export function Network() {
  const { next, paused, dragging } = useWorld();
  const viewport = useRef<SVGGElement>(null),
    content = useRef<SVGGElement>(null),
    behavior = useRef<d3.ZoomBehavior<SVGGElement, unknown> | null>(null);
  const [k, setK] = useState(1),
    [selected, setSelected] = useState(0);
  const pauseRef = useRef(paused);
  pauseRef.current = paused;
  useEffect(() => {
    const g = d3.select(viewport.current!);
    const z = d3
      .zoom<SVGGElement, unknown>()
      .extent([
        [0, 100],
        [1440, 710],
      ])
      .scaleExtent([0.65, 3.2])
      .translateExtent([
        [-900, -500],
        [2300, 1300],
      ])
      .filter(
        (e) =>
          !pauseRef.current &&
          (e.type === "wheel" ||
            (!e.target.closest('[role="button"]') && !e.button)),
      )
      .on("start", () => {
        dragging.current = true;
      })
      .on("zoom", (e) => {
        d3.select(content.current).attr("transform", e.transform.toString());
        setK(e.transform.k);
      })
      .on("end", () => {
        dragging.current = false;
      });
    behavior.current = z;
    g.call(z);
    return () => {
      g.on(".zoom", null);
      dragging.current = false;
    };
  }, [dragging]);
  const zoom = (n: number) => {
    d3.select(viewport.current!).call(behavior.current!.scaleBy, n);
  };
  const reset = () => {
    d3.select(viewport.current!).call(
      behavior.current!.transform,
      d3.zoomIdentity,
    );
  };
  return (
    <>
      <Title
        kicker="02 / СТРУКТУРА"
        title={["Увидеть связи."]}
        subtitle="От общей картины — к деталям."
      />
      <g
        ref={viewport}
        className="network"
        tabIndex={0}
        role="group"
        aria-label="Сеть знаний. Плюс и минус — масштаб, стрелки — перемещение, 0 — общий вид"
        onKeyDown={(e) => {
          if (paused) return;
          if (
            [
              "+",
              "=",
              "-",
              "0",
              "ArrowLeft",
              "ArrowRight",
              "ArrowUp",
              "ArrowDown",
            ].includes(e.key)
          )
            e.preventDefault();
          if (e.key === "+" || e.key === "=") zoom(1.2);
          if (e.key === "-") zoom(1 / 1.2);
          if (e.key === "0") reset();
          if (e.key.startsWith("Arrow"))
            d3.select(viewport.current!).call(
              behavior.current!.translateBy,
              e.key === "ArrowLeft" ? 70 : e.key === "ArrowRight" ? -70 : 0,
              e.key === "ArrowUp" ? 70 : e.key === "ArrowDown" ? -70 : 0,
            );
        }}
      >
        <rect x="70" y="285" width="1300" height="380" fill="transparent" />
        <g ref={content}>
          <g className="scene-object">
            {nodes.slice(1).map((n, i) => (
              <g key={n.label}>
                <path
                  d={`M720 425 Q${n.x} 425 ${n.x} ${n.y}`}
                  fill="none"
                  stroke={i === 1 ? "#F09573" : "#A8B7BC"}
                  strokeWidth={i === 1 ? 2 : 1.2}
                />
                {[0, 1].map((j) => {
                  const x = n.x + (i % 2 ? -1 : 1) * (j ? 110 : -100),
                    y = n.y + (i < 2 ? -80 : 70);
                  return (
                    <g key={j}>
                      <path
                        d={`M${n.x} ${n.y}Q${x} ${n.y} ${x} ${y}`}
                        fill="none"
                        stroke="#A8B7BC"
                      />
                      <circle
                        cx={x}
                        cy={y}
                        r={k > 1.2 ? 8 : 4}
                        fill="#8ED9C2"
                      />
                      {k > 1.2 && (
                        <text
                          x={x}
                          y={y - 16}
                          textAnchor="middle"
                          className="body-small"
                        >
                          {details[i][j]}
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>
            ))}
          </g>
          {nodes.map((n, i) => (
            <g className="scene-object" key={i}>
              <SvgButton
                x={n.x}
                y={n.y}
                label={i === 2 ? "Исследовать понимание" : n.label}
                onClick={() => (i === 2 ? next() : setSelected(i))}
              >
                <circle
                  r={i === 0 ? 104 : 60}
                  fill={i === 0 ? "#217B80" : i === 2 ? "#F09573" : "#F7F4EC"}
                  stroke={i === 2 ? "#F09573" : "#A8B7BC"}
                  strokeWidth="1"
                />
                {i === 2 && (
                  <circle
                    r="72"
                    className="pulse-ring"
                    fill="none"
                    stroke="#F09573"
                  />
                )}
                <text
                  textAnchor="middle"
                  y={i === 0 ? -5 : 5}
                  fill={i === 0 ? "#F7F4EC" : "#172333"}
                  fontSize={i === 0 ? 16 : 13}
                  letterSpacing="1"
                >
                  {n.label}
                </text>
                {n.sub && (
                  <text
                    y="20"
                    textAnchor="middle"
                    fill="#8ED9C2"
                    fontSize="13"
                    letterSpacing="1"
                  >
                    {n.sub}
                  </text>
                )}
              </SvgButton>
              {k > 1.7 && i > 0 && (
                <text
                  x={n.x}
                  y={n.y + 90}
                  textAnchor="middle"
                  className="body-small"
                >
                  {details[i - 1][2]}
                </text>
              )}
            </g>
          ))}
          <text
            x="1040"
            y="177"
            textAnchor="middle"
            fill="#B15A3D"
            className="micro"
          >
            ИССЛЕДУЙ ЭТОТ ЭЛЕМЕНТ ↓
          </text>
        </g>
      </g>
      <g transform="translate(1110 650)">
        <SvgButton label="Отдалить сеть" onClick={() => zoom(1 / 1.3)}>
          <rect width="42" height="36" rx="18" fill="#E9E7DF" />
          <text x="21" y="24" textAnchor="middle">
            −
          </text>
        </SvgButton>
        <text x="76" y="24" className="micro" textAnchor="middle">
          {Math.round(k * 100)}%
        </text>
        <SvgButton x={110} label="Приблизить сеть" onClick={() => zoom(1.3)}>
          <rect width="42" height="36" rx="18" fill="#E9E7DF" />
          <text x="21" y="24" textAnchor="middle">
            +
          </text>
        </SvgButton>
        <SvgButton x={170} label="Общий вид сети" onClick={reset}>
          <text y="24" className="micro">
            ↺
          </text>
        </SvgButton>
      </g>
      <Hint>
        {selected
          ? details[selected - 1][2]
          : "Приблизь сеть · перемести схему · нажми на «ПОНИМАНИЕ»"}
      </Hint>
    </>
  );
}

export function Bars() {
  const { model, patch, next, dragging, paused } = useWorld();
  const values = model.bars;
  const displayed = displayPercentages(values);
  const start = useRef({ y: 0, value: 0, values: values });
  const [pressure, setPressure] = useState(0);
  const active = useRef<number | null>(null),
    broken = useRef(false);
  const update = (i: number, raw: number) => {
    patch({ bars: redistribute(start.current.values, i, raw) });
    if (i === 2) setPressure(clamp((raw - 70) / 24, 0, 1));
    if (i === 2 && raw >= 94 && !broken.current) {
      broken.current = true;
      dragging.current = false;
      next();
    }
  };
  const drag = useDrag(
    (p) => {
      if (active.current === null) return;
      update(
        active.current,
        start.current.value + (start.current.y - p.y) / 4.6,
      );
    },
    () => {
      setPressure(0);
      active.current = null;
    },
  );
  const labels = ["ТЕКСТ", "ГРАФИКА", "ПРОСТРАНСТВО"];
  const x = [310, 610, 910];
  const tops = values.map((v) => 620 - v * 4.6);
  const line = d3.line<[number, number]>().curve(d3.curveCatmullRom.alpha(0.5))(
    [
      [x[0], tops[0]],
      [x[1], tops[1]],
      [x[2], tops[2]],
    ],
  )!;
  return (
    <>
      <Title
        kicker="03 / КОМПОЗИЦИЯ КАК СИСТЕМА"
        title={["Всё взаимосвязано."]}
      />
      <rect x="180" y="300" width="890" height="320" fill="url(#grid)" />
      <g className="scene-object">
        <path
          d={`M180 237 Q910 ${237 - pressure * 45} 1070 237`}
          fill="none"
          stroke="#172333"
          strokeWidth="20"
        />
        <path d="M180 231H1070" stroke="#A8B7BC" opacity=".4" />
        {pressure > 0 && (
          <path
            d={`M906 224l-10 ${10 + pressure * 20} 22 -6 -16 ${pressure * 36} 22 -7`}
            stroke="#F7F4EC"
            fill="none"
            strokeWidth="2"
          />
        )}
        <text x="1070" y="213" textAnchor="end" className="micro">
          ГРАНИЦА ПРИВЫЧНОГО
        </text>
        <text
          x="1010"
          y="284"
          className="micro"
          textAnchor="end"
          fill="#B15A3D"
        >
          ↑ ПОТЯНИ ВЫШЕ
        </text>
      </g>
      <path
        className="scene-object"
        d={line}
        fill="none"
        stroke="#A8B7BC"
        strokeWidth="1.5"
      />
      {values.map((v, i) => (
        <g className="scene-object" key={i}>
          <g
            {...drag}
            onPointerDown={(e) => {
              if (paused) return;
              active.current = i;
              start.current = { y: point(e).y, value: v, values: [...values] };
              drag.onPointerDown(e);
            }}
            className="draggable bar"
            role="slider"
            tabIndex={0}
            aria-label={labels[i]}
            aria-valuemin={8}
            aria-valuemax={84}
            aria-valuenow={displayed[i]}
            aria-valuetext={`${v.toFixed(1)} процента`}
            onKeyDown={(e) => {
              if (paused) return;
              if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                e.preventDefault();
                e.stopPropagation();
                start.current.values = values;
                patch({
                  bars: redistribute(
                    values,
                    i,
                    v + (e.key === "ArrowUp" ? 2 : -2),
                  ),
                });
              }
              if (i === 2 && e.key === "Enter") {
                e.preventDefault();
                next();
              }
            }}
          >
            <rect
              x={x[i] - 93}
              y={tops[i]}
              width="186"
              height={v * 4.6}
              rx="15"
              fill={COLORS[i]}
              stroke={i === 2 ? "#F09573" : "none"}
              strokeWidth={i === 2 ? 1.5 : 0}
            />
            <path
              d={`M${x[i] - 16} ${tops[i] + 14}h32M${x[i] - 16} ${tops[i] + 20}h32`}
              stroke={i === 2 ? "#217B80" : "#F7F4EC"}
              opacity=".5"
            />
            <text
              x={x[i]}
              y={tops[i] - 20}
              textAnchor="middle"
              className="percent"
            >
              {displayed[i]}
              <tspan fontSize="18">%</tspan>
            </text>
            {i === 0 ? (
              <g stroke="#F7F4EC" strokeWidth="2">
                <path
                  d={`M${x[i] - 22} ${tops[i] + v * 2.3}h44m-44 8h32m-32 8h39`}
                />
              </g>
            ) : (
              <g style={{ color: i === 1 ? "#8ED9C2" : "#217B80" }}>
                <Symbol
                  kind={i === 1 ? 0 : 2}
                  x={x[i]}
                  y={tops[i] + v * 2.3}
                  size={36}
                />
              </g>
            )}
          </g>
          <text x={x[i]} y="653" textAnchor="middle" className="micro">
            {labels[i]}
          </text>
        </g>
      ))}
      <path d="M180 620H1070" stroke="#172333" />
      <g transform="translate(1130 365)">
        <text className="micro">ЖИВАЯ КОМПОЗИЦИЯ</text>
        <rect
          y="24"
          width="230"
          height="150"
          rx="5"
          fill="#EEECE4"
          stroke="#A8B7BC"
        />
        <g
          transform={`translate(${12 + values[2] * 0.3} ${37 + values[2] * 0.2})`}
        >
          <rect width={values[0] * 1.8} height="6" rx="2" fill="#172333" />
          {[0, 1, 2].map((j) => (
            <rect
              key={j}
              y={16 + j * 8}
              width={values[0] * (j === 2 ? 1 : 1.65)}
              height="3"
              fill="#A8B7BC"
            />
          ))}
          <rect
            x={80 + values[2] * 0.15}
            y="5"
            width={values[1] * 1.55}
            height={values[1] * 1.5}
            rx="5"
            fill="#217B80"
          />
          <circle cx={100 + values[2] * 0.15} cy="23" r="7" fill="#8ED9C2" />
        </g>
        <text y="203" className="muted-small">
          Сумма всегда 100%
        </text>
        <text y="226" className="muted-small">
          Модель, не рецепт идеала.
        </text>
      </g>
      <Hint>Перетаскивай колонки · подними «ПРОСТРАНСТВО» сквозь границу</Hint>
      <SvgButton x={1125} y={682} label="Пройти сквозь границу" onClick={next}>
        <text className="link-small">За пределы ↗</text>
      </SvgButton>
    </>
  );
}

export function Spotlight() {
  const { model, patch, next, reduced, paused, dragging } = useWorld();
  const [light, setLight] = useState({ x: 370, y: 390 }),
    [mini, setMini] = useState(false);
  const visits = useRef(model.visits),
    miniRef = useRef<SVGGElement>(null),
    timeline = useRef<gsap.core.Timeline | null>(null);
  const targets = [
    {
      x: 370,
      y: 385,
      label: "Заголовок",
      note: "Иерархия показывает, с чего начать.",
    },
    {
      x: 690,
      y: 510,
      label: "Диаграмма",
      note: "Контраст помогает выделить закономерность.",
    },
    {
      x: 1030,
      y: 395,
      label: "Главное",
      note: "Один фокус объединяет историю.",
    },
  ];
  const illuminate = (p: { x: number; y: number }) => {
    setLight(p);
    const found = targets.findIndex(
      (t) => Math.hypot(t.x - p.x, t.y - p.y) < 105,
    );
    if (found < 0) return;
    if (found === 2 && visits.current.length >= 2) {
      dragging.current = false;
      setMini(true);
    }
    const order = [0, 1, 2];
    if (found === order[visits.current.length]) {
      visits.current = [...visits.current, found];
      patch({ visits: visits.current });
      if (found === 2) {
        dragging.current = false;
        setMini(true);
      }
    }
  };
  const drag = useDrag(illuminate, undefined, illuminate);
  useEffect(() => {
    if (!mini) return;
    const t = gsap.timeline();
    timeline.current = t;
    t.fromTo(
      miniRef.current,
      { scale: 0.1, transformOrigin: "1030px 395px" },
      { scale: 1, duration: reduced ? 0.01 : 0.8, ease: "power3.inOut" },
    )
      .fromTo(
        ".pixel-person",
        { x: 495, y: 420 },
        { x: 785, y: 340, duration: reduced ? 0.01 : 3, ease: "steps(12)" },
      )
      .to(
        ".idea-tree",
        {
          scale: 1.35,
          transformOrigin: "720px 430px",
          duration: reduced ? 0.01 : 1,
        },
        "<",
      )
      .call(() => next());
    return () => {
      t.kill();
    };
  }, [mini, reduced, next]);
  const current = targets.findIndex(
    (t) => Math.hypot(t.x - light.x, t.y - light.y) < 105,
  );
  return (
    <>
      <Title
        kicker="04 / ИЗБИРАТЕЛЬНОЕ ВНИМАНИЕ"
        title={["Свет меняет", "порядок чтения."]}
        subtitle="Не всё должно звучать одновременно."
      />
      <g className="scene-object">
        <path
          d={`M720 100L${light.x - 160} ${light.y + 100}Q${light.x} ${light.y + 160} ${light.x + 160} ${light.y + 100}Z`}
          fill="#E9C58A"
          opacity=".035"
        />
        <circle cx={light.x} cy={light.y} r="230" fill="url(#light)" />
        <path d="M710 84h20l14 25h-48z" fill="#A8B7BC" />
      </g>
      {!mini &&
        targets.map((t, i) => (
          <g
            className="scene-object"
            key={i}
            opacity={current === i ? 1 : 0.28}
          >
            <SvgButton
              label={`Осветить: ${t.label}`}
              x={t.x}
              y={t.y}
              onClick={() => illuminate(t)}
            >
              <rect
                x="-120"
                y="-75"
                width="240"
                height="150"
                rx="10"
                fill="#273D47"
                stroke={visits.current.includes(i) ? "#E9C58A" : "#A8B7BC"}
                strokeWidth=".7"
              />
              {i === 0 ? (
                <>
                  <text x="-88" y="-20" fontSize="27" fill="#F7F4EC">
                    Одна мысль.
                  </text>
                  {[0, 1, 2].map((j) => (
                    <path
                      key={j}
                      d={`M-86 ${j * 14 + 5}h${135 - j * 20}`}
                      stroke="#A8B7BC"
                      strokeWidth="4"
                    />
                  ))}
                </>
              ) : i === 1 ? (
                <g fill="#8ED9C2">
                  {[32, 65, 92, 55].map((v, j) => (
                    <rect
                      key={j}
                      x={j * 40 - 72}
                      y={42 - v}
                      width="25"
                      height={v}
                      rx="4"
                    />
                  ))}
                </g>
              ) : (
                <>
                  <circle r="44" fill="#E9C58A" />
                  <path
                    d="M-18 0h36M0-18v36"
                    stroke="#172333"
                    strokeWidth="2"
                  />
                </>
              )}
              <text
                y="105"
                textAnchor="middle"
                className="micro"
                fill="#F7F4EC"
              >
                {String(i + 1).padStart(2, "0")} / {t.label.toUpperCase()}
              </text>
            </SvgButton>
          </g>
        ))}
      {!mini && (
        <g
          {...drag}
          className="draggable"
          role="group"
          aria-label="Перемещаемое световое пятно"
        >
          <circle
            cx={light.x}
            cy={light.y}
            r="100"
            fill="transparent"
            stroke="#E9C58A"
            strokeWidth="1"
            strokeDasharray="3 10"
          />
          <circle
            cx={light.x}
            cy={light.y}
            r="6"
            fill="#E9C58A"
            pointerEvents="none"
          />
        </g>
      )}
      {!mini && (
        <g>
          <text x="86" y="612" className="body-small" fill="#E9C58A">
            {current >= 0
              ? targets[current].note
              : "Найди объект в луче света."}
          </text>
          <Hint>
            Освети по очереди: заголовок → диаграмму → главное · можно нажимать
          </Hint>
        </g>
      )}
      <g opacity=".25" className="scene-object" transform="translate(1250 550)">
        <Symbol kind={2} size={100} />
      </g>
      {mini && (
        <g ref={miniRef} className="scene-object">
          <rect
            x="210"
            y="170"
            width="1020"
            height="490"
            rx="12"
            fill="#12242B"
            stroke="#E9C58A"
          />
          <g
            className="idea-tree"
            stroke="#8ED9C2"
            strokeWidth="8"
            fill="none"
            shapeRendering="crispEdges"
          >
            <path d="M720 610V300M720 520H470V420M720 430H990V330M720 350H590V270" />
            {[470, 590, 720, 990].map((x, i) => (
              <rect
                key={x}
                x={x - 36}
                y={i === 0 ? 370 : i === 1 ? 220 : 250}
                width="72"
                height="65"
                fill={COLORS[i + 1]}
                stroke="none"
              />
            ))}
          </g>
          <g
            className="pixel-person"
            transform="translate(495 420)"
            fill="#F09573"
            shapeRendering="crispEdges"
          >
            <rect x="-8" y="-30" width="16" height="16" />
            <rect x="-12" y="-12" width="24" height="24" />
            <path d="M-12 12h8v14h-8M4 12h8v14h-8" />
          </g>
          <text x="270" y="615" fill="#E9C58A" className="micro">
            ОДНА ИСТОРИЯ СОЕДИНЯЕТ РАЗНЫЕ ИДЕИ
          </text>
          <SvgButton
            x={1080}
            y={616}
            label="Завершить историю"
            onClick={() => {
              if (!paused) next();
            }}
          >
            <text className="micro" fill="#F7F4EC">
              ДАЛЕЕ ↗
            </text>
          </SvgButton>
        </g>
      )}
    </>
  );
}

const concepts = ["Рост", "Связь", "Выбор", "Память"];
export function Memory() {
  const { model, patch, next, dragging, paused } = useWorld();
  const [positions, setPositions] = useState([
      { x: 910, y: 330 },
      { x: 1180, y: 330 },
      { x: 910, y: 530 },
      { x: 1180, y: 530 },
    ]),
    [selected, setSelected] = useState<number | null>(null);
  const active = useRef<number | null>(null),
    last = useRef({ x: 0, y: 0 });
  const match = (i: number) => {
    if (!model.matched.includes(i)) patch({ matched: [...model.matched, i] });
    setPositions((ps) =>
      ps.map((p, j) => (i === j ? { x: 600, y: 320 + i * 82 } : p)),
    );
    setSelected(null);
  };
  const drag = useDrag(
    (p) => {
      if (active.current === null) return;
      last.current = p;
      setPositions((ps) => ps.map((q, j) => (j === active.current ? p : q)));
    },
    () => {
      if (active.current === null) return;
      const i = active.current;
      if (
        Math.hypot(last.current.x - 600, last.current.y - (320 + i * 82)) < 115
      )
        match(i);
      else
        setPositions((ps) =>
          ps.map((p, j) =>
            j === i ? { x: i % 2 ? 1180 : 910, y: i < 2 ? 330 : 530 } : p,
          ),
        );
      active.current = null;
    },
  );
  return (
    <>
      <Title
        kicker="05 / СЛОВО + ОБРАЗ"
        title={["Оставить след."]}
        subtitle="Когда форма поддерживает содержание."
      />
      {concepts.map((c, i) => (
        <g key={c} className="scene-object">
          <SvgButton
            x={300}
            y={320 + i * 82}
            label={`Связать понятие ${c} с выбранным образом`}
            onClick={() => {
              if (selected === i) match(i);
            }}
          >
            <text fontSize="30" y="10">
              {c}
            </text>
            <path
              d="M150 0H300"
              stroke={model.matched.includes(i) ? "#217B80" : "#A8B7BC"}
              strokeDasharray={model.matched.includes(i) ? undefined : "3 7"}
            />
            <circle
              cx="300"
              r="28"
              fill={model.matched.includes(i) ? "#8ED9C2" : "none"}
              stroke={selected === i ? "#F09573" : "#A8B7BC"}
            />
            {model.matched.includes(i) && (
              <text x="300" y="5" textAnchor="middle" fill="#217B80">
                ✓
              </text>
            )}
          </SvgButton>
        </g>
      ))}
      {positions.map((p, i) => {
        const matched = model.matched.includes(i);
        const pos = matched ? { x: 600, y: 320 + i * 82 } : p;
        return (
          <g className="scene-object" key={i}>
            {matched && (
              <path
                d={`M600 ${pos.y}Q790 445 1230 610`}
                fill="none"
                stroke="#217B80"
                opacity=".3"
              />
            )}
            <g
              {...drag}
              onPointerDown={(e) => {
                if (matched || paused) return;
                active.current = i;
                last.current = pos;
                drag.onPointerDown(e);
              }}
              transform={`translate(${pos.x} ${pos.y})`}
              role="button"
              tabIndex={0}
              aria-label={`Образ: ${concepts[i]}. Нажмите Enter для выбора, затем выберите понятие`}
              aria-pressed={selected === i}
              className={`draggable image-token ${selected === i ? "selected" : ""}`}
              onClick={() => {
                if (!matched && !dragging.current) setSelected(i);
              }}
              onKeyDown={(e) => {
                if (paused) return;
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  if (selected === i) match(i);
                  else setSelected(i);
                }
              }}
            >
              <rect
                x="-60"
                y="-56"
                width="120"
                height="112"
                rx="24"
                fill={matched ? "#8ED9C2" : i % 2 ? "#EEE9DD" : "#E4EEE7"}
                stroke={
                  selected === i ? "#F09573" : matched ? "#217B80" : "none"
                }
              />
              <g style={{ color: i === 2 ? "#BC6348" : "#217B80" }}>
                <Symbol kind={i} size={65} />
              </g>
            </g>
          </g>
        );
      })}
      {model.matched.length > 0 && (
        <SvgButton
          x={930}
          y={620}
          label="Провести по нити к следующей сцене"
          onClick={next}
        >
          <path
            d="M0 0H300l-12-8m12 8l-12 8"
            stroke="#217B80"
            fill="none"
            strokeWidth="2"
          />
          <rect x="-10" y="-20" width="330" height="40" fill="transparent" />
          <text y="38" className="micro">
            ПРОВЕДИ ПО НИТИ ИЛИ НАЖМИ →
          </text>
          <rect
            x="-10"
            y="-20"
            width="330"
            height="40"
            fill="transparent"
            onPointerDown={(e) => {
              if (!paused) {
                e.currentTarget.setPointerCapture(e.pointerId);
                dragging.current = true;
              }
            }}
            onPointerUp={(e) => {
              if (e.currentTarget.hasPointerCapture(e.pointerId)) {
                dragging.current = false;
                next();
              }
            }}
            onPointerCancel={() => {
              dragging.current = false;
            }}
          />
        </SvgButton>
      )}
      <Hint>
        {model.matched.length
          ? "Запоминание изображения не гарантирует понимания данных."
          : "Перетащи образ к понятию · или выбери образ и понятие клавишей Enter"}
      </Hint>
    </>
  );
}

export function Judgment() {
  const { model, patch, next, paused } = useWorld();
  const base = model.baseline;
  const [lens, setLens] = useState({ x: 1260, y: 485 }),
    [showLens, setShowLens] = useState(false);
  const start = useRef({ y: 0, base: 65 });
  const scaleDrag = useDrag(
    (p) =>
      patch({
        baseline: clamp(
          start.current.base - (p.y - start.current.y) / 3,
          0,
          65,
        ),
      }),
    undefined,
    (p) => {
      start.current = { y: p.y, base };
    },
  );
  const lensDrag = useDrag((p) => {
    setLens({ x: clamp(p.x, 120, 1320), y: clamp(p.y, 300, 620) });
    setShowLens(true);
  });
  const chart = (origin: number, b: number, right: boolean) => {
    const scale = d3.scaleLinear().domain([b, 80]).range([620, 350]);
    const ticks =
      right && b > 55
        ? [b, 70, 75, 80]
        : [b, ...[20, 40, 60, 80].filter((v) => v > b)];
    return (
      <g className="scene-object" key={origin}>
        <text x={origin + 170} y="310" textAnchor="middle" className="micro">
          {right ? "ИЗМЕНЯЕМАЯ ШКАЛА" : "ШКАЛА ОТ НУЛЯ"}
        </text>
        {ticks.map((t, i) => (
          <g key={i}>
            <path
              d={`M${origin} ${scale(t)}H${origin + 350}`}
              stroke="#A8B7BC"
              strokeWidth=".6"
              opacity=".6"
            />
            <text
              x={origin - 15}
              y={scale(t) + 5}
              textAnchor="end"
              className="tick"
            >
              {Math.round(t)}
            </text>
          </g>
        ))}
        <path
          d={`M${origin} 350V620H${origin + 350}`}
          fill="none"
          stroke="#172333"
        />
        {[68, 74].map((v, j) => (
          <g key={v}>
            <rect
              x={origin + 65 + j * 150}
              y={scale(v)}
              width="88"
              height={chartHeight(v, b)}
              rx="5"
              fill={right ? "#F09573" : "#217B80"}
            />
            <text
              x={origin + 109 + j * 150}
              y={scale(v) - 13}
              textAnchor="middle"
              fontSize="24"
            >
              {v}
            </text>
            <text
              x={origin + 109 + j * 150}
              y="650"
              textAnchor="middle"
              className="micro"
            >
              {j ? "B" : "A"}
            </text>
          </g>
        ))}
      </g>
    );
  };
  return (
    <>
      <Title
        kicker="06 / ВОСПРИЯТИЕ И СУЖДЕНИЕ"
        title={["Те же данные. Другой вывод?"]}
        subtitle="Посмотри, как точка отсчёта меняет впечатление."
      />
      {chart(250, 0, false)}
      {chart(870, base, true)}
      <g
        {...scaleDrag}
        role="slider"
        tabIndex={0}
        aria-label="Начало правой шкалы"
        aria-valuemin={0}
        aria-valuemax={65}
        aria-valuenow={Math.round(base)}
        onKeyDown={(e) => {
          if (paused) return;
          if (["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) {
            e.preventDefault();
            e.stopPropagation();
            patch({
              baseline:
                e.key === "Home"
                  ? 0
                  : e.key === "End"
                    ? 65
                    : clamp(base + (e.key === "ArrowDown" ? -5 : 5), 0, 65),
            });
          }
        }}
        className="draggable"
      >
        <circle cx="835" cy={620 + (65 - base) * 1.08} r="19" fill="#F09573" />
        <path
          d={`M829 ${616 + (65 - base) * 1.08}l6 8 6-8`}
          fill="none"
          stroke="#172333"
          strokeWidth="2"
        />
        <rect x="794" y="590" width="65" height="132" fill="transparent" />
      </g>
      {base > 0 ? (
        <>
          <text x="870" y="694" className="micro" fill="#B15A3D">
            ↓ ИЗМЕНИ ТОЧКУ ОТСЧЁТА ДО НУЛЯ
          </text>
          <SvgButton
            x={1220}
            y={688}
            label="Установить шкалу от нуля"
            onClick={() => patch({ baseline: 0 })}
          >
            <text className="link-small">К нулю ↘</text>
          </SvgButton>
        </>
      ) : (
        <SvgButton
          x={900}
          y={694}
          label="Перейти к сборке главной мысли"
          onClick={next}
        >
          <text className="link-small">
            Данные не изменились. Изменилось впечатление. →
          </text>
        </SvgButton>
      )}
      <g
        {...lensDrag}
        transform={`translate(${lens.x} ${lens.y})`}
        className="draggable lens"
        role="button"
        tabIndex={0}
        aria-label="Линза проверки данных"
        onClick={() => setShowLens((s) => !s)}
        onKeyDown={(e) => {
          if (e.key === "Enter") setShowLens((s) => !s);
        }}
      >
        <circle r="35" fill="#F7F4EC" fillOpacity=".65" stroke="#217B80" />
        <path d="M26 26l26 26" stroke="#217B80" strokeWidth="5" />
        <text textAnchor="middle" y="7" fontSize="25">
          ⌕
        </text>
      </g>
      {showLens && (
        <g
          transform={`translate(${clamp(lens.x - 170, 700, 1070)} 390)`}
          pointerEvents="none"
        >
          <rect width="285" height="95" rx="8" fill="#172333" />
          <text x="16" y="26" fill="#F7F4EC" className="body-small">
            <tspan x="16">Начало шкалы: {Math.round(base)}</tspan>
            <tspan x="16" dy="23">
              A = 68 · B = 74
            </tspan>
            <tspan x="16" dy="23">
              Источник: условные данные
            </tspan>
          </text>
        </g>
      )}
      <text x="86" y="693" className="muted-small">
        Условные данные · для сравнения длины столбцов обычно нужна шкала от
        нуля.
      </text>
    </>
  );
}

export function Synthesis() {
  const { model, patch, next, dragging, paused } = useWorld();
  const words = ["Внимание", "Понимание", "Память", "Суждение"];
  const coords = [
    { x: 290, y: 415 },
    { x: 620, y: 335 },
    { x: 865, y: 495 },
    { x: 1150, y: 390 },
  ];
  const active = useRef(false),
    connected = useRef(model.connected);
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);
  const add = (i: number) => {
    if (connected.current.includes(i)) return;
    connected.current = [...connected.current, i];
    patch({ connected: connected.current });
  };
  const drag = useDrag(
    (p) => {
      if (!active.current) return;
      setCursor(p);
      coords.forEach((c, i) => {
        if (Math.hypot(c.x - p.x, c.y - p.y) < 100) add(i);
      });
    },
    () => {
      active.current = false;
      setCursor(null);
      if (connected.current.length === 4) next();
    },
    (p) => {
      active.current = true;
      coords.forEach((c, i) => {
        if (Math.hypot(c.x - p.x, c.y - p.y) < 100) add(i);
      });
    },
  );
  const path = d3
    .line<{ x: number; y: number }>()
    .x((d) => d.x)
    .y((d) => d.y)
    .curve(d3.curveCatmullRom.alpha(0.5))(
    connected.current.map((i) => coords[i]).concat(cursor ? [cursor] : []),
  );
  return (
    <>
      <Title
        kicker="07 / ЧЕТЫРЕ ПРИНЦИПА. ОДНА ИСТОРИЯ."
        title={["Собрать главное."]}
        subtitle="От первого взгляда — к осознанному выводу."
      />
      <path
        d={
          d3
            .line<{ x: number; y: number }>()
            .x((d) => d.x)
            .y((d) => d.y)(coords)!
        }
        fill="none"
        stroke="#A8B7BC"
        strokeDasharray="3 10"
      />
      {path && (
        <path
          className="scene-object"
          d={path}
          fill="none"
          stroke="#217B80"
          strokeWidth="3"
        />
      )}
      <g {...drag} className="draggable">
        <rect x="150" y="280" width="1140" height="310" fill="transparent" />
        {coords.map((p, i) => (
          <g className="scene-object" key={i}>
            <SvgButton
              x={p.x}
              y={p.y}
              label={`Соединить: ${words[i]}`}
              onClick={() => {
                if (!dragging.current) {
                  add(i);
                  if (connected.current.length === 4) next();
                }
              }}
            >
              <circle
                r="83"
                fill={model.connected.includes(i) ? "#8ED9C2" : "#F7F4EC"}
                stroke={model.connected.includes(i) ? "#217B80" : "#A8B7BC"}
              />
              <text y="6" textAnchor="middle" fontSize="21">
                {words[i]}
              </text>
              <text y="35" textAnchor="middle" className="micro">
                0{i + 1}
              </text>
            </SvgButton>
          </g>
        ))}
      </g>
      <text x="86" y="616" className="body-small">
        Визуальный язык связывает то, что по отдельности кажется сложным.
      </text>
      <Hint>Проведи линию через четыре понятия · или нажми на каждое</Hint>
    </>
  );
}
