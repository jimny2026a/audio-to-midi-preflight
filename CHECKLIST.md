# Audio-to-MIDI review checklist

This is a workflow checklist, not evidence that a model will transcribe correctly.

## Before conversion

- Use a recording you are permitted to process. Keep a copy of the original.
- Start with a clear phrase from one instrument or one vocal line. The associated converter recommends this over a finished mix.
- Record the actual format, file size and duration. A filename extension alone does not prove a codec is supported.
- Check the tool's current file limits. On 2026-09-24, the associated site's home page declared 50,000,000 bytes and 180 seconds per file. These are application limits, not MIDI limits.
- Listen for silence, noise and distortion. The included PCM16 inspector can report digital silence and integer rail samples; it cannot determine musical clarity.
- Read the chosen tool's privacy policy. A local audio pipeline still downloads page/model assets. Do not assume zero network traffic or zero server logs.

## After conversion

- Import the MIDI into a DAW or notation editor and compare the same phrase against the recording.
- Check missing notes, extra notes, octave errors, note starts, note lengths and overlapping notes separately.
- Try the MIDI with a simple sound first. A different instrument sound does not by itself mean pitch detection failed.
- Keep the raw MIDI export before editing. Record manual corrections separately.
- Do not describe a single exported track as instrument separation, or detected notes as a reconstruction of the original audio.
- If no notes are detected, record that outcome. Do not replace it with invented notes or exclude it from a claimed evaluation.

## Reproducibility log template

```text
Date / tool URL / visible version:
Browser / operating system:
Input provenance and permission:
Input SHA-256 / format / codec if known / bytes / duration:
Visible settings:
Observed outcome or exact error:
Raw export SHA-256:
Manual review: missing / extra / octave / timing / duration issues:
Manual corrections:
Limitations of this observation:
```

Source for converter-specific scope: the associated site's home and About pages, read on 2026-09-24. The review procedure and log template are original recommendations, not measured effectiveness claims.
