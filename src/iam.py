import os
from functools import wraps

from flask import request

def validate_trust(token):
    return token == os.getenv('TRUST_TOKEN')

def enforce_trust(fn):
    @wraps(fn)
    def decorate(*args, **kwargs):
        if not validate_trust(request.cookies.get('ttoken')):
            return 'Untrusted Browser'
        return fn(*args, **kwargs)
    return decorate