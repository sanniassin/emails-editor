module.exports = api => {
  const isTest = api.env("test");

  return {
    presets: [
      [
        "@babel/preset-env",
        { loose: true, targets: isTest ? "Chrome 76" : null }
      ]
    ],
    plugins: ["@babel/plugin-proposal-class-properties"]
  };
};
