module.exports = function(config) {
  config.set({
    commandRunner: { command: "ava" },
    coverageAnalysis: "all",
    mutate: ["package/src/index.js"],
    mutator: "javascript",
    packageManager: "npm",
    reporters: ['clear-text', 'dashboard', 'progress'],
  });
};
