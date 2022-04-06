const Player = {
    data() {
        return {
            title: 'Placeholder Title',
            countdown: 0,
            viewers: 0,
            mode: 'standby',
            player: new VideoPlayer()
        }
    },
    template: `
        <div class="player-container">
            <div id="player" class="expand">
                <video id="vue-video" class="expand" muted="true" playsinline></video>
                <div class="ontop expand countdown text-shadow-20 vertical-center" v-show="standby">
                    00:00:00
                </div>
                <div class="ontop expand video-overlay">
                    <div class="header" >
                        <div class="title text-shadow-3 black">{{title}}</div>
                        <div class="viewers">{{viewers}} viewers</div>
                    </div>
                    <div></div>
                    <div class="controls"></div>
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
        }
    }
}

const app = Vue.createApp(Player).mount('#app')