import json
import re
from typing import List, Dict, Union

def check_link_sequence(line: str) -> (str, str):
    #Check for Link in line (Md Syntax: [text](path)
    pattern = r"^.*\[(.*?)\]\((.*?)\).*"
    match = re.match(pattern, line)
    if match:
        path = match.group(2)
        text = match.group(1)
        return text, path
    else:
        #Check for Link in line (With http(s):// or www.)
        pattern = r"(www\.|https?://)([^\s]*)"
        match = re.search(pattern, line)
        if match:
            path = match.group(0)
            text = re.sub(r'\n|\r', '', line).strip(path)
            if re.match(r'^ *$', text):# Pattern to match ' ' zero or more times from the start (^) to the end ($)
                text = ''
            elif text[0] == ' ':
                text = text[1:]
                
            return text, path
        else:
            return '', ''

def check_lists(line: str) -> (str, Union[str, None]):
    #Check for lists (ul, ol)
    if line[:4] == '->. ':
        return (line[4:], 'ul',)
    elif line[:4] == '-x. ':
        return (line[4:], 'ol',)
    elif line[:2] == '- ':  # - simplefyed syntax for ul
        return (line[2:], 'ul',)
    elif line[:2] == 'x.':  # x. simplefyed syntax for ol
        return (line[2:], 'ol',)
    else:
        return (line, None,)

def count_headline(line: str) -> (str, int):
    #Count # at line start, return line without # and number of #
    h_num = 0
    for char in line:
        if char == '#':
            h_num +=1
        else:
            break
    return line[h_num:], h_num

def check_checkbox(line : str) -> (str, Union[bool, None]):
        #Check for checkboxes [ ] or [x] at line start and return line without checkbox and checkbox state
        if line[:4] == '[ ] ':
            return [line[4:], ['cb', False]]
        elif line[:4] == '[x] ':
            return [line[4:], ['cb', True]]
        else:
            return [line, None]

def content_for_db(data: str) -> List[Dict]:
    #Convert markdown to db data (list of dicts)

    #Split data in lines
    lines = data.split('\n')
    db_data = []
    for line in lines:
        if line == '': continue
        #Check for !x! at line start
        if line[:3] == '!x!':
            #If line starts with !x! ignore all styles and formats
            db_data.append({'type': 'p',
                            'text': line[3:],
                            'style': [['ig']]})
            continue

        #Check for Lists
        line, list_type = check_lists(line)
        #Check for Checkboxes
        line, checkbox = check_checkbox(line)
        #Check for Headline:
        line, h_num = count_headline(line)
        #Check for Links
        link_text, link_path = check_link_sequence(line)

        #What type?
        if link_path:
            #If line contains a link
            db_data.append({'type': 'li',
                            'text': link_text,
                            'path': link_path})
        elif line == '\r':
            #If line is empty
            db_data.append({'type':'br',
                            'text' : ""})
        elif line == '---\r' or line == '---':
            #If line is a horizontal line
            db_data .append({'type': 'sp',
                             'text': ""})
        else:
            #If line is a paragraph/everthing else
            db_data.append({'type': 'p',
                            'text': line})
            
        #What style?
        db_data[-1]['style'] = []
        if h_num != 0:
            #If line is a headline append headline number
            db_data[-1]['style'].append(['h', h_num])
        if checkbox:
            #If line is a checkbox append checkbox state
            db_data[-1]['style'].append(checkbox)
        if list_type == 'ul':
            #If line is a unordered list
            db_data[-1]['style'].append(['ul'])
        elif list_type == 'ol':
            #If line is a ordered list
            db_data[-1]['style'].append(['ol'])
        
    return db_data

