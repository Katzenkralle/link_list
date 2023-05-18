import json

def from_json(data):
    return json.loads(data)

def to_json(data):
    return json.dumps(data)