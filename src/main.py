import time
from flask import Flask, render_template, request, make_response
from UltraDict import UltraDict

import countdown
from iam import enforce_trust, validate_trust

VERSION = 'v0.0.0 (040922)'

app = Flask(__name__)
shared_data = UltraDict(name='ziltch')

@app.get('/')
def index():
    trusted = validate_trust(request.cookies.get('ttoken'))
    return render_template('index.html.jinja', version=VERSION, trusted=trusted)

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
@enforce_trust
def studio():
    return render_template('studio.html.jinja', version=VERSION)

@app.post('/studio')
@enforce_trust
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
@enforce_trust
def update_studio_mode():
    payload = request.get_json()
    if payload['mode'] == 'onair':
        live_time = (time.time() + 6) * 1000
        shared_data['mode'] = f'onair@{live_time}'
    else:
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
@enforce_trust
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
@enforce_trust
def get_stream_key():
    return shared_data['streamkey']

@app.get('/trust/<token>')
def store_trust_token(token):
    r = make_response('Trust Token Updated')
    r.set_cookie('ttoken', token, 60 * 60 * 24 * 365, httponly=True)
    return r

@app.get('/trust')
@enforce_trust
def test_trust():
    return 'Trusted'

@app.get('/favicon.ico')
def favicon():
    return app.send_static_file('icons/favicon.ico')