import time
from flask import Flask, render_template, request
from UltraDict import UltraDict

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

@app.get('/studio')
def studio():
    return render_template('studio.html.jinja')

@app.get('/favicon.ico')
def favicon():
    return app.send_static_file('icons/favicon.ico')