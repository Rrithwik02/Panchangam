// Lets node --experimental-strip-types load the app's TypeScript modules
// directly: resolves the "@/..." path alias and extensionless relative
// imports to .ts files, and stubs "server-only" (a Next.js build-time guard).
import { register } from "node:module";

const hooks = `
import { existsSync, statSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const root = ${JSON.stringify(process.cwd())};

function candidates(base) {
  return [base, base + ".ts", base + ".tsx", path.join(base, "index.ts")];
}

function toFile(base) {
  for (const file of candidates(base)) {
    if (existsSync(file) && statSync(file).isFile()) return pathToFileURL(file).href;
  }
  return null;
}

export async function resolve(specifier, context, next) {
  if (specifier === "server-only") return { url: "data:text/javascript,export {}", shortCircuit: true };
  if (specifier.startsWith("@/")) {
    const url = toFile(path.join(root, specifier.slice(2)));
    if (url) return { url, shortCircuit: true };
  }
  if ((specifier.startsWith("./") || specifier.startsWith("../")) && context.parentURL?.startsWith("file:")) {
    const parent = path.dirname(fileURLToPath(context.parentURL));
    const url = toFile(path.resolve(parent, specifier));
    if (url) return { url, shortCircuit: true };
  }
  return next(specifier, context);
}
`;

register(`data:text/javascript,${encodeURIComponent(hooks)}`, import.meta.url);
