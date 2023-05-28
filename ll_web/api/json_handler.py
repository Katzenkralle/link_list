import json
import re

def from_json(data):
    return json.loads(data)

def to_json(data):
    return json.dumps(data)

def check_link_sequence(string):
    #Check for Markdown Link sequence
    pattern = r"^.*\[(.*?)\]\((.*?)\).*"
    match = re.match(pattern, string)
    if match:
        path = match.group(2)
        text = match.group(1)
        return text, path
    else:
        #Check for Link after pattern
        pattern = r"(www\.|https?://)([^\s]*)"
        match = re.search(pattern, string)
        if match:
            path = match.group(0)
            return '', path
        else:
            return '', ''


def count_headline(line):
    h_num = 0
    for char in line:
        if char == '#':
            h_num +=1
        else:
            break
    return h_num

def content_for_db(data):
    lines = data.split('\n')
    db_data = []
    for line in lines:
        if line == '': continue
        #Check for Links
        link_text, link_path = check_link_sequence(line)
        #Check for Headline:
        h_num = count_headline(line)

        #What Type?
        if link_path:
            db_data.append({'type': 'li',
                            'text': link_text,
                            'path': link_path})
        elif line == '\r':
            db_data.append({'type':'br',
                            'text' : ""})
        else:
            db_data.append({'type': 'p',
                            'text': line})
            
        #What Style?
        db_data[-1]['style'] = []
        if h_num != 0:
        #elif line[0] == '#':
            db_data[-1]['text'] = db_data[-1]['text'][h_num:]
            db_data[-1]['style'].append(['h', h_num])

    return db_data
            
