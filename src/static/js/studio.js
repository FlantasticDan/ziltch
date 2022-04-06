const StudioPanel = {
    data() {
        return {
            mode: '',
            streamStatus: false,
            title: '',
            countdownInput: '',
            countdown: 0,
            latency: 5,
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
            <div>
                <form @submit.prevent="updateMetadata" class="side-form">
                    <label for="title" class="label text-shadow-5 black">Title:</label>
                    <input type="text" v-model="title" id="title" name="title" class="box-shadow-3 black">
                </form>
            </div>
            <div>
                <form @submit.prevent="updateMetadata" class="side-form latency">
                    <label for="latency" class="label text-shadow-5 black">Latency:</label>
                    <input type="text" v-model.number="latency" inputmode="numeric" id="latency" name="latency" class="box-shadow-3 black center">
                    <div class="latency-label">seconds</div>
                </form>
            </div>
            <div>
                <form @submit.prevent="updateMetadata" class="side-form countdown-input">
                    <label for="countdown" class="label text-shadow-5 black">Countdown:</label>
                    <input type="text" v-model="countdownInput" @input="timeSemicoloner" inputmode="numeric" id="countdown" name="countdown" class="box-shadow-3 black">
                    <div class="latency-label"></div>
                </form>
            </div>
            <div class="studio-buttons">
                <div></div>
                <button class="action box-shadow-5">Copy Stream Key</button>
                <button class="action box-shadow-5">Update Metadata</button>
            </div>

        </div>
    `,
    methods: {
        changeMode(newMode) {
            // TODO: Send to Server
            this.mode = newMode
        },
        updateMetadata() {
            // TODO: Send to Server
            console.log('metadata-updated')
        },
        timeSemicoloner() {
            let timeValue = this.countdownInput.slice()
            timeValue = timeValue.replaceAll(':', '')
            if (timeValue.length == 0)
            {
                this.countdownInput = ''
                return
            }
            timeValue = parseInt(timeValue).toString()
            if (timeValue.length > 2 && timeValue.length < 5)
            {
                let minutes = timeValue.slice(0, -2)
                let seconds = timeValue.slice(-2)
                this.countdownInput = `${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`
            }
            else
            {
                if (timeValue.length >= 5)
                {
                    let hours = timeValue.slice(0, -4)
                    let minutes = timeValue.slice(-4, -2)
                    let seconds = timeValue.slice(-2)
                    this.countdownInput = `${hours}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`
                }
                else {
                    this.countdownInput = timeValue
                }
            }
        }
    }

}


const studio = Vue.createApp(StudioPanel).mount('#studio')

