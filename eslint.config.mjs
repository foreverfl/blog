import next from "eslint-config-next";
import prettierConfig from "eslint-config-prettier";
import prettierPlugin from "eslint-plugin-prettier";

export default [
  ...next,
  prettierConfig,
  {
    plugins: { prettier: prettierPlugin },
    rules: {
      "prettier/prettier": ["error", { endOfLine: "lf" }],
    },
  },
];
