# YARGReplayValidator

C# tool to validate replay files, and output relevant metadata for leaderboard applications

## Modes

- `ReplayOnly`: Outputs replay-related metadata only (useful for songs already in the leaderboard, whose data is already known);
- `ReplayAndMidi`: Outputs both replay AND chart metadata (useful for songs being added to the leaderboard for the first time);
- `MidiOnly`: Outputs chart metadta (useful for addition of songs to the database outside of replay submission);
- `ReturnSongHash`: Returns the song checksum for the replay file (useful to check if a given song is already on the database or not).

## TODO

- [x] Make it use arguments instead of hardcoded variables;
- [ ] If validation fails, fetch and output differences for each replay frame;
- [ ] Test with a multitude of instrument, .ini settings and engine combinations.