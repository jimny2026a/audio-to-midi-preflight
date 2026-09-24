import test from 'node:test';
import assert from 'node:assert/strict';
import { inspectWav } from '../wav-report.mjs';
function wav(values, channels=1, rate=8000) {
  const b=Buffer.alloc(44+values.length*2);
  b.write('RIFF');b.writeUInt32LE(b.length-8,4);b.write('WAVEfmt ',8);b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(channels,22);b.writeUInt32LE(rate,24);b.writeUInt32LE(rate*channels*2,28);b.writeUInt16LE(channels*2,32);b.writeUInt16LE(16,34);b.write('data',36);b.writeUInt32LE(values.length*2,40);values.forEach((n,i)=>b.writeInt16LE(n,44+i*2));return b;
}
test('known digital silence and duration',()=>{const r=inspectWav(wav(Array(8000).fill(0)));assert.equal(r.durationSeconds,1);assert.equal(r.digitalSilence,true);assert.equal(r.rmsNormalized,0);});
test('known amplitudes and rail counts',()=>{const r=inspectWav(wav([-32768,0,32767]));assert.equal(r.peakNormalized,1);assert.equal(r.railSamples,2);assert.equal(r.railSampleFraction,2/3);assert.equal(r.rmsNormalized,Math.sqrt((1+(32767/32768)**2)/3));});
test('stereo duration counts frames, not individual samples',()=>{const r=inspectWav(wav([0,0,16384,-16384],2));assert.equal(r.frames,2);assert.equal(r.durationSeconds,2/8000);assert.equal(r.dcOffsetNormalized,0);});
test('reject malformed, truncated and unsupported audio',()=>{assert.throws(()=>inspectWav(Buffer.from('not wav')));const b=wav([0]);assert.throws(()=>inspectWav(b.subarray(0,b.length-1)));b.writeUInt16LE(3,20);assert.throws(()=>inspectWav(b),/PCM16/);});
test('reject inconsistent byte rate and partial frames',()=>{const b=wav([0]);b.writeUInt32LE(1,28);assert.throws(()=>inspectWav(b),/Inconsistent/);assert.throws(()=>inspectWav(wav([0],2)),/partial/);});
test('skip unknown padded chunks',()=>{const b=wav([0]);const extra=Buffer.from([74,85,78,75,1,0,0,0,7,0]);const out=Buffer.concat([b.subarray(0,12),extra,b.subarray(12)]);out.writeUInt32LE(out.length-8,4);assert.equal(inspectWav(out).digitalSilence,true);});
