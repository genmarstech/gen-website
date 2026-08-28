// ESLint flat config.
//
// `npm run lint` used to call `next lint`, which — with no config file in the
// repo — dropped into an interactive "how would you like to configure ESLint?"
// prompt. On a laptop that is a mild annoyance. In CI it is a lint step that
// answers a question nobody is there to answer, and `next lint` is removed
// entirely in Next.js 16, so the script now calls the ESLint CLI directly.
//
// eslint-config-next 15 still ships only eslintrc-style configs, and ESLint 9
// defaults to flat config. FlatCompat is the bridge; it is what create-next-app
// generates for this exact combination. It goes away when eslint-config-next
// ships a native flat config.

import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
});

// Named rather than exported anonymously — next/core-web-vitals turns on
// import/no-anonymous-default-export, and a config file that warns about itself
// is a poor advertisement for the config.
const config = [
  {
    // Build output and generated files. Linting `out/` would mean linting the
    // minified bundle, which is slow and tells you nothing.
    ignores: [
      ".next/**",
      "out/**",
      "node_modules/**",
      "next-env.d.ts",
    ],
  },

  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default config;
