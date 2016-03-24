### Compression server README


## Install

- npm install


## Other requirements
- Need to find and change important server urls. It's all 'localhost' right now

- install ffmpeg
- libmp3lame or libx264... not sure which yet

'brew install ffmpeg'

-this should do it

----------------------
SOcket.io to client

- I'll need to take responses from server2, send them back to server1.
- these responses correspoond to upload jobs.
I should store the socket id number with each job so that when the responses come back they know who to direct to downstream. This is not high priority at this time.

--------------
Collisions incoming

- There's a lot of stuff commented out in here. I'm still working on it.

- WHen pull request comes through I will expect conflicts:

  - Server/song db add. This is where secondary server request is included and triggered
  - Seconddary server will have trouble with new filenames. Get rid of .wav appending in audio processing. Files have this now by default.