import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

/** Inspect uncompressed, little-endian, 16-bit PCM WAV. No networking or writes. */
export function inspectWav(bytes) {
  if (bytes.length < 12 || bytes.toString('ascii', 0, 4) !== 'RIFF' || bytes.toString('ascii', 8, 12) !== 'WAVE') throw Error('Expected a RIFF/WAVE file');
  const end = 8 + bytes.readUInt32LE(4);
  if (end !== bytes.length) throw Error('RIFF length does not match file length');
  let fmt, data;
  for (let p = 12; p < end;) {
    if (p + 8 > end) throw Error('Truncated chunk header');
    const type = bytes.toString('ascii', p, p + 4), size = bytes.readUInt32LE(p + 4);
    const start = p + 8, next = start + size + (size % 2);
    if (next > end) throw Error('Truncated chunk');
    if (type === 'fmt ') {
      if (fmt || size < 16) throw Error('Invalid or duplicate format chunk');
      fmt = { encoding: bytes.readUInt16LE(start), channels: bytes.readUInt16LE(start + 2), sampleRate: bytes.readUInt32LE(start + 4), byteRate: bytes.readUInt32LE(start + 8), blockAlign: bytes.readUInt16LE(start + 12), bits: bytes.readUInt16LE(start + 14) };
    }
    if (type === 'data') { if (data) throw Error('Multiple data chunks are unsupported'); data = bytes.subarray(start, start + size); }
    p = next;
  }
  if (!fmt || !data) throw Error('Missing format or data chunk');
  if (fmt.encoding !== 1 || fmt.bits !== 16) throw Error('Only integer PCM16 WAV is supported; compressed, float and extensible formats are unsupported');
  if (fmt.channels < 1 || fmt.sampleRate < 1 || fmt.blockAlign !== fmt.channels * 2 || fmt.byteRate !== fmt.sampleRate * fmt.blockAlign) throw Error('Inconsistent PCM format');
  if (data.length === 0 || data.length % fmt.blockAlign) throw Error('Empty or partial audio frames');
  let sum = 0, energy = 0, peak = 0, railSamples = 0;
  const samples = data.length / 2;
  for (let p = 0; p < data.length; p += 2) {
    const n = data.readInt16LE(p), x = n / 32768;
    sum += x; energy += x * x; peak = Math.max(peak, Math.abs(x));
    if (n === -32768 || n === 32767) railSamples++;
  }
  return {
    format: 'PCM16 WAV', fileBytes: bytes.length, channels: fmt.channels,
    sampleRateHz: fmt.sampleRate, frames: data.length / fmt.blockAlign,
    durationSeconds: data.length / fmt.byteRate, sampleCountAcrossChannels: samples,
    peakNormalized: peak, rmsNormalized: Math.sqrt(energy / samples),
    dcOffsetNormalized: sum / samples, railSamples,
    railSampleFraction: railSamples / samples, digitalSilence: peak === 0,
    caveat: 'Rail samples are not proof of audible clipping. These measurements do not predict transcription accuracy. Channels are aggregated.'
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    if (process.argv.length !== 3) throw Error('Usage: node wav-report.mjs recording.wav');
    console.log(JSON.stringify(inspectWav(readFileSync(process.argv[2])), null, 2));
  } catch (e) { console.error(e.message); process.exitCode = 1; }
}
