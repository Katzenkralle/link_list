import json
import re
from typing import List, Dict, Union

class ListTransformer:  
    def __init__(self, data: str):
        self.data = data
        self.line = ''

    def __check_link_sequence(self) -> (str, str):
        #Check for Link in line (Md Syntax: [text](path)
        pattern = r"^.*\[(.*?)\]\((.*?)\).*"
        match = re.match(pattern, self.line)
        if match:
            path = match.group(2)
            text = match.group(1)
            return text, path
        else:
            #Check for Link in line (With http(s):// or www.)
            pattern = r"(www\.|https?://)([^\s]*)"
            match = re.search(pattern, self.line)
            if match:
                path = match.group(0)
                text = re.sub(r'\n|\r|' + path, '', self.line)
                if re.match(r'^ *$', text):# Pattern to match ' ' zero or more times from the start (^) to the end ($)
                    text = ''
                elif text[0] == ' ':
                    text = text[1:]
                return text, path
            else:
                return '', ''

    def __check_lists(self) -> (str, Union[str, None]):
        #Check for lists (ul, ol)
        if self.line[:4] == '->. ':
            return (self.line[4:], 'ul',)
        elif self.line[:4] == '-x. ':
            return (self.line[4:], 'ol',)
        elif self.line[:2] == '- ':  # - simplefyed syntax for ul
            return (self.line[2:], 'ul',)
        elif self.line[:2] == 'x.':  # x. simplefyed syntax for ol
            return (self.line[2:], 'ol',)
        else:
            return (self.line, None,)

    def __count_headline(self,) -> (str, int):
        #Count # at line start, return line without # and number of #
        h_num = 0
        for char in self.line:
            if char == '#':
                h_num +=1
            else:
                break
        return self.line[h_num:], h_num

    def __check_checkbox(self) -> (str, Union[bool, None]):
            #Check for checkboxes [ ] or [x] at line start and return line without checkbox and checkbox state
            if self.line[:4] == '[ ] ':
                return [self.line[4:], ['cb', False]]
            elif self.line[:4] == '[x] ':
                return [self.line[4:], ['cb', True]]
            else:
                return [self.line, None]

        


    def content_for_db(self) -> List[Dict]:
        #Convert markdown to db data (list of dicts)

        #Split data in lines
        lines = self.data.split('\n')
        db_data = []

        for self.line in lines:
            if self.line == '': continue
            #Check for !x! at line start
            if self.line[:3] == '!x!':
                #If line starts with !x! ignore all styles and formats
                db_data.append({'type': 'p',
                                'text': self.line[3:],
                                'style': [['ig']]})
                continue

            #Check for Lists
            self.line, list_type = self.__check_lists()
            #Check for Checkboxes
            self.line, checkbox = self.__check_checkbox()
            #Check for Headline:
            self.line, h_num = self.__count_headline()
            #Check for Links
            link_text, link_path = self.__check_link_sequence()

            #What type?
            if link_path:
                #If line contains a link
                db_data.append({'type': 'li',
                                'text': link_text,
                                'path': link_path,
                                'embeded_locals': link_path.split('@')[1] if link_path.startswith('embedded') else ''})
            elif self.line == '\r':
                #If line is empty
                db_data.append({'type':'br',
                                'text' : ""})
            elif self.line == '---\r' or self.line == '---':
                #If line is a horizontal line
                db_data .append({'type': 'sp',
                                'text': ""})
            else:
                #If line is a paragraph/everthing else
                db_data.append({'type': 'p',
                                'text': self.line})
                
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

