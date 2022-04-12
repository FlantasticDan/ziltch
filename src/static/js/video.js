const Player = {
    data() {
        return {
            title: '',
            countdown: 0,
            viewers: 0,
            mode: 'offline',
            player: new VideoPlayer(),
            muted: true,
            fullscreen: false,
            now: Date.now(),
            overlay: true,
            overlayTimeout: undefined,
            apple: false,
        }
    },
    created() {
        setInterval(() => {this.now = ntp.fixedTime()}, 100)
    },
    template: `
        <div class="player-container" :class="{'cursor-vanish': !smartOverlay}" v-if="!apple">
            <div id="player" class="expand" v-show="!offline">
                <video id="vue-video" class="expand" muted="true" playsinline></video>
                <div class="ontop expand countdown text-shadow-20 vertical-center" :class="{'cursor-vanish': !smartOverlay}" v-show="standby">
                    {{countdownDisplay}}
                </div>
                <div class="ontop expand video-overlay" :class="{hide: !smartOverlay}" @mouseover="OverlayEnter" @mousemove="OverlayEnter" @mouseleave="overlay=false" @click="OverlayEnter">
                    <div class="header" :class="{'cursor-vanish': !smartOverlay}">
                        <div class="title text-shadow-3 black">{{title}}</div>
                        <div class="viewers">{{viewers}} {{smartCounter}}</div>
                    </div>
                    <div :class="{'cursor-vanish': !smartOverlay}"></div>
                    <div class="controls" :class="{'cursor-vanish': !smartOverlay}">
                        <div></div>
                        <div>
                            <button class="control box-shadow-3" v-show="onair" @click="mute" :class="{'cursor-vanish': !smartOverlay}">
                                <img v-show="muted" src="/static/icons/mute.svg">
                                <img v-show="!muted" src="/static/icons/sound.svg">
                            </button>
                        </div>
                        <div>
                            <button class="control box-shadow-3" @click="fullscreener" :class="{'cursor-vanish': !smartOverlay}">
                                <img v-show="fullscreen" src="/static/icons/fullscreened.svg">
                                <img v-show="!fullscreen" src="/static/icons/fullscreen.svg">
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="offline expand" v-show="offline">
                <img class="white" src="/static/icons/offline.svg">
                <span>Offline</span>
            </div>
        </div>
        <div class="player-container apple" v-else>
            <img src="/static/icons/apple.svg">
            <div class="text-shadow-5 black">Unsupported Device</div>
            <p>
                This video player uses HTTP Live Streaming (HLS) to deliver content to your device, a technology standard which was developed by Apple in 2009.  
                Apple has chosen to prohibit web developers from leveraging HLS's full feature set on iOS devices, as such this player is disabled on your iPhone.
            </p>
        </div>
    `,
    mounted() {
        this.player.mount('vue-video')
        addEventListener('fullscreenchange', event => {
            this.fullscreen = ! (document.fullscreenElement == null)
        })
        this.overlayTimeout = setTimeout(() => {this.overlay = false}, 5000)
        this.apple = !Hls.isSupported()
    },
    computed: {
        standby() {
            return this.mode === 'standby'
        },
        offline() {
            return this.mode === 'offline'
        },
        onair() {
            return this.mode === 'onair'
        },
        countdownDisplay() {
            if (this.countdown <= 0) {
                return ''
            }

            let timeDifference = this.countdown - this.now
            if (timeDifference > 0) {
                let hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
                let minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60))
                let seconds = Math.floor((timeDifference % (1000 * 60)) / 1000)

                if (hours > 0) {
                    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
                }
                if (minutes > 0) {
                    return `${minutes}:${seconds.toString().padStart(2, '0')}`
                }
                return seconds.toString()
            }
            else {
                return ''
            }
        },
        smartOverlay() {
            if (this.onair) {
                return this.overlay
            }
            else {
                return true
            }
        },
        smartCounter() {
            if (this.standby) {
                return 'waiting'
            }
            else {
                if (this.viewers == 1) {
                    return 'viewer'
                }
                else {
                    return 'viewers'
                }
            }
        }
    },
    methods: {
        mute() {
            this.muted = !this.muted
            this.player.video.muted = this.muted
        },
        fullscreener() {
            
            if (document.fullscreenElement == null) {
                document.querySelector('#player').requestFullscreen({
                    navigationUI: 'hide'
                })
                
            }
            else {
                document.exitFullscreen()
            }
            

        },
        OverlayEnter() {
            try {
                clearTimeout(this.overlayTimeout)
            } catch (error) {
                
            }
            this.overlay = true
            this.overlayTimeout = setTimeout(() => {this.overlay = false}, 5000)
        },
        resetVideoPlayer() {
            this.player.hls.destroy()
            this.player = new VideoPlayer()
            this.player.mount('vue-video')
        }
    }
}

const app = Vue.createApp(Player).mount('#app')

async function viewerUpdate() {
    let viewerData = await getFromServer('/viewer')
    app.title = viewerData['title']
    if (app.title != '')
    {
        document.title = `${app.title} - Ziltch`
    }
    else
    {
        document.title = 'Ziltch'
    }

    app.countdown = viewerData['countdown']
    app.viewers = viewerData['viewers']
    if (viewerData['mode'].includes('@')) {
        target = parseInt(viewerData['mode'].split('@')[1]) - ntp.fixedTime()
        if (target > 0) {
            setTimeout(() => {app.mode = 'onair'}, target)
            // app.mode = ''
        }
        else {
            app.mode = 'onair'
        }
    }
    else {
        if (app.mode != 'offline' && viewerData['mode'] === 'offline')
        {
            app.resetVideoPlayer()
        }
        app.mode = viewerData['mode']
    }

    app.player.delay = viewerData['latency']

    if (app.player.source != '' && !viewerData['status']) {
        app.resetVideoPlayer()
    }

    if (!app.offline && app.player.source == '' && viewerData['status'])
    {
        app.player.initMedia(viewerData['source'])
    }

    if (app.mode == 'onair' && !viewerData['status']) {
        app.mode = 'offline'
    }

    setTimeout(() => {viewerUpdate()}, 5000)
}

viewerUpdate()