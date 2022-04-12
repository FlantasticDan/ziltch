<!-- # ![ziltch_icon](https://user-images.githubusercontent.com/37907774/160733752-5fd858af-8a60-4b5c-b644-e04fd3b48e5a.png) ZILTCH -->
# ![ziltch_icon_tiny](https://user-images.githubusercontent.com/37907774/160733843-f603bedc-33cb-4b4d-a8d4-dc761a39bf88.png) ZILTCH
Like Twitch, if it supported multi-client stream synchronization, customizable latency, and self-hosting.


Built on top of the following fantastic projects:
- [aler9/rtsp-simple-server](https://github.com/aler9/rtsp-simple-server)
- [nimigeanu/syncronized-live-streaming](https://github.com/nimigeanu/syncronized-live-streaming)
- [video-dev/hls.js](https://github.com/video-dev/hls.js/)


## Setup

### Envioroment Variables

- **`RTSP_SIMPLE_SERVER_COMMAND`** - Fully qualified path to launch an RTSP-Simple-Server instance.
- **`CONFIG_DIRECTORY`** - Fully qualified path to a ZILTCH configuration folder, usually the default sample folder `\config`.
- **`ORGIN`** - Host address
- **`STREAM_ORIGIN`** - Host address/path the RTSP Simple Server instanced serves HLS requests at
- **`TRUST_TOKEN`** - Randomly generated url-safe string that is used to validate administrative actions, treat as a password.