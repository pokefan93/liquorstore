Current live site archive:
`/Users/taylor/dev/tts site/taylorstechsolutions-archive-pre-rebuild`

Compressed backup:
`/Users/taylor/dev/tts site/taylorstechsolutions-archive-pre-rebuild.tar.gz`

How to retrieve the archived site without deleting the new one:
1. Copy the archive into a different folder:
   `cp -R "/Users/taylor/dev/tts site/taylorstechsolutions-archive-pre-rebuild" "/Users/taylor/dev/tts site/taylorstechsolutions-old-copy"`
2. Work on or preview that copied version separately from the new live site.
3. If you want to unpack the frozen backup instead, run:
   `tar -xzf "/Users/taylor/dev/tts site/taylorstechsolutions-archive-pre-rebuild.tar.gz" -C "/Users/taylor/dev/tts site"`
4. If you ever want the archived version live again, deploy the copied or unpacked version from a separate repo, branch, or hosting target instead of overwriting this one.
