

function styleHeadline(line, level, mode){
    //Takes (mabye already formated) line, level=1-6, mode=view/edit
    if (mode == 'view'){
        //Encapsulate line in html headline of given level
        var htmlElement = `<h${level} class='viewUserContentH'>${line}</h${level}>`
        return htmlElement
    }
    else {
        //Add # in front of line according to level
        var line = "#".repeat(level) + line
        return line
    }
}

function styleList(line, previousLine, nextLine, type, mode){
    // Takes current, previous and next line, type=ul/ol, mode=view/edit
    
    if (mode == 'view'){
        // If previous line is not of the same type as current line, add <ul> or <ol> to line
        // Set current line to <li> and if next line is not of the same type as current line, add </ul> or </ol> to line
        var htmlElement = ''
        if (previousLine == undefined || !previousLine.style.some(arr => arr.includes(type))){ //If it dosnt include
            htmlElement = `<${type}>`
        }
        htmlElement += `<li class="viewUserContentUlOlElem">${line}</li>`
        if (nextLine == undefined || !nextLine.style.some(arr => arr.includes(type))){ //If it dosnt include
            htmlElement += `</${type}>`
        }

        return htmlElement
    }
    else{
        //Add ->. or -x. in front of line according to type
        if (type == 'ul'){
            var line = '->. ' + line}
        else{
            var line = '-x. ' + line
        }
        return line
    }
}

function styleCheckbox(line, state, id, mode){
    // Takes current line, state=true/false, id=html id (needet for interactivElementCahngeHandeling), mode=view/edit
    if (mode == 'view'){
        //Encapsulate line in html checkbox element in given state
        var htmlElement
        htmlElement = `<input type="checkbox" ${state ? 'checked' : ''} id="${id}" class="viewUserContentCb" onChange="interactivElementChangeHandler('checkbox', '${id}')">${line}</input>`;
        return htmlElement
    }
    else {
        //Add [x] or [ ] in front of line according to state
        return `[${state == true ? 'x' : ' '}] ${line}`
    }
}

function formatParagraph(line, mode){
    //Takes current line, mode=view/edit
    if (mode == 'view'){
        //Set text to html paragraph element
        var htmlElement = `<p class='viewUserContentP'>${line['text']}</p>`
        return htmlElement
    }
    else {
        //Set text to text 
        return line['text'] + "\n"
    }
}

function formatSeparator(mode){
    //Takes mode=view/edit
    if (mode == 'view'){
        //Returns html hr element
        var htmlElement = `<hr class='viewUserContentHr' />`
        return htmlElement
    }
    else{
        //Returns ---
        return '---' + "\n"
    }
}

function formatBreakeRow(mode){
    //Takes mode=view/edit
    if (mode == 'view'){
        //Returns html br element
        return "<br/>"
    }
    else {
        //returns new line
        return "\n"
    }
}

function formatLink(line, mode, list_id){
    // Takes line (which is a link) might contain text and path, mode=view/edit
    
    //If no alt. text is given, set text to path
    if (line['text'] == ''){
        line['text'] = line['path']
    }

    if (mode == 'view'){
        //Encapsulate line in html a element, add http:// if path dosnt start with http(/s) for absolute path
        var htmlElement
        if (line['path'].startsWith("embedded")){
            let localUrlInfo = line['path'].split(/[:-@]/).filter(part => part != '')
            htmlElement = `<a href="${window.location.origin}/linkListApi/mediaContent/?id=${localUrlInfo[2]}&reason=${list_id}"
            class="viewUserContentContainer">
            <img  
            src="${window.location.origin}/linkListApi/mediaContent/?id=${localUrlInfo[2]}&reason=${list_id}&thubmanil=True" 
            class="viewUserContentImg" 
            alt="${localUrlInfo[1]}"/>
            </a>`
        } else {
        const absoluteURL = line.path.startsWith('http') ? line.path : `http://${line.path}`;
        htmlElement = `<a href="${absoluteURL}" class='viewUserContentLi'>${line.text}</a>`;
        
        }
        return htmlElement
    }
    else {
        //Set text to [text](path)
        let line_text = line['text'] == line['path'] ? "[]" : `[${line['text']}]`
        line = line_text + `(${line['path']})` + "\n"
        return line
    }
}


export function allLinks(raw_content, list_id){
    //Takes all lines from list, returns all links in an array
    var links = []
    var content = JSON.parse(raw_content)
    content.forEach(element => {
        if (element['type'] == 'li'){
            if (element['path'].startsWith("embedded")){
                let localUrlInfo = element['path'].split(/[:-@]/).filter(part => part != '')
                links.push(`${window.location.origin}/linkListApi/mediaContent/?id=${localUrlInfo[2]}&reason=${list_id}`)
            } else {
            links.push(element['path'])
        }
        }
    })
    return links
}

function renderByLine(raw_content, mode, list_id){
    //Take raw_content (JSON) and mode=view/edit/links, returns formated content (HTML or Md-like syntax)
    //with all interactiveElements or array of links
    if (raw_content == undefined || raw_content == '' || raw_content == '[]'){
        return ['', []]
    }
    var content = JSON.parse(raw_content)
    var formatedContent = ''
    var interactiveElements = []


    content.forEach((element, index) => {
        //For each element in content, format it and add it to formatedContent, count index
        //Start by formating the elements type, then add styles to it

        var formatedLine
        switch (element['type']){
            case 'p':
                //console.log('p', mode)
                formatedLine = formatParagraph(element, mode);
                break;
            case 'li':
                //console.log('li', mode)
                formatedLine = formatLink(element, mode, list_id);
                break;
            case "br":
                formatedLine = formatBreakeRow(mode);
                break;
            case "sp":
                formatedLine = formatSeparator(mode);
                break;
        }

        element['style'].forEach(style => {
            //switch case not possible because of multiple styles can be applied to one element
            if (style[0] == 'h'){
                    formatedLine = styleHeadline(formatedLine, style[1], mode);}
            if (style[0] == 'cb'){
                var htmlId = `interactiveElement${index}`
                formatedLine = styleCheckbox(formatedLine, style[1], htmlId, mode)
                interactiveElements.push({'id': index,
                                        'state': style[1]})
                }
            if (style[0] == 'ul'){
                formatedLine = styleList(formatedLine, content[(index-1)], content[(index+1)], 'ul', mode)
            }
            if (style[0] == 'ol'){
                formatedLine = styleList(formatedLine, content[(index-1)], content[(index+1)], 'ol', mode)
            }
            if (style[0] == 'ig'){
                if (mode != 'view'){formatedLine = '!x!' + formatedLine}
            }
            
        });
        formatedContent += formatedLine;
    });
    return [formatedContent, interactiveElements]
}

export default renderByLine
