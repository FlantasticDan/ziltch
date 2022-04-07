class VideoPlayer {
    constructor() {
        this.video = undefined
        this.delay = 5 //seconds
        this.source = ''

        // Calculated
        this.latency = 0
        this.speed = 0

        this.hls = new Hls({
            autoplay: true,
            autoStartLoad: true,
            liveDurationInfinity: true,
            liveSyncDuration: this.delay,
        })

        this.hls.on(Hls.Events.FRAG_CHANGED, (event, data) => {
            // console.log("FRAG_CHANGED ", data)
            // console.log("currentTime: " + video.currentTime)
            // console.log("programDateTime: " + data.frag.rawProgramDateTime)
            this.latency = this.calculateLiveDelay(data.frag.programDateTime)
        })
    }

    mount(videoElementId) {
        this.video = document.getElementById(videoElementId)
    }

    initMedia(streamSourceURL) {
        this.hls.loadSource(streamSourceURL)
        this.hls.attachMedia(this.video)
        this.video.play()
        this.source = streamSourceURL
    }

    calculateLiveDelay(playbackTimestamp) {
        let actualDelay = ntp.fixedTime() - playbackTimestamp
        let drift = (this.delay * 1000) - actualDelay
        this.speed = this.getPlaybackRate(drift)
        this.video.playbackRate = this.speed
        return actualDelay / 1000
    }

    getPlaybackRate(drift){
        let playbackRate;
        if (drift > 10000){
            playbackRate = 0.1;
        }
        else if (drift > 1000){
            playbackRate = 0.5;
        }
        else if (drift > 100){
            playbackRate = 0.9;
        }
        else if (drift > 50){
            playbackRate = 0.95;
        }
        else if (drift >= -50){
            playbackRate = 1.0;   
        }
        else if (drift >= -100){
            playbackRate = 1.05;      
        }
        else if (drift >= -1000){
            playbackRate = 1.1;      
        }
        else if (drift >= -10000){
            playbackRate = 2;
        }
        else {
            playbackRate = 10;
        }
        return playbackRate;
    }
}
