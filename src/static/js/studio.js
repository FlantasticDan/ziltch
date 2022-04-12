const StudioPanel = {
    data() {
        return {
            mode: '',
            streamStatus: false,
            title: '',
            countdownInput: '',
            countdown: 0,
            latency: 5,
            streamKey: '',
            now: Date.now()
        }
    },
    created() {
        setInterval(() => {this.now = ntp.fixedTime()}, 100)
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
                <form @submit.prevent="updateMetadata" class="side-form" autocomplete="off">
                    <label for="title" class="label text-shadow-5 black">Title:</label>
                    <input type="text" v-model="title" id="title" name="title" class="box-shadow-3 black">
                </form>
            </div>
            <div>
                <form @submit.prevent="updateMetadata" class="side-form latency" autocomplete="off">
                    <label for="latency" class="label text-shadow-5 black">Latency:</label>
                    <input type="text" v-model.number="latency" inputmode="numeric" id="latency" name="latency" class="box-shadow-3 black center">
                    <div class="latency-label">seconds</div>
                </form>
            </div>
            <div>
                <form @submit.prevent="updateMetadata" class="side-form countdown-input" autocomplete="off">
                    <label for="countdown" class="label text-shadow-5 black">Countdown:</label>
                    <input type="text" v-model="countdownInput" @input="timeSemicoloner" inputmode="numeric" id="countdown" name="countdown" class="box-shadow-3 black">
                    <div class="latency-label">{{countdownDisplay}}</div>
                </form>
            </div>
            <div class="studio-buttons">
                <div></div>
                <button class="action box-shadow-5" @click="copyStreamKey">Copy Stream Key</button>
                <button class="action box-shadow-5" @click="updateMetadata">Update Metadata</button>
            </div>

        </div>
    `,
    methods: {
        copyStreamKey() {
            navigator.clipboard.writeText(this.streamKey)
        },
        async changeMode(newMode) {
            let payload = {
                mode: newMode
            }
            let metadataUpdate = await postToServer(payload, '/studio/mode')
            updateStudio(metadataUpdate)
            // this.mode = newMode
        },
        async updateMetadata() {
            let payload = {
                countdown: this.countdownInput,
                title: this.title,
                latency: this.latency
            }
            let metadata = await postToServer(payload, location.pathname)
            updateStudio(metadata)
            this.countdownInput = ''
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
    },
    computed: {
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
        }
    }

}


const studio = Vue.createApp(StudioPanel).mount('#studio')

function updateStudio(payload) {
    if (document.activeElement.id != 'title')
    {
        studio.title = payload['title']
    }

    if (document.activeElement.id != 'latency')
    {
        studio.latency = payload['latency']
    }

    // if (document.activeElement.id != 'countdown')
    // {
        studio.countdown = payload['countdown']
    // }
    
    studio.streamKey = payload['key']
    studio.streamStatus = payload['status']
    if (payload['mode'].includes('@')) {
        target = parseInt(payload['mode'].split('@')[1]) - ntp.fixedTime()
        if (target > 0) {
            setTimeout(() => {studio.mode = 'onair'}, target)
            studio.mode = ''
        }
        else {
            studio.mode = 'onair'
        }
    }
    else {
        studio.mode = payload['mode']
    }
}

async function studioUpdate() {
    let studioMetadata = await getFromServer('/studio/update')
    // console.log(studioMetadata)
    updateStudio(studioMetadata)
    setTimeout(() => {studioUpdate()}, 5000)
}
studioUpdate()