# TODO

## General notes

- The leaderboard will allow two kinds of sorting:
  - score (score desc / notes hit desc / datetime asc);
    - the standard; rewards pathing.
  - notes hit (notes hit desc / datetime asc);
    - rewards FCs, first evers, etc.
- Each engine is its own leaderboard (so 3 leaderboards: Default, Casual, Precision);
- Score submission will be done by the user simply uploading replay data, and all other data is extracted from there:
  - If the song the replay refers to doesn't exist in the database yet, we'll have to ask the user for the song.ini / notes as well;
  - If there's ever a version of YARG with leaderboard support, just have the game auto-upload these 3 files on run end (using JWT token for auth, which is already implemented).
- Files will be uploaded as files with their paths on the DB (as opposed to the binary data being stored on the DB directly)

## Backend

- [ ] AWS related TODOs for deployment
- [x] Score model (essentially replay file metadata, don't need to be as thorough though since the user can just download the replay for more data);
  - [x] Create tool to verify and extract replay data using YARG.Core (based on [ReplayCli](https://github.com/YARC-Official/YARG.Core/tree/master/ReplayCli))
    - [ ] (maybe) If hosting on server, create cronjob to update the YARG.Core dlls if needed
- [ ] (all endpoints) project/select only fields actually used by front-end to optimize data transfer
- [ ] finish [Server API Documentation](docs/serverapi.md)
- [ ] CI/CD
- [ ] Figure out how `songs_updates` affect replay files and how to handle that

## Frontend

- [ ] Admin routes
  - [ ] logs
  - [ ] delete score
  - [ ] add song
  - [ ] delete song
  - [ ] update song
- [ ] Login via modal if on PC
