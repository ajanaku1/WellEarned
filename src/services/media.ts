import * as FileSystem from 'expo-file-system/legacy';

export const uriToBase64 = async (uri: string) => {
  const b64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return b64;
};

export const toGenerativePart = (base64: string, mimeType: string) => ({
  inlineData: {
    data: base64,
    mimeType,
  },
});
