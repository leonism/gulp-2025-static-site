export default {
  multipass: true,
  plugins: [
    // First use preset-default with only its native overrides
    {
      name: "preset-default",
      params: {
        overrides: {
          removeViewBox: false, // Keep viewBox attribute
          // Only include actual preset-default overrides here
        },
      },
    },
    // Then add additional plugins separately
    "cleanupIDs",
    "collapseGroups",
    "removeUselessDefs",
    "removeComments",
    "removeMetadata",
    "removeEditorsNSData",
    "removeEmptyAttrs",
    "convertPathData",
    "convertTransform",
    "mergePaths",
    // Additional optimization plugins
    "removeXMLProcInst",
    "removeOffCanvasPaths",
    "reusePaths",
  ],
};
