const Player = {
    data() {
        return {
            title: '',
            countdown: 0,
            viewers: 0,
            mode: 'standby',
            player: new VideoPlayer(),
            muted: true,
            fullscreen: false,
            now: Date.now()
        }
    },
    created() {
        setInterval(() => {this.now = ntp.fixedTime()}, 1000)
    },
    template: `
        <div class="player-container">
            <div id="player" class="expand" v-show="!offline">
                <video id="vue-video" class="expand" muted="true" playsinline></video>
                <div class="ontop expand countdown text-shadow-20 vertical-center" v-show="standby">
                    {{countdownDisplay}}
                </div>
                <div class="ontop expand video-overlay">
                    <div class="header" >
                        <div class="title text-shadow-3 black">{{title}}</div>
                        <div class="viewers">{{viewers}} viewers</div>
                    </div>
                    <div></div>
                    <div class="controls">
                        <div></div>
                        <div>
                            <button class="control box-shadow-3" v-show="onair" @click="mute">
                                <img v-show="muted" src="/static/icons/mute.svg">
                                <img v-show="!muted" src="/static/icons/sound.svg">
                            </button>
                        </div>
                        <div>
                            <button class="control box-shadow-3" @click="fullscreener">
                                <img v-show="fullscreen" src="/static/icons/fullscreened.svg">
                                <img v-show="!fullscreen" src="/static/icons/fullscreen.svg">
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    mounted() {
        this.player.mount('vue-video')
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
    },
    methods: {
        mute() {
            this.muted = !this.muted
            this.video.muted = this.muted
        },
        fullscreener() {
            
            if (document.fullscreenElement == null) {
                document.querySelector('#player').requestFullscreen({
                    navigationUI: 'hide'
                })
                this.fullscreen = true
                
            }
            else {
                document.exitFullscreen()
                this.fullscreen = false
            }
            

        }
    }
}

const app = Vue.createApp(Player).mount('#app')

async function viewerUpdate() {
    let viewerData = await getFromServer('/viewer')
    app.title = viewerData['title']
    app.countdown = viewerData['countdown']
    app.viewers = viewerData['viewers']
    app.mode = viewerData['mode']

    app.player.delay = viewerData['latency']
    if (!app.offline && app.player.source == '' && viewerData['status'])
    {
        app.player.initMedia(viewerData['source'])
    }

    setTimeout(() => {viewerUpdate()}, 5000)
}

viewerUpdate()