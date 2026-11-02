# Adding Better SFX to a video edit

Use WAV files (`get <id...> --format wav`). Files are trimmed close to their onset. Preview the chosen sound against its cue: swells and whooshes build toward their loudest moment.

## Placement

- **Whoosh on a cut.** Start it so its loudest moment lands on the first frame of the new shot. For a whoosh, that is roughly a third of its duration before the cut.
- **Click or key press in a screen recording.** Place it on the frame where the cursor or key makes contact.
- **Pop or sparkle on a title.** Place it on the frame the text or element first appears.
- **Levels.** Keep effects 6 to 12 dB under the voice-over, and 3 to 6 dB under music without a voice. Repeated clicks and typing sit at the low end.

## Editing apps

For Premiere Pro, DaVinci Resolve, Final Cut Pro or CapCut, put the WAVs in the project's assets folder and give the user a cue list: timestamp, sound file and suggested level. If the project is a code-driven video (HyperFrames, Remotion or similar), add the files the way the project already adds audio.

## ffmpeg

To mix effects into an existing video at known times, delay each effect to its timestamp in milliseconds and mix it with the original audio. `normalize=0` keeps the original level.

```bash
ffmpeg -i input.mp4 -i sounds/swoosh-fast.wav -i sounds/mouse-click.wav -filter_complex \
  "[1]adelay=1200:all=1,volume=0.5[s1]; \
   [2]adelay=3400:all=1,volume=0.4[s2]; \
   [0:a][s1][s2]amix=inputs=3:normalize=0:duration=first[a]" \
  -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k output.mp4
```

If the video has no audio track, add a silent one first: put `-f lavfi -t <video length> -i anullsrc=r=48000:cl=stereo` after the other inputs and use that input in place of `[0:a]`.

## Done when

Every cue is placed at its moment, levels sit under the voice or music, and the user has either the rendered file or a cue list for their editor.
