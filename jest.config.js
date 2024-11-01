module.exports = {
    reporters: [
      "default",
      ["jest-html-reporters", {
        pageTitle: "Test Report",
        outputPath: "reports/test-report.html",
        includeFailureMsg: true,
        includeConsoleLog: true,
      }]
    ],
  };
