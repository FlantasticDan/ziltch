const ntp = new NTP()
const video = document.getElementById('video')


let programDateTime = 0
let bufferLengthHistory = [];
const targetDelay = 5  // seconds
const optimalDelay = targetDelay * 1000 // milliseconds

let hls = new Hls({
    autoplay: true,
    autoStartLoad: true,
    liveDurationInfinity: true,
    liveSyncDuration: targetDelay,
})

hls.loadSource(location.protocol + '//' + location.hostname + ':8888/live/stream.m3u8')
hls.attachMedia(video)
hls.on(Hls.Events.MANIFEST_PARSED, function() {
    video.play()
});


hls.on(Hls.Events.FRAG_CHANGED, (event, data) => {
    // console.log("FRAG_CHANGED ", data)
    // console.log("currentTime: " + video.currentTime)
    // console.log("programDateTime: " + data.frag.rawProgramDateTime)
    document.getElementById("info").innerHTML = calculateLiveDelay(data.frag.programDateTime) + ` (${ntp.difference / 1000})`;
})

function calculateLiveDelay(playbackTimestamp) {
    let delay = ntp.fixedTime() - playbackTimestamp
    let drift = optimalDelay - delay
    video.playbackRate = getPlaybackRate(drift)
    return delay / 1000
}

function getPlaybackRate(drift){
    var playbackRate;
    if (drift > 10000){
        playbackRate = 0.1;
    }
    else if (drift > 1000){
        playbackRate = 0.5;
    }
    else if (drift > 100){
        playbackRate = 0.9;
    }
    else if (drift >= -100){
        playbackRate = 1.0;   
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