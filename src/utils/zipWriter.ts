/**
 * Minimal ZIP file writer — produces valid ZIP archives with
 * stored (uncompressed) entries. Supports directory prefixes
 * like "photos/" in file paths.
 *
 * ZIP format reference: https://pkware.cachefly.net/webdocs/casestudies/APPNOTE.TXT
 */

interface ZipEntry {
  path: string;
  data: Uint8Array;
}

// CRC-32 lookup table (polynomial 0xEDB88320)
const CRC_TABLE = (() => {
  const table: number[] = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? ((c >>> 1) ^ 0xEDB88320) : (c >>> 1);
    }
    table[i = i]; // intentional — we're building the table
    table[i] = c >>> 0;
  }
  return table;
})();

function crc32(data: Uint8Array): number {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < data.length; i++) {
    crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ data[i]) & 0xFF];
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

/**
 * Create a ZIP archive from an array of file entries.
 * Each entry has a `path` (may include directory prefixes like "photos/")
 * and `data` (raw file bytes).
 *
 * All files are stored uncompressed (method 0).
 * This is ideal for small archives where compression overhead
 * isn't worth the CPU cost.
 */
export async function createZip(files: ZipEntry[]): Promise<Blob> {
  console.log(`[zip] Creating archive with ${files.length} file(s)`);

  const localHeaders: Uint8Array[] = [];
  const centralHeaders: Uint8Array[] = [];
  let offset = 0;

  for (const file of files) {
    const pathBytes = new TextEncoder().encode(file.path);
    const checksum = crc32(file.data);
    const size = file.data.length;

    console.log(`[zip] Adding: ${file.path} (${size} bytes, CRC=${checksum.toString(16)})`);

    // ── Local file header (30 bytes + path + data) ──────────
    const local = new Uint8Array(30 + pathBytes.length + size);
    const lv = new DataView(local.buffer);

    lv.setUint32(0, 0x04034b50, true);   // Local file header signature
    lv.setUint16(4, 20, true);             // Version needed to extract (2.0)
    lv.setUint16(6, 0, true);              // General purpose bit flag
    lv.setUint16(8, 0, true);              // Compression method: stored
    lv.setUint16(10, 0, true);             // Last mod file time
    lv.setUint16(12, 0x0021, true);        // Last mod file date
    lv.setUint32(14, checksum, true);      // CRC-32
    lv.setUint32(18, size, true);          // Compressed size
    lv.setUint32(22, size, true);          // Uncompressed size
    lv.setUint16(26, pathBytes.length, true); // File name length
    lv.setUint16(28, 0, true);             // Extra field length
    local.set(pathBytes, 30);              // File name
    local.set(file.data, 30 + pathBytes.length); // File data

    localHeaders.push(local);

    // ── Central directory header (46 bytes + path) ───────────
    const central = new Uint8Array(46 + pathBytes.length);
    const cv = new DataView(central.buffer);

    cv.setUint32(0, 0x02014b50, true);    // Central directory signature
    cv.setUint16(4, 20, true);             // Version made by
    cv.setUint16(6, 20, true);             // Version needed to extract
    cv.setUint16(8, 0, true);              // General purpose bit flag
    cv.setUint16(10, 0, true);             // Compression method: stored
    cv.setUint16(12, 0, true);             // Last mod file time
    cv.setUint16(14, 0x0021, true);         // Last mod file date
    cv.setUint32(16, checksum, true);      // CRC-32
    cv.setUint32(20, size, true);          // Compressed size
    cv.setUint32(24, size, true);          // Uncompressed size
    cv.setUint16(28, pathBytes.length, true); // File name length
    cv.setUint16(30, 0, true);             // Extra field length
    cv.setUint16(32, 0, true);             // File comment length
    cv.setUint16(34, 0, true);             // Disk number start
    cv.setUint16(36, 0, true);             // Internal file attributes
    cv.setUint32(38, 0, true);             // External file attributes
    cv.setUint32(42, offset, true);        // Relative offset of local header
    central.set(pathBytes, 46);            // File name

    centralHeaders.push(central);
    offset += local.length;
  }

  // ── End of central directory record (22 bytes) ────────────
  const centralOffset = offset;
  let centralSize = 0;
  for (const ch of centralHeaders) centralSize += ch.length;

  const eocd = new Uint8Array(22);
  const ev = new DataView(eocd.buffer);

  ev.setUint32(0, 0x06054b50, true);     // EOCD signature
  ev.setUint16(4, 0, true);               // Number of this disk
  ev.setUint16(6, 0, true);               // Disk where central dir starts
  ev.setUint16(8, files.length, true);    // Entries on this disk
  ev.setUint16(10, files.length, true);    // Total entries
  ev.setUint32(12, centralSize, true);     // Central directory size
  ev.setUint32(16, centralOffset, true);   // Central directory offset
  ev.setUint16(20, 0, true);               // Comment length

  const totalSize = offset + centralSize + 22;
  console.log(`[zip] Archive complete: ${totalSize} bytes total, ${files.length} entries`);

  return new Blob(
    [...localHeaders, ...centralHeaders, eocd],
    { type: 'application/zip' }
  );
}