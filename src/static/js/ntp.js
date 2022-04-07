/*
Modern JS port of NTP.js (https://jehiah.cz/a/ntp-for-javascript) by Jehiah Czebotar (jehiah@gmail.com)
*/

class NTP {
    constructor() {
        this.samples = 4
        this.serverTimes = new Array,
        this.resync = 0.5 // minutes
        this.lastSync = 0
        this.difference = 0

        this.sync()
        setInterval(() => {this.sync()}, this.resync * 1050 * 60)
    }

    sync() {
        if (this.difference != 0 && this.lastSync != 0) {
            if (this.now() - this.lastSync > (this.resync * 60000)) {
                this.serverTimes = new Array
                this.getServerTime()
            }
            else {
                return
            }
        }

        this.serverTimes = new Array
        this.getServerTime()
    }

    now() {
        return new Date().getTime()
    }

    parseServerResponse(payload) {
        let delay = (this.now() - payload.original) / 2
        let offset = payload.offset - delay
        this.serverTimes.push(offset)

        if (this.serverTimes.length >= this.samples) {
            let average = 0
            let i = 0
            for (i=1; i < this.serverTimes.length; i++) {
                average += this.serverTimes[i]
            }

            this.difference = Math.round(average / (i - 1))
            this.lastSync = this.now()
        }
        else {
            this.getServerTime()
        }
    }

    getServerTime() {
        fetch(`${location.origin}/ntp?time=${this.now()}`,
            {
                method: 'GET',
                cache: 'no-cache'
            }
        ).then(response => {
            return response.json()
        }).then(payload => {
            this.parseServerResponse(payload)
        }).catch(e => {
            console.log(e)
        })
    }

    fixedTime(timestamp=0) {
        if (timestamp > 0) {
            return timestamp + this.difference
        }
        return this.now() + this.difference
    }
}

const ntp = new NTP()