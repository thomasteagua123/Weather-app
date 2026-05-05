global.__DEV__ = true;

// Bloquea todos los getters lazy de expo/src/winter/installGlobal
// que intentan hacer require() fuera del scope de Jest
const globalsToMock = [
  '__ExpoImportMetaRegistry',
  'structuredClone',
  'TextDecoder',
  'TextDecoderStream',
  'TextEncoderStream',
  'URL',
  'URLSearchParams',
  'ReadableStream',
];

globalsToMock.forEach((name) => {
  if (!(name in global)) {
    Object.defineProperty(global, name, {
      get: () => undefined,
      set: () => {},
      configurable: true,
    });
  }
});

// structuredClone necesita ser una función válida
if (!global.structuredClone) {
  (global as any).structuredClone = (obj: any) => JSON.parse(JSON.stringify(obj));
}
