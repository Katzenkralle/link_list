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




def content_for_db(data):
    lines = data.split('\n')
    db_data = []
    for line in lines:
        if line == '': continue
        #Check for Links
        link_text, link_path = check_link_sequence(line)


        if line[0] == '#':
            h_num = 0
            for char in line:
                if char == '#':
                    h_num +=1
                else:
                    break
            db_data.append({'type': 'h',
                            'text': line[h_num:],
                            'style': h_num})
        
        elif link_path:
            db_data.append({'type': 'li',
                            'text': link_text,
                            'path': link_path})

        else:
            db_data.append({'type': 'p',
                            'text': line})
    return db_data
            
