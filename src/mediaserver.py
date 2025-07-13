import httpx
from secrets import token_hex
from UltraDict import UltraDict

shared_data = UltraDict(name='ziltch')

SERVER_API_ENDPOINT = 'http://127.0.0.1:9997/'

stream_user = str(token_hex(2))
stream_pass = str(token_hex(4))

streamkey = f'live?user={stream_user}&pass={stream_pass}'
shared_data['streamkey'] = streamkey

from multiprocessing import Process
import time

def update_stream_onair():
    while True:
        try:
            updated = False
            status = httpx.get(f'{SERVER_API_ENDPOINT}v3/paths/list')
            for item in status.json()['items']:
                if item['name'] == "live":
                    onair = item['ready']
                    shared_data['onair'] = onair
                    updated = True
            if not updated:
                shared_data['onair'] = False
        except Exception as e:
            shared_data['onair'] = False
        time.sleep(5)

def start_onair_listener():
    air_process = Process(target=update_stream_onair)
    air_process.start()

def reset_stats():
    while True:
        shared_data['cached_v'] = shared_data['v']
        shared_data['v'] = 0
        shared_data['cached_ip'] = shared_data['ip']
        shared_data['ip'] = ''
        time.sleep(5)

def start_stat_reset():
    stat_process = Process(target=reset_stats)
    stat_process.start()