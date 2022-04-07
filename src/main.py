import time
from flask import Flask, render_template, request
from UltraDict import UltraDict

import countdown

app = Flask(__name__)
shared_data = UltraDict(name='ziltch')

@app.get('/')
def index():
    return render_template('index.html.jinja')

@app.get('/ntp')
def ntp():
    server_time = time.time() * 1000
    client_time = int(request.args['time'])
    return {
        'original': client_time,
        'offset': server_time - client_time
    }

@app.get('/viewer')
def viewer_status():
    shared_data['v'] += 1
    return {
        'title': shared_data['title'],
        'latency': shared_data['latency'],
        'countdown': shared_data['countdown'],
        'viewers': shared_data['cached_v'],
        'status': shared_data['onair'],
        'mode': shared_data['mode'],
        'source': shared_data['source']
    }

@app.get('/studio')
def studio():
    return render_template('studio.html.jinja')

@app.post('/studio')
def update_metadata():
    payload = request.get_json()
    shared_data['title'] = payload['title']
    if payload['countdown'] != '':
        shared_data['countdown'] = countdown.update_countdown(payload['countdown'])
    shared_data['latency'] = float(payload['latency'])
    return {
        'title': shared_data['title'],
        'latency': shared_data['latency'],
        'countdown': shared_data['countdown'],
        'key': shared_data['streamkey'],
        'status': shared_data['onair'],
        'mode': shared_data['mode']
    }

@app.post('/studio/mode')
def update_studio_mode():
    payload = request.get_json()
    shared_data['mode'] = payload['mode']
    return {
        'title': shared_data['title'],
        'latency': shared_data['latency'],
        'countdown': shared_data['countdown'],
        'key': shared_data['streamkey'],
        'status': shared_data['onair'],
        'mode': shared_data['mode']
    }

@app.get('/studio/update')
def get_studio_metadata():
    return {
        'title': shared_data['title'],
        'latency': shared_data['latency'],
        'countdown': shared_data['countdown'],
        'key': shared_data['streamkey'],
        'status': shared_data['onair'],
        'mode': shared_data['mode']
    }

@app.post('/studio/key')
def get_stream_key():
    return shared_data['streamkey']


@app.get('/favicon.ico')
def favicon():
    return app.send_static_file('icons/favicon.ico')