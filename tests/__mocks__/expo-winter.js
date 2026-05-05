module.exports = {
  installGlobal: () => {},
  installFormDataPatch: () => {},
  ImportMetaRegistry: class {},
  default: {},
  URLSearchParams: typeof URLSearchParams !== 'undefined' ? URLSearchParams : class {},
  URL: typeof URL !== 'undefined' ? URL : class {},
  TextDecoder: typeof TextDecoder !== 'undefined' ? TextDecoder : class {},
};
