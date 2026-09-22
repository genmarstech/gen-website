// ESLint flat config.
//
// `npm run lint` used to call `next lint`, which — with no config file in the
// repo — dropped into an interactive "how would you like to configure ESLint?"
// prompt. On a laptop that is a mild annoyance. In CI it is a lint step that
// answers a question nobody is there to answer, and `next lint` is removed
// entirely in Next.js 16, so the script calls the ESLint CLI directly.
//
// ── THE FlatCompat BRIDGE IS GONE, AS THIS FILE SAID IT WOULD BE ────────────
//
// eslint-config-next 15 shipped only eslintrc-style configs while ESLint 9
// defaults to flat, so FlatCompat translated between them. Version 16 ships
// native flat configs, and running one back through the eslintrc bridge throws
// "Converting circular structure to JSON" from the schema validator — the
// plugin object now refers to itself, which eslintrc cannot serialise.
//
// So the configs are spread directly. Fewer moving parts and one fewer
// dependency in the lint path.
//
// ── TWO VERSIONS ARE HELD BACK HERE, AND NEITHER IS OUR CHOICE ──────────────
//
// Dependabot offers eslint 10 and typescript 7. Both are refused by this
// toolchain today, upstream, and taking either makes `npm run lint` throw
// rather than merely warn:
//
//   eslint 10      eslint-config-next bundles eslint-plugin-react, whose
//                  LATEST published release (7.37.5) peers at
//                  `^3 || … || ^9.7`. ESLint 10 removed context.getFilename(),
//                  which that plugin still calls, so every rule it owns dies
//                  with "contextOrFilename.getFilename is not a function".
//                  eslint-config-next's own peer range says `>=9.0.0`, which
//                  is optimistic about a dependency it pins itself.
//
//   typescript 7   typescript-eslint hard-throws on `versionMajor >= 7` —
//                  TS 7 is the native rewrite and no longer ships the JS
//                  compiler API it reads. Tracked upstream at
//                  github.com/typescript-eslint/typescript-eslint/issues/10940
//                  for TS >= 7.1.
//
// TypeScript 6.0.3 is therefore the ceiling: the last release with the JS API,
// and a real major taken rather than a version skipped. Revisit when
// eslint-plugin-react ships an ESLint 10 release and typescript-eslint closes
// 10940 — dependabot will keep offering both, and this comment is the answer
// to "why was that declined again".

import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

// Named rather than exported anonymously — next/core-web-vitals turns on
// import/no-anonymous-default-export, and a config file that warns about itself
// is a poor advertisement for the config.
const config = [
  {
    // Build output and generated files. Linting `out/` would mean linting the
    // minified bundle, which is slow and tells you nothing.
    ignores: [".next/**", "out/**", "node_modules/**", "next-env.d.ts"],
  },

  ...nextCoreWebVitals,
  ...nextTypescript,
];

export default config;
