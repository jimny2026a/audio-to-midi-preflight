# Audio-to-MIDI Preflight

A dependency-free PCM WAV inspection tool and a practical transcription checklist. Use them to document a recording before note detection and compare the resulting MIDI against the source. This is not a transcription model or an accuracy benchmark.

## Inspect a recording

Requires Node.js 20 or later. No installation, account or network connection is needed.

```sh
node wav-report.mjs recording.wav
node --test test/*.test.mjs
```

The inspector reads integer, little-endian PCM16 RIFF/WAVE files. It rejects compressed WAV, floating-point WAV, WAVE_FORMAT_EXTENSIBLE, multiple data chunks, inconsistent headers and truncated files. It does not decode MP3, resample audio or change the input. Large files are loaded into memory.

The JSON report includes channel count, sample rate, duration, peak, RMS, DC offset, digital silence and samples at the integer rails. Stereo statistics aggregate channels and do not measure stereo cancellation. Rail samples are a diagnostic observation, not proof of audible clipping. No quality score or expected transcription accuracy is inferred.

### Formulas and provenance

All report inputs come from the file header or PCM samples, not an external dataset. For each signed sample `n`, normalized amplitude is `x = n / 32768`. Duration is `dataBytes / (sampleRate * channels * 2)`. RMS is `sqrt(sum(x*x)/N)`. DC offset is `sum(x)/N`. Peak is `max(abs(x))`. Rail fraction is `count(n == -32768 or n == 32767)/N`. `N` counts samples across all channels. These definitions are implemented in `wav-report.mjs`; tests use generated buffers with known inputs rather than real-world accuracy claims.

## Reusable reference material

- [Transcription checklist](CHECKLIST.md): input preparation, manual review and a reproducibility log.
- [Site-declared formats](formats.csv): machine-readable format list, provenance and explicit codec caveats. This is a transcription of the site's published support statement, not a compatibility benchmark.
- [Sources and limitations](SOURCES.md).

For a browser-based conversion workflow associated with this checklist, see [mp3tomidiflow](https://mp3tomidiflow.com/).

## Contributing

Bug reports should include a reproducible synthetic sample, expected result and actual result. Do not attach private recordings or audio you lack permission to share. Format extensions should add malformed-input tests and document unsupported cases. No unrelated promotional links, ranking claims or invented benchmark results.

## License

Code and original documentation: MIT. Descriptions of third-party tools are attributed in SOURCES.md. This project is independent of Spotify and does not bundle Basic Pitch or its model weights.
