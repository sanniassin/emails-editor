const OFF = 0;
const WARN = 1;
const ERROR = 2;

module.exports = {
  parser: "babel-eslint",
  parserOptions: {
    ecmaVersion: 2018
  },
  extends: ["airbnb", "prettier"],
  plugins: ["prettier"],
  env: {
    browser: true
  },
  rules: {
    "no-shadow": OFF,
    "global-require": OFF,
    "prettier/prettier": ERROR,
  }
};
