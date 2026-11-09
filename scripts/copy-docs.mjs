import { mkdir, copyFile } from "node:fs/promises";
await mkdir(new URL("../public/", import.meta.url), { recursive: true });
for (const name of ["MONOLOG.md", "SOURCES.md"])
  await copyFile(
    new URL(`../${name}`, import.meta.url),
    new URL(`../public/${name}`, import.meta.url),
  );
