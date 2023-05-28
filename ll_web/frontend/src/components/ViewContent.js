

function formatHeadline(headline, mode){
    if (mode == 'view'){
        var htmlElement = `<h${headline['style']} class='viewUserContentH'>${headline['text']}</h${headline['style']}>`
        //console.log("H:", htmlElement)
        return htmlElement
    }
    else {
        var line = "#".repeat(headline['style']) + headline['text'] + "\n"
        return line
    }
}

function formatParagraph(paragraph, mode){
    if (mode == 'view'){
        var htmlElement = `<p class='viewUserContentP'>${paragraph['text']}</p>`
        //console.log("P:", htmlElement)
        return htmlElement
    }
    else {
        return paragraph['text'] + "\n"
    }
}

function formatBreakeRow(mode){
    if (mode == 'view'){
        return "<br/>"
    }
    else {
        return "\n"
    }
}

function formatLink(link, mode){
    if (link['text'] == ''){
        link['text'] = link['path']
    }

    if (mode == 'view'){
        const absoluteURL = link.path.startsWith('http')
        ? link.path
        : `http://${link.path}`;

        var htmlElement = htmlElement = `<a href="${absoluteURL}" class='viewUserContentLi'>${link.text}</a>`;
        //console.log("Link:", htmlElement)
        return htmlElement
    }
    else {
        //console.log("Text:", link['text'], "Path:", link['path'])
        var line = link['text'] == link['path'] ? "[]" : `[${link['text']}]`
        line += `(${link['path']})` + "\n"
        return line
    }
}

function allLinks(content){
    var links = []
    content.forEach(element => {
        if (element['type'] == 'li'){
            links.push(element['path'])
        }
    })
    //console.log(links)
    return links
}

function renderByLine(raw_content, mode){
    //console.log("Raw:", raw_content, "Mode", mode)

    var content = JSON.parse(raw_content)
    var formatedContent = ''

    if (mode == 'links'){
        return allLinks(content)
    }
    //console.log(content)
    content.forEach(element => {
        //console.log("Current Element:", element)
        switch (element['type']){
            case 'p':
                //console.log('p', mode)
                formatedContent += formatParagraph(element, mode);
                break;
            case 'li':
                //console.log('li', mode)
                formatedContent += formatLink(element, mode);
                break;
            case 'h':
                //console.log('h', mode)
                formatedContent += formatHeadline(element, mode);
                break;
            case "br":
                formatedContent += formatBreakeRow(mode)
        }
    });
    //console.log("All:", formatedContent)
    return formatedContent
}


export default renderByLine
