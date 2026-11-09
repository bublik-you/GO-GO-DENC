import { defineConfig } from "@playwright/test";
const publishedURL = process.env.PRESENTATION_URL;
const localURL = "http://127.0.0.1:5173/";
export default defineConfig({
  testDir: "./tests",
  testMatch: "*.spec.ts",
  fullyParallel: false,
  workers: 1,
  timeout: 45000,
  use: {
    baseURL: publishedURL || localURL,
    launchOptions: {
      executablePath:
        process.env.CHROMIUM_PATH ||
        (process.env.PLAYWRIGHT_BUNDLED_BROWSER ? undefined : "/usr/bin/chromium"),
      args: ["--no-sandbox"],
    },
    viewport: { width: 1440, height: 900 },
  },
  webServer: publishedURL ? undefined : {
    command: process.env.E2E_BUILD
      ? "npm run preview -- --port 5173 --strictPort"
      : "npm run dev -- --port 5173 --strictPort",
    url: localURL,
    reuseExistingServer: !process.env.CI,
  },
  reporter: [["list"], ["html", { open: "never" }]],
});
