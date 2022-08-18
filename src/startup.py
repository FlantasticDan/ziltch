from dotenv import load_dotenv
load_dotenv()

import os
import subprocess
import platform
# from multiprocessing import Manager

config_directory = os.getenv('CONFIG_DIRECTORY')

rtsp_command = os.getenv('RTSP_SIMPLE_SERVER_COMMAND')
rtsp_config = os.path.join(config_directory, 'rtsp-simple-server.yml')
with open(os.devnull, 'w') as fnull:
    rtsp_server = subprocess.Popen([rtsp_command, rtsp_config], stdout=fnull, stderr=fnull)

from main import app

host = os.getenv('HOST', '127.0.0.1')
port = os.getenv('PORT', 8890)
workers = os.getenv('WORKERS', 1)

if __name__ == '__main__':

    from UltraDict import UltraDict
    shared_data = UltraDict(name='ziltch', full_dump_size=10_000_000)
    shared_data['v'] = 0
    shared_data['cached_v'] = 0
    shared_data['ip'] = ''
    shared_data['cached_ip'] = ''
    shared_data['streamkey'] = 'live'
    shared_data['onair'] = False
    shared_data['mode'] = 'offline'
    shared_data['source'] = os.getenv('STREAM_ORIGIN') + 'live/stream.m3u8'
    shared_data['title'] = ''
    shared_data['countdown'] = 0
    shared_data['latency'] = 5

    import mediaserver
    mediaserver.start_onair_listener()
    mediaserver.start_stat_reset()

    if 'Windows' in platform.platform():
        from waitress import serve
        serve(app, host=host, port=port)
    else:
        from gunicorn.app.base import BaseApplication

        class App(BaseApplication):
            def __init__(self, app, options=None):
                self.options = options or {}
                self.application = app
                super().__init__()

            def load_config(self):
                config = {key: value for key, value in self.options.items()
                        if key in self.cfg.settings and value is not None}
                for key, value in config.items():
                    self.cfg.set(key.lower(), value)

            def load(self):
                return self.application
        
        options = {
            'bind': f'{host}:{port}',
            'workers': workers
        }
        App(app, options).run()