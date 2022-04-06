const StudioPanel = {
    data() {
        return {
            mode: '',
            streamStatus: false,
            title: '',
            countdown: 0
        }
    },
    template: `
        <div class="studio-container">
            <div class="stream-status">
                <div class="label text-shadow-5"></div>
                <img v-show="streamStatus" src="/static/icons/live.svg" class="green">
                <img v-show="!streamStatus" src="/static/icons/offline.svg" class="red">
                <div v-show="streamStatus" class="status green">Connected</div>
                <div v-show="!streamStatus" class="status red">No Stream</div>
                <div class="label text-shadow-5"></div>
            </div>
            <div class="mode-selector">
                <div class="label text-shadow-5 black">Mode:</div>
                    <div class="modes">
                        <button @click="e => changeMode('offline')" :class="{selected: mode === 'offline'}" class="mode box-shadow-5">Offline</button>
                        <button @click="e => changeMode('standby')" :class="{selected: mode === 'standby'}" class="mode box-shadow-5">Standby</button>
                        <button @click="e => changeMode('onair')" :class="{selected: mode === 'onair'}" class="mode box-shadow-5">On Air</button>
                    </div>
            </div>

        </div>
    `,
    methods: {
        changeMode(newMode) {
            // TODO: Send to Server
            this.mode = newMode
        }
    }

}


const studio = Vue.createApp(StudioPanel).mount('#studio')

