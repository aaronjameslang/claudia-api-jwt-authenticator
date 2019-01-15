module.exports = function(config) {
  config.set({
    commandRunner: { command: "ava" },
    coverageAnalysis: "all",
    mutate: ["index.js"],
    mutator: "javascript",
    packageManager: "npm",
    reporters: ['clear-text', 'dashboard', 'progress'],
  });
};
