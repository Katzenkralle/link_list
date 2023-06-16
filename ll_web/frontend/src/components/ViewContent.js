function styleHeadline(line, level, mode){
    //Takes line=Preformatet line e.g. <p></p>; level=Headline level e.g.3, mode=view/edit
    //console.log(line, level, mode)
    if (mode == 'view'){
        var htmlElement = `<h${level} class='viewUserContentH'>${line}</h${level}>`
        //console.log("H:", htmlElement)
        //Returns <hx>Preformated<hx> html element
        return htmlElement
    }
    else {
        var line = "#".repeat(level) + line
        //Returns given lin with level*# added at the start (Md-syntax)
        return line
    }
}

function styleList(line, previousLine, nextLine,type, mode){
    var htmlElement = ''
    if (mode == 'view'){
        if (previousLine == undefined || !previousLine.style.some(arr => arr.includes(type))){ //If it dosnt include
            htmlElement = `<${type}>`
        }
        htmlElement += `<li>${line}</li>`
        if (nextLine == undefined || !nextLine.style.some(arr => arr.includes(type))){ //If it dosnt include
            htmlElement += `</${type}>`
        }

        return htmlElement
    }
    else{
        if (type == 'ul'){
            var line = '->. ' + line}
        else{
            var line = '-x. ' + line
        }
        return line
    }
}

function formatParagraph(paragraph, mode){
    //Takes paragraph=current element in itteration; mode=view/edit
    if (mode == 'view'){
        var htmlElement = `<p class='viewUserContentP'>${paragraph['text']}</p>`
        //console.log("P:", htmlElement)
        //Returns HTML element with thext of paragraph element
        return htmlElement
    }
    else {
        //returns text of paragraph element and new line (Md-syntax)
        return paragraph['text'] + "\n"
    }
}

function formatSeparator(mode){
    if (mode == 'view'){
        var htmlElement = `<hr/>`
        return htmlElement
    }
    else{
        return '---' + "\n"
    }
}

function formatBreakeRow(mode){
    //Takes mode=view/edit
    if (mode == 'view'){
        //Returns brake row  html element
        return "<br/>"
    }
    else {
        //returns new line
        return "\n"
    }
}

function formatLink(link, mode){
    //takes link = current element in iteration; mode=view/edit
    if (link['text'] == ''){
        //If no Alternative text for the Hyperlink is Providet set the link itself as text
        link['text'] = link['path']
    }

    if (mode == 'view'){
        const absoluteURL = link.path.startsWith('http')
        ? link.path
        : `http://${link.path}`;//Needet to make it an absolut not relativ link
        
        var htmlElement = htmlElement = `<a href="${absoluteURL}" class='viewUserContentLi'>${link.text}</a>`;
        //console.log("Link:", htmlElement)
        //Returns html href element with the hyperlink beeing from the link element
        return htmlElement
    }
    else {
        //console.log("Text:", link['text'], "Path:", link['path'])
        var line = link['text'] == link['path'] ? "[]" : `[${link['text']}]`
        line += `(${link['path']})` + "\n"
        //Returns the [link](Alternativ Text, if none empty), Md-syntax
        return line
    }
}



function allLinks(content){
    //Takes content=all elements, searches for links
    var links = []
    content.forEach(element => {
        if (element['type'] == 'li'){
            links.push(element['path'])
        }
    })
    //console.log(links)
    //Returns array of all links
    return links
}

function renderByLine(raw_content, mode){
    //console.log("Raw:", raw_content, "Mode", mode)
    //Takes raw_content=JSON data from the backend containig every line from the ist
    //as seperet elements in an array, each element has type, text and style
    var content = JSON.parse(raw_content)
    var formatedContent = ''

    if (mode == 'links'){
        //Return only all links in an array
        return allLinks(content)
    }
    //console.log(content)
    content.forEach((element, index) => {
        //For each line=element
        var formatedLine
        //console.log("Current Element:", element)
        //Folloring formats the Type (and text)
        switch (element['type']){
            case 'p':
                //console.log('p', mode)
                formatedLine = formatParagraph(element, mode);
                break;
            case 'li':
                //console.log('li', mode)
                formatedLine = formatLink(element, mode);
                break;
            case "br":
                formatedLine = formatBreakeRow(mode);
                break;
            case "sp":
                formatedLine = formatSeparator(mode);
                break;
        }
        //console.log("Pre Style:", formatedLine)
        ////Folloring Styles the above created html element thou covering it in another HTML element
        element['style'].forEach(style => {
            if (style[0] == 'h'){
                    formatedLine = styleHeadline(formatedLine, style[1], mode);}
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
    console.log("All:", formatedContent)
    //Returns the formated content (either HTML elemet or Md-like syntax)
    return formatedContent
}

export default renderByLine
