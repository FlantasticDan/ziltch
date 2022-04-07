import time

from UltraDict import UltraDict
shared_data = UltraDict(name='ziltch')

def update_countdown(input_string: str):
    values = input_string.split(':')
    hours = 0
    minutes = 0
    seconds = 0
    try:
        seconds = int(values[-1])
        minutes = int(values[-2])
        hours = int(values[-3])
    except IndexError:
        pass
    future_point = hours * 60 * 60 + minutes * 60 + seconds
    return (time.time() + future_point) * 1000