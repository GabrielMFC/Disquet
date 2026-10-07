import * as FileSystem from "expo-file-system/legacy";

const memory = new Map<string, string | null>();

function toFileUri(path: string) {
  if (path.startsWith("file://") || path.startsWith("content://")) return path;
  return `file://${path}`;
}

function u32(bytes: Uint8Array, offset: number) {
  return (
    bytes[offset] * 0x1000000 +
    bytes[offset + 1] * 0x10000 +
    bytes[offset + 2] * 0x100 +
    bytes[offset + 3]
  );
}

function typeAt(bytes: Uint8Array, offset: number) {
  return String.fromCharCode(
    bytes[offset],
    bytes[offset + 1],
    bytes[offset + 2],
    bytes[offset + 3]
  );
}

function base64ToBytes(value: string) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 8192) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
  }
  return btoa(binary);
}

async function readBytes(uri: string, position: number, length: number) {
  const encoded = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
    position,
    length,
  });
  return base64ToBytes(encoded);
}

function imageSlice(bytes: Uint8Array, start: number, end: number) {
  for (let i = start; i < end - 3; i++) {
    const jpeg = bytes[i] === 0xff && bytes[i + 1] === 0xd8 && bytes[i + 2] === 0xff;
    const png =
      bytes[i] === 0x89 &&
      bytes[i + 1] === 0x50 &&
      bytes[i + 2] === 0x4e &&
      bytes[i + 3] === 0x47;
    if (jpeg || png) return bytes.subarray(i, end);
  }
  return null;
}

function readDataPayload(bytes: Uint8Array, start: number, end: number) {
  let offset = start;
  while (offset + 8 <= end) {
    const size = u32(bytes, offset);
    if (size < 8 || offset + size > end) return null;
    if (typeAt(bytes, offset + 4) === "data") {
      return imageSlice(bytes, offset + 16, offset + size);
    }
    offset += size;
  }
  return null;
}

function findCovr(bytes: Uint8Array, start: number, end: number): Uint8Array | null {
  let offset = start;
  while (offset + 8 <= end) {
    const size = u32(bytes, offset);
    if (size < 8 || offset + size > end) return null;
    const type = typeAt(bytes, offset + 4);
    const childStart = offset + 8 + (type === "meta" ? 4 : 0);
    if (type === "covr") return readDataPayload(bytes, childStart, offset + size);
    if (type === "moov" || type === "udta" || type === "ilst" || type === "meta") {
      const found = findCovr(bytes, childStart, offset + size);
      if (found) return found;
    }
    offset += size;
  }
  return null;
}

async function extractM4aCover(uri: string, fileSize: number) {
  let offset = 0;
  while (offset + 8 <= fileSize) {
    const header = await readBytes(uri, offset, Math.min(16, fileSize - offset));
    if (header.length < 8) return null;
    let size = u32(header, 0);
    let headerSize = 8;
    if (size === 1 && header.length >= 16) {
      size = u32(header, 8) * 0x100000000 + u32(header, 12);
      headerSize = 16;
    }
    if (size < headerSize) return null;
    const type = typeAt(header, 4);
    if (type === "moov" && size <= 8_000_000) {
      return findCovr(await readBytes(uri, offset, size), headerSize, size);
    }
    if (size === 0) return null;
    offset += size;
  }
  return null;
}

function synchsafe(bytes: Uint8Array, offset: number) {
  return (
    (bytes[offset] & 0x7f) * 0x200000 +
    (bytes[offset + 1] & 0x7f) * 0x4000 +
    (bytes[offset + 2] & 0x7f) * 0x80 +
    (bytes[offset + 3] & 0x7f)
  );
}

async function extractId3Cover(uri: string) {
  const header = await readBytes(uri, 0, 10);
  if (
    header.length < 10 ||
    header[0] !== 0x49 ||
    header[1] !== 0x44 ||
    header[2] !== 0x33
  ) {
    return null;
  }
  const tagSize = synchsafe(header, 6);
  if (tagSize <= 0 || tagSize > 5_000_000) return null;
  const tag = await readBytes(uri, 10, tagSize);
  const version = header[3];
  let offset = 0;
  while (offset + 10 <= tag.length) {
    const id = typeAt(tag, offset);
    if (id === "\u0000\u0000\u0000\u0000") return null;
    const frameSize = version === 4 ? synchsafe(tag, offset + 4) : u32(tag, offset + 4);
    const frameStart = offset + 10;
    const frameEnd = frameStart + frameSize;
    if (frameSize <= 0 || frameEnd > tag.length) return null;
    if (id === "APIC") return imageSlice(tag, frameStart, frameEnd);
    offset = frameEnd;
  }
  return null;
}

function cacheName(path: string) {
  let hash = 0;
  for (let i = 0; i < path.length; i++) hash = (hash * 31 + path.charCodeAt(i)) | 0;
  return (hash >>> 0).toString(16);
}

async function writeCover(path: string, bytes: Uint8Array) {
  const dir = `${FileSystem.cacheDirectory}covers/`;
  if (!(await FileSystem.getInfoAsync(dir)).exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }
  const png = bytes[0] === 0x89;
  const destination = `${dir}${cacheName(path)}.${png ? "png" : "jpg"}`;
  if (!(await FileSystem.getInfoAsync(destination)).exists) {
    await FileSystem.writeAsStringAsync(destination, bytesToBase64(bytes), {
      encoding: FileSystem.EncodingType.Base64,
    });
  }
  return destination;
}

export async function extractCover(path: string) {
  if (memory.has(path)) return memory.get(path) ?? null;
  try {
    const uri = toFileUri(path);
    const info = await FileSystem.getInfoAsync(uri);
    if (!info.exists || !info.size) {
      memory.set(path, null);
      return null;
    }
    const header = await readBytes(uri, 0, 12);
    const bytes =
      typeAt(header, 4) === "ftyp"
        ? await extractM4aCover(uri, info.size)
        : await extractId3Cover(uri);
    const cover = bytes ? await writeCover(path, bytes) : null;
    memory.set(path, cover);
    return cover;
  } catch {
    memory.set(path, null);
    return null;
  }
}
