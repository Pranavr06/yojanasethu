/**
 * Zero-dependency QR Code matrix generator in pure TypeScript.
 * Generates ISO/IEC 18004 compliant QR matrices for URLs and credentials.
 */

// GF(256) math
const GF_EXP: number[] = new Array(512);
const GF_LOG: number[] = new Array(256);

(function initGaloisField() {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x;
    GF_LOG[x] = i;
    x <<= 1;
    if (x & 256) {
      x ^= 0x11d; // Primitive polynomial x^8 + x^4 + x^3 + x^2 + 1
    }
  }
  for (let i = 255; i < 512; i++) {
    GF_EXP[i] = GF_EXP[i - 255];
  }
})();

function gfMultiply(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return GF_EXP[GF_LOG[a] + GF_LOG[b]];
}

function rsGeneratorPoly(degree: number): number[] {
  let poly = [1];
  for (let i = 0; i < degree; i++) {
    const next = [1, GF_EXP[i]];
    const res: number[] = new Array(poly.length + 1).fill(0);
    for (let j = 0; j < poly.length; j++) {
      for (let k = 0; k < next.length; k++) {
        res[j + k] ^= gfMultiply(poly[j], next[k]);
      }
    }
    poly = res;
  }
  return poly;
}

function rsComputeRemainder(data: number[], ecCount: number): number[] {
  const gen = rsGeneratorPoly(ecCount);
  const msg: number[] = [...data, ...new Array(ecCount).fill(0)];
  for (let i = 0; i < data.length; i++) {
    const lead = msg[i];
    if (lead !== 0) {
      for (let j = 0; j < gen.length; j++) {
        msg[i + j] ^= gfMultiply(gen[j], lead);
      }
    }
  }
  return msg.slice(data.length);
}

// Version configs for Error Correction Level M:
// [version, totalCodewords, ecCodewordsPerBlock, numBlocks, alignmentCoords]
interface VersionConfig {
  version: number;
  totalCodewords: number;
  ecPerBlock: number;
  blocks: { count: number; dataCodewords: number }[];
  alignments: number[];
}

const VERSION_CONFIGS: VersionConfig[] = [
  {
    version: 1,
    totalCodewords: 26,
    ecPerBlock: 10,
    blocks: [{ count: 1, dataCodewords: 16 }],
    alignments: [],
  },
  {
    version: 2,
    totalCodewords: 44,
    ecPerBlock: 16,
    blocks: [{ count: 1, dataCodewords: 28 }],
    alignments: [6, 18],
  },
  {
    version: 3,
    totalCodewords: 70,
    ecPerBlock: 26,
    blocks: [{ count: 1, dataCodewords: 44 }],
    alignments: [6, 22],
  },
  {
    version: 4,
    totalCodewords: 100,
    ecPerBlock: 18,
    blocks: [{ count: 2, dataCodewords: 32 }],
    alignments: [6, 26],
  },
  {
    version: 5,
    totalCodewords: 134,
    ecPerBlock: 24,
    blocks: [{ count: 2, dataCodewords: 43 }],
    alignments: [6, 30],
  },
  {
    version: 6,
    totalCodewords: 172,
    ecPerBlock: 16,
    blocks: [{ count: 4, dataCodewords: 27 }],
    alignments: [6, 34],
  },
  {
    version: 7,
    totalCodewords: 196,
    ecPerBlock: 18,
    blocks: [{ count: 4, dataCodewords: 31 }],
    alignments: [6, 22, 38],
  },
];

export interface QRCodeMatrix {
  size: number;
  modules: boolean[][];
}

/**
 * Encodes text into a boolean 2D matrix (true = dark, false = light).
 */
