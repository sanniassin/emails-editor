import babel from "rollup-plugin-babel";
import { terser } from "rollup-plugin-terser";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import replace from "rollup-plugin-replace";
import postcss from "rollup-plugin-postcss";

const input = "./src/index.js";

// Treat as externals all not relative and not absolute paths
// e.g. 'react' to prevent duplications in user bundle.
const isExternal = id =>
  !id.startsWith("\0") && !id.startsWith(".") && !id.startsWith("/");

const plugins = [
  postcss({
    extensions: [".css"],
    plugins: [require("autoprefixer"), require("postcss-flexbugs-fixes")]
  }),
  babel(),
  resolve(),
  commonjs()
];
const minifiedPlugins = [
  ...plugins,
  replace({
    "process.env.NODE_ENV": '"production"'
  }),
  terser({
    compress: { warnings: false }
  })
];

export default [
  {
    input,
    output: {
      file: "dist/emails-editor.js",
      format: "umd",
      name: "EmailsEditor"
    },
    plugins: [
      ...plugins,
      replace({
        "process.env.NODE_ENV": '"development"'
      })
    ]
  },

  {
    input,
    output: {
      file: "dist/emails-editor.min.js",
      format: "umd",
      name: "ReactInputMask"
    },
    plugins: minifiedPlugins
  },

  {
    input,
    output: { file: "lib/emails-editor.development.js", format: "cjs" },
    external: isExternal,
    plugins
  },

  {
    input,
    output: { file: "lib/emails-editor.production.min.js", format: "cjs" },
    external: isExternal,
    plugins: minifiedPlugins
  }
];
