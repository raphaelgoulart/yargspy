## yargsubmodulechecker.py

This is a Python script which uses the GitHub API to check the YARG.Core commit used in the main branch of YARG.

Should the replay validation tool support both stable/nightly and have an auto-update script, this will be used to fetch the correct YARG.Core commit to update the stable version of the .dll. (The nightly version can be updated by simply fetching the latest commit of the YARG.Core repository)

As of right now, it will read the GitHub API token off of `github_token.txt`, and will export the YARG.Core commit in a `stable.txt` file.