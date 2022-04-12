import httpx
from secrets import token_hex
from UltraDict import UltraDict

shared_data = UltraDict(name='ziltch')

SERVER_API_ENDPOINT = 'http://127.0.0.1:9997/'

stream_user = str(token_hex(2))
stream_pass = str(token_hex(4))
# stream_user = 'u1'
# stream_pass = 'p1'
stream_paylaod = {
    'publishUser': stream_user,
    'publishPass': stream_pass,
    'publishIPs': []
}
config_request = httpx.post(f'{SERVER_API_ENDPOINT}v1/config/paths/add/live', json=stream_paylaod)
if config_request.status_code == 400:
    httpx.post(f'{SERVER_API_ENDPOINT}v1/config/paths/edit/live', json=stream_paylaod)
streamkey = f'live?user={stream_user}&pass={stream_pass}'
shared_data['streamkey'] = streamkey

from multiprocessing import Process
import time

def update_stream_onair():
    while True:
        status = httpx.get(f'{SERVER_API_ENDPOINT}v1/paths/list')
        onair = status.json()['items']['live']['sourceReady']
        shared_data['onair'] = onair
        time.sleep(5)

def start_onair_listener():
    air_process = Process(target=update_stream_onair)
    air_process.start()

def reset_stats():
    while True:
        shared_data['cached_v'] = shared_data['v']
        shared_data['v'] = 0
        time.sleep(5)

def start_stat_reset():
    stat_process = Process(target=reset_stats)
    stat_process.start()