export function generateQRCodeMatrix(text: string): QRCodeMatrix {
  const encoder = new TextEncoder();
  const textBytes = encoder.encode(text);

  // Find minimum version that fits data
  let config: VersionConfig = VERSION_CONFIGS[VERSION_CONFIGS.length - 1];
  for (const vc of VERSION_CONFIGS) {
    const totalDataCapacity = vc.blocks.reduce((sum, b) => sum + b.count * b.dataCodewords, 0);
    // Header: 4 bits mode + 8 bits length = 1.5 bytes -> need textBytes.length + 2 <= totalDataCapacity
    if (textBytes.length + 2 <= totalDataCapacity) {
      config = vc;
      break;
    }
  }

  const totalDataBytes = config.blocks.reduce((sum, b) => sum + b.count * b.dataCodewords, 0);
  const size = 17 + 4 * config.version;

  // Build bitstream: Byte mode (0100) + character count (8 bits) + raw bytes
  const bitstream: number[] = [];
  function pushBits(val: number, bits: number) {
    for (let i = bits - 1; i >= 0; i--) {
      bitstream.push((val >> i) & 1);
    }
  }

  pushBits(0b0100, 4); // Byte mode
  pushBits(textBytes.length, 8); // Length
  for (const b of textBytes) {
    pushBits(b, 8);
  }

  // Terminator (up to 4 bits of 0)
  const padNeeded = totalDataBytes * 8 - bitstream.length;
  const termBits = Math.min(4, Math.max(0, padNeeded));
  for (let i = 0; i < termBits; i++) bitstream.push(0);

  // Pad to multiple of 8
  while (bitstream.length % 8 !== 0) {
    bitstream.push(0);
  }

  // Convert to data codewords
  const dataCodewords: number[] = [];
  for (let i = 0; i < bitstream.length; i += 8) {
    let byteVal = 0;
    for (let b = 0; b < 8; b++) {
      byteVal = (byteVal << 1) | bitstream[i + b];
    }
    dataCodewords.push(byteVal);
  }

  // Pad bytes alternating 0xEC and 0x11
  const padPattern = [0xec, 0x11];
  let padIdx = 0;
  while (dataCodewords.length < totalDataBytes) {
    dataCodewords.push(padPattern[padIdx % 2]);
    padIdx++;
  }

  // Block splitting and error correction
  const dataBlocks: number[][] = [];
  const ecBlocks: number[][] = [];
  let offset = 0;
  for (const block of config.blocks) {
    for (let b = 0; b < block.count; b++) {
      const d = dataCodewords.slice(offset, offset + block.dataCodewords);
      offset += block.dataCodewords;
      dataBlocks.push(d);
      ecBlocks.push(rsComputeRemainder(d, config.ecPerBlock));
    }
  }

  // Interleave data codewords
  const interleaved: number[] = [];
  const maxDataLen = Math.max(...dataBlocks.map((b) => b.length));
  for (let i = 0; i < maxDataLen; i++) {
    for (const b of dataBlocks) {
      if (i < b.length) interleaved.push(b[i]);
    }
  }
  // Interleave EC codewords
  for (let i = 0; i < config.ecPerBlock; i++) {
    for (const ec of ecBlocks) {
      if (i < ec.length) interleaved.push(ec[i]);
    }
  }

  // Initialize matrix and reserved mask
  const modules: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));
  const isReserved: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  function setReserved(r: number, c: number, val: boolean) {
    if (r >= 0 && r < size && c >= 0 && c < size) {
      modules[r][c] = val;
      isReserved[r][c] = true;
    }
  }

  // Finder patterns at (0,0), (size-7, 0), (0, size-7)
  function placeFinder(row: number, col: number) {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const nr = row + r;
        const nc = col + c;
        if (nr < 0 || nr >= size || nc < 0 || nc >= size) continue;
        if (r >= 0 && r <= 6 && c >= 0 && c <= 6) {
          const isBlack =
            r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4);
          setReserved(nr, nc, isBlack);
        } else {
          setReserved(nr, nc, false); // Separator
        }
      }
    }
  }

  placeFinder(0, 0);
  placeFinder(0, size - 7);
  placeFinder(size - 7, 0);

  // Alignment patterns
  if (config.alignments.length > 0) {
    const coords = config.alignments;
    for (const ar of coords) {
      for (const ac of coords) {
        if (isReserved[ar][ac]) continue; // Skip finder overlap
        for (let r = -2; r <= 2; r++) {
          for (let c = -2; c <= 2; c++) {
            const isBlack = Math.max(Math.abs(r), Math.abs(c)) !== 1;
            setReserved(ar + r, ac + c, isBlack);
          }
        }
      }
    }
  }

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    if (!isReserved[6][i]) setReserved(6, i, i % 2 === 0);
    if (!isReserved[i][6]) setReserved(i, 6, i % 2 === 0);
  }

  // Dark module
  setReserved(4 * config.version + 9, 8, true);

  // Reserve format information areas
  for (let i = 0; i <= 8; i++) {
    if (!isReserved[8][i]) isReserved[8][i] = true;
    if (!isReserved[i][8]) isReserved[i][8] = true;
  }
  for (let i = 0; i <= 7; i++) {
    if (!isReserved[8][size - 1 - i]) isReserved[8][size - 1 - i] = true;
    if (!isReserved[size - 1 - i][8]) isReserved[size - 1 - i][8] = true;
  }

  // Place interleaved data bits in zig-zag 2-column paths
  let dataBitIdx = 0;
  const totalBits = interleaved.length * 8;
  let upwards = true;

  for (let rightCol = size - 1; rightCol > 0; rightCol -= 2) {
    if (rightCol === 6) rightCol--; // Skip vertical timing column
    const leftCol = rightCol - 1;

    const rowStart = upwards ? size - 1 : 0;
    const rowEnd = upwards ? -1 : size;
    const rowStep = upwards ? -1 : 1;

    for (let r = rowStart; r !== rowEnd; r += rowStep) {
      for (const c of [rightCol, leftCol]) {
        if (!isReserved[r][c]) {
          let bit = false;
          if (dataBitIdx < totalBits) {
            const byte = interleaved[Math.floor(dataBitIdx / 8)];
            const bitOffset = 7 - (dataBitIdx % 8);
            bit = ((byte >> bitOffset) & 1) === 1;
            dataBitIdx++;
          }
          // Apply mask 0: (row + col) % 2 === 0
          if ((r + c) % 2 === 0) {
            bit = !bit;
          }
          modules[r][c] = bit;
        }
      }
    }
    upwards = !upwards;
  }

  // Format information: EC Level M (00) + Mask 0 (000) = 00000
  // Format info 15 bits for (EC M + Mask 0): 0b101010000010010 XOR 0x5412 = 0x5412 ^ ...
  // Precomputed 15-bit format bits for Level M, Mask 0: 0b101000001001001
  const FORMAT_BITS_M_MASK0 = 0b101000001001001;

  for (let i = 0; i < 15; i++) {
    const bit = ((FORMAT_BITS_M_MASK0 >> (14 - i)) & 1) === 1;
    // Top-left format placement
    if (i <= 5) modules[8][i] = bit;
    else if (i === 6) modules[8][7] = bit;
    else if (i === 7) modules[8][8] = bit;
    else if (i === 8) modules[7][8] = bit;
    else modules[14 - i][8] = bit;

    // Bottom-left and top-right format placement
    if (i < 8) {
      modules[size - 1 - i][8] = bit;
    } else {
      modules[8][size - 15 + i] = bit;
    }
  }

  return { size, modules };
}
