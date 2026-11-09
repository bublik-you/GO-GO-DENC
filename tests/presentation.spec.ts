import { test, expect, Page } from "@playwright/test";
const scene = async (p: Page, n: number) => {
  await expect(p.locator(".stage")).toHaveAttribute(
    "aria-label",
    new RegExp(`Сцена ${n}\\.`),
  );
  await expect(p.locator(".transition-bridge")).toHaveCSS(
    "visibility",
    "hidden",
  );
};
const xy = async (p: Page, x: number, y: number) => {
  const b = await p.locator(".stage").boundingBox();
  return { x: b!.x + (x * b!.width) / 1440, y: b!.y + (y * b!.height) / 810 };
};
const drag = async (p: Page, a: number[], b: number[]) => {
  const from = await xy(p, ...(a as [number, number])),
    to = await xy(p, ...(b as [number, number]));
  await p.mouse.move(from.x, from.y);
  await p.mouse.down();
  await p.mouse.move(to.x, to.y, { steps: 18 });
  await p.mouse.up();
};
test("complete the visual story with real gestures, no dead ends or browser errors", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("./");
  await scene(page, 1);
  await page.screenshot({ path: "test-results/01-cover.png" });
  await drag(page, [1130, 560], [1040, 395]);
  await scene(page, 2);
  const old = await page.locator(".network>g").getAttribute("transform");
  const n = await xy(page, 740, 450);
  await page.mouse.move(n.x, n.y);
  await page.mouse.wheel(0, -300);
  await page.waitForTimeout(250);
  expect(
    await page.locator(".network>g").getAttribute("transform"),
  ).not.toEqual(old);
  await page.getByRole("button", { name: "Общий вид сети" }).click();
  await page.getByRole("button", { name: "Исследовать понимание" }).click();
  await scene(page, 3);
  await drag(page, [310, 500], [310, 430]);
  let vals = await page
    .getByRole("slider")
    .evaluateAll((es) =>
      es.map((e) => Number(e.getAttribute("aria-valuenow"))),
    );
  expect(vals[0]).toBeGreaterThan(35);
  expect(Math.abs(vals.reduce((a, b) => a + b, 0) - 100)).toBeLessThanOrEqual(
    1,
  );
  await page.screenshot({ path: "test-results/03-bars.png" });
  await drag(page, [910, 570], [910, 190]);
  await scene(page, 4);
  await drag(page, [370, 390], [370, 385]);
  await drag(page, [370, 385], [690, 510]);
  await drag(page, [690, 510], [1030, 395]);
  await expect(page.locator(".pixel-person")).toBeVisible();
  await page.waitForTimeout(950);
  const person = await page.locator(".pixel-person").boundingBox();
  expect(person!.x).toBeGreaterThan(300);
  expect(person!.y).toBeGreaterThan(200);
  await scene(page, 5);
  await drag(page, [910, 330], [600, 320]);
  await expect(
    page.getByRole("button", { name: "Провести по нити к следующей сцене" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Провести по нити к следующей сцене" })
    .click();
  await scene(page, 6);
  await drag(page, [835, 620], [835, 815]);
  await expect(
    page.getByRole("slider", { name: "Начало правой шкалы" }),
  ).toHaveAttribute("aria-valuenow", "0");
  await page.screenshot({ path: "test-results/06-scale.png" });
  await page
    .getByRole("button", { name: "Перейти к сборке главной мысли" })
    .click();
  await scene(page, 7);
  const first = await xy(page, 290, 415);
  await page.mouse.move(first.x, first.y);
  await page.mouse.down();
  for (const c of [
    [620, 335],
    [865, 495],
    [1150, 390],
  ]) {
    const p = await xy(page, c[0], c[1]);
    await page.mouse.move(p.x, p.y, { steps: 12 });
  }
  await page.mouse.up();
  await scene(page, 8);
  // Local erasure: sand must remain outside the brush path.
  const before = await page
    .locator(".sand-canvas")
    .first()
    .evaluate((c: HTMLCanvasElement) => [
      ...c.getContext("2d")!.getImageData(720, 400, 1, 1).data,
    ]);
  expect(before[3]).toBe(255);
  await drag(page, [720, 680], [720, 400]);
  const pixels = await page
    .locator(".sand-canvas")
    .first()
    .evaluate((c: HTMLCanvasElement) => {
      const x = c.getContext("2d")!;
      return [
        x.getImageData(720, 400, 1, 1).data[3],
        x.getImageData(300, 400, 1, 1).data[3],
      ];
    });
  expect(pixels[0]).toBe(0);
  expect(pixels[1]).toBe(255);
  for (let i = 0; i < 4; i++) {
    const b = page.getByRole("button", { name: "Смести следующую полосу" });
    if (await b.count()) {
      await b.click();
      await page.waitForTimeout(1200);
    }
  }
  await expect(
    page.getByRole("button", { name: "Повторить финал" }),
  ).toBeVisible();
  await expect(page.locator(".sand-canvas").first()).toHaveCSS("opacity", "0");
  await page.screenshot({ path: "test-results/08-finale.png" });
  await page.getByRole("button", { name: "Повторить финал" }).click();
  await expect(page.getByText("Открыто 0%")).toBeVisible();
  expect(errors).toEqual([]);
});
test("presenter navigation, reset, pause, keyboard alternatives, and repeated transitions", async ({
  page,
}) => {
  await page.goto("./");
  await page.getByRole("button", { name: "Перенести смысл в центр" }).focus();
  await page.keyboard.press("Enter");
  await scene(page, 2);
  for (let n = 3; n <= 8; n++) {
    await page.keyboard.press("ArrowRight");
    await scene(page, n);
  }
  for (let n = 7; n >= 1; n--) {
    await page.keyboard.press("ArrowLeft");
    await scene(page, n);
  }
  await page.getByRole("button", { name: "Режим выступающего" }).click();
  await page.getByRole("button", { name: "Пауза", exact: false }).click();
  await page.keyboard.press("ArrowRight");
  await scene(page, 1);
  await page
    .getByRole("button", { name: /Продолжить/ })
    .last()
    .click();
  await page.getByLabel("Открыть сцену").selectOption("2");
  await scene(page, 3);
  const slider = page.getByRole("slider", { name: "ТЕКСТ", exact: true });
  await slider.focus();
  await page.keyboard.press("ArrowUp");
  await expect(slider).toHaveAttribute("aria-valuenow", "37");
  await page.keyboard.press("KeyR");
  await expect(
    page.getByRole("slider", { name: "ТЕКСТ", exact: true }),
  ).toHaveAttribute("aria-valuenow", "35");
  await page.getByLabel("Открыть сцену").selectOption("5");
  await scene(page, 6);
  await page.getByRole("slider", { name: "Начало правой шкалы" }).focus();
  await page.keyboard.press("Home");
  await expect(page.getByRole("slider")).toHaveAttribute("aria-valuenow", "0");
  await page.keyboard.press("ArrowRight");
  await scene(page, 6);
});
test("Android-sized touch: pinch, real pointer capture, long-press broom and cancellation", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    hasTouch: true,
    isMobile: true,
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  await page.goto("./");
  const cdp = await context.newCDPSession(page);
  const touch = async (
    type: string,
    pts: { x: number; y: number; id: number }[],
  ) => cdp.send("Input.dispatchTouchEvent", { type, touchPoints: pts });
  const a = await xy(page, 1130, 560),
    b = await xy(page, 1040, 395);
  await touch("touchStart", [{ ...a, id: 1 }]);
  for (let i = 1; i <= 12; i++)
    await touch("touchMove", [
      {
        x: a.x + ((b.x - a.x) * i) / 12,
        y: a.y + ((b.y - a.y) * i) / 12,
        id: 1,
      },
    ]);
  await touch("touchEnd", []);
  await scene(page, 2);
  const left = await xy(page, 600, 430),
    right = await xy(page, 900, 430);
  await touch("touchStart", [
    { ...left, id: 1 },
    { ...right, id: 2 },
  ]);
  await touch("touchMove", [
    { x: left.x - 85, y: left.y, id: 1 },
    { x: right.x + 85, y: right.y, id: 2 },
  ]);
  await touch("touchEnd", []);
  expect(
    Number((await page.locator(".stage").textContent())!.match(/(\d+)%/)![1]),
  ).toBeGreaterThan(100);
  await page.getByRole("button", { name: "Режим выступающего" }).click();
  await page.getByLabel("Открыть сцену").selectOption("7");
  await scene(page, 8);
  await page.getByRole("button", { name: "Закрыть панель" }).click();
  const broom = await xy(page, 720, 680),
    p = await xy(page, 720, 400);
  await touch("touchStart", [{ ...broom, id: 1 }]);
  await page.waitForTimeout(500);
  await touch("touchMove", [{ ...p, id: 1 }]);
  await touch("touchEnd", []);
  await expect(page.getByText("Открыто 0%")).not.toBeVisible();
  await page.screenshot({ path: "test-results/tablet-sand.png" });
  await touch("touchStart", [{ ...p, id: 1 }]);
  await touch("touchCancel", []);
  await page.keyboard.press("ArrowLeft");
  await scene(page, 7);
  await context.close();
});
test("reduced motion, direct selection, portrait fit, docs and no external requests", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 800, height: 1280 });
  const external: string[] = [];
  page.on("request", (r) => {
    if (
      !r.url().startsWith(new URL(test.info().project.use.baseURL!).origin) &&
      !r.url().startsWith("ws:")
    )
      external.push(r.url());
  });
  await page.goto("./");
  await page.getByRole("button", { name: "Режим выступающего" }).click();
  await page.getByLabel("Открыть сцену").selectOption("4");
  await scene(page, 5);
  await page.getByRole("button", { name: "Закрыть панель" }).click();
  await page.getByRole("button", { name: /Образ: Рост/ }).focus();
  await page.keyboard.press("Enter");
  await page
    .getByRole("button", { name: "Связать понятие Рост с выбранным образом" })
    .focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("button", { name: "Провести по нити к следующей сцене" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Провести по нити к следующей сцене" })
    .click();
  await scene(page, 6);
  expect(external).toEqual([]);
  expect((await page.request.get("MONOLOG.md")).ok()).toBeTruthy();
  expect((await page.request.get("SOURCES.md")).ok()).toBeTruthy();
});

test("repeated input is guarded and stored values survive scene restoration", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("./");
  await page.getByRole("button", { name: "Режим выступающего" }).click();
  await page.getByLabel("Открыть сцену").selectOption("2");
  await scene(page, 3);
  await page.getByRole("button", { name: "Закрыть панель" }).click();
  const text = page.getByRole("slider", { name: "ТЕКСТ", exact: true });
  await text.focus();
  await page.keyboard.press("ArrowUp");
  await expect(text).toHaveAttribute("aria-valuenow", "37");
  const start = await xy(page, 310, 500);
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.evaluate(() => (document.activeElement as HTMLElement).blur());
  await page.keyboard.press("ArrowRight");
  await scene(page, 3);
  await page.mouse.move(-15, -15);
  await page.mouse.up();
  const committed = await text.getAttribute("aria-valuenow");
  await page.keyboard.press("ArrowRight");
  await scene(page, 4);
  await page.keyboard.press("ArrowLeft");
  await scene(page, 3);
  await expect(
    page.getByRole("slider", { name: "ТЕКСТ", exact: true }),
  ).toHaveAttribute("aria-valuenow", committed!);
  // Multiple inputs during one in-flight transition must never skip a scene.
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await scene(page, 4);
});
