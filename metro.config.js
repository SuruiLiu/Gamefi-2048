// metro.config.js
export const transformer = {
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
};
export const resolver = {
  sourceExts: ['jsx', 'js', 'ts', 'tsx', 'json']
};