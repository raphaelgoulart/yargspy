# TODO

## General notes

- The leaderboard will allow two kinds of sorting:
  - score (score desc / notes hit desc / datetime asc);
    - the standard; rewards pathing.
  - notes hit (notes hit desc / datetime asc);
    - rewards FCs, first evers, etc.
- Each engine is its own leaderboard (so 3 leaderboards: Default, Casual, Precision);
- Every "grab all X from Y" command should have filter, sort and pagination support;
- Score submission will be done by the user simply uploading replay data, and all other data is extracted from there:
  - If the song the replay refers to doesn't exist in the database yet, we'll have to ask the user for the song.ini / notes as well;
  - If there's ever a version of YARG with leaderboard support, just have the game auto-upload these 3 files on run end (using JWT token for auth, which is already implemented).
- Files will be uploaded as files with their paths on the DB (as opposed to the binary data being stored on the DB directly)

## Backend

No problem taking inspiration from [ScoreSpy](https://clonehero.scorespy.online/leaderboards/95FD6F3E703C10437E882698004F3B01) to decide what data the models should have

- [x] Score model (essentially replay file metadata, don't need to be as thorough though since the user can just download the replay for more data);
  - [x] Create tool to verify and extract replay data using YARG.Core (based on [ReplayCli](https://github.com/YARC-Official/YARG.Core/tree/master/ReplayCli))
    - [ ] (maybe) If hosting on server, create cronjob to update the YARG.Core dlls if needed
- [ ] User model (more data?);
  - [x] Add method to select all scores for that user (order by datetime desc).
- [ ] User routes;
  - [ ] Edit user (only user itself and admin)
- [ ] (all endpoints) project/select only fields actually used by front-end to optimize data transfer
- [ ] finish [Server API Documentation](docs/serverapi.md)

## Frontend

- [ ] Individual player page
- [ ] Individual leaderboard page
- [ ] Login via modal if on PC
- [ ] Admin routes
- [ ] Privacy policy, ToS, etc.

## Long-term?

- [ ] Custom YARG build?
  - [ ] Add "leaderboard token" to YARG configuration + auto-submit score on run end?
  - [ ] More scorespy-esque features (ingame leaderboards (I really don't wanna do this))
