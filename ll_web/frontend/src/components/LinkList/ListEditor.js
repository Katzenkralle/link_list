import React, { Component, useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import renderByLine, {allLinks} from './ContentRender';
import '../../../static/LinkList/tailwindListEditor.css'
import '../../../static/LinkList/ViewUserContent.css'
import { interactivElementChangeHandler, monitorKeyRelease, selectName, deleteListButton, selectTag, selectColor, exitEditorButton, hamburgerIcon, changeViewMode, monitorKeyPress, handleInsertion } from './ListEditorHelper';
import MediaContentManager from '../asciiColor/MediaContentManager';


const ListEditor = (props) => {
    const listId = props.listId;
    const [name, setName] = useState("");
    const [color, setColor] = useState("");
    const [tag, setTag] = useState([]);
    const [content, setContent] = useState([]);
    const [interactiveElements, setInteractiveElements] = useState([]);
    const [renderedContent, setRenderedContent] = useState([]);
    const [tagsOfOwner, setTagsOfOwner] = useState([]);

    const [viewMode, setViewMode] = useState("view");
    const [showMenu, setShowMenu] = useState(false);

    const isEditable = props.isEditable;
    const parent = props.parent;
    const displayWidth = window.innerWidth;

    window.location.hash = `#${listId}`


    const getContent = () => {
        fetch(`linkListApi/listContent/?id=${listId}`)
        .then(response => response.json())
        .then(data => {
            setName(data.name);
            setColor(data.color);
            setTag(data.tag);
            setContent(data.content);
            data.hasOwnProperty('tagsOfOwner') ? setTagsOfOwner(data.tagsOfOwner) : setTagsOfOwner(null);
        }).catch(error => {
            exitEditor();
            console.log(error);
        })
    }

    const saveList = (del) => {
        return new Promise((resolve, reject) => {
            const formData = new FormData();
            formData.append("csrfmiddlewaretoken", document.querySelector('[name=csrfmiddlewaretoken]').value);
            formData.append("id", listId);
            formData.append("name", name);
            formData.append("color", del ? 'del' : color);
            formData.append("tag", tag);
            fetch(`linkListApi/lists/`, {
                method: 'POST',
                body: formData,
            }).then((response) => {
                if (!response.ok){
                    throw Error(response.statusText);
                }
                resolve();
            }).catch(error => {
                console.log(error);
                reject(error);
            });
        });
    };

    const saveContent = () => {
        return new Promise((resolve, reject) => {
            const formData = new FormData();
            formData.append("csrfmiddlewaretoken", document.querySelector('[name=csrfmiddlewaretoken]').value);
            formData.append("id", listId);
            formData.append("content", document.getElementById('listContent').value);
            fetch(`linkListApi/listContent/`, {
                method: 'POST',
                body: formData,
            }).then((response) => {
                if (!response.ok){
                    throw Error(response.statusText);
                }
                resolve();
            }).catch(error => {
                reject(error);
            });
        });
    };

    const saveHandler = () => {
      //Saves list and content, then exits editor
      let listSaveMsg = document.getElementById('listEditMsg');
      listSaveMsg.classList.add('bg-cat-warning', 'loadingPing', 'rounded-full');
      Promise.all([ parent == 'largeViewer' ? null : saveList(), saveContent()]).then(() => {
        getContent();
        listSaveMsg.classList.add('text-cat-success');
        listSaveMsg.innerHTML = 'Saved';
        document.getElementById("listContent").focus()
        setTimeout(() => {listSaveMsg.classList.remove('text-cat-success'); listSaveMsg.innerHTML = '';}, 5000);
      }).catch(error => {
        listSaveMsg.classList.add('text-cat-error');
        listSaveMsg.innerHTML = 'Error';
        setTimeout(() => {listSaveMsg.classList.remove('text-cat-error'); listSaveMsg.innerHTML = '';}, 5000);
      }).finally(() => {
        listSaveMsg.classList.remove('bg-cat-warning', 'loadingPing', 'rounded-full');
        });
    };

    const interactivElementChangeHandler = (type, id) => {
          //Checks if any interactive elements have changed, if so, send a request to the backend, bundeling all changes
          //Returns a promise, which resolves when the request is finished, or rejects if there is an error; wait for finish before continuing
          
          if (type == 'checkbox') {
            let htmlState = document.getElementById(id);
            let postRenderId = id.replace('interactiveElement', '');
            let postRenderState = interactiveElements.filter(element => element.id == postRenderId)[0];
            
            if (!isEditable) {
              htmlState.checked = postRenderState.state
              return
            };

            if (htmlState.checked != postRenderState.state) {
              postRenderState.state = htmlState.checked;
              
              return new Promise((resolve, reject) => {
                const formData = new FormData();
                formData.append("csrfmiddlewaretoken", document.querySelector('[name=csrfmiddlewaretoken]').value);
                formData.append("id", listId);
                formData.append("interactive_changes", JSON.stringify([postRenderState]));
                fetch(`linkListApi/listContent/`, {
                  method: 'POST',
                  body: formData,
                }).then((response) => {
                  if (!response.ok){
                    throw Error(response.statusText);
                  }
                  console.log("saved interactive Elements");
                  resolve();
                }).catch(error => {
                  let listSaveMsg = document.getElementById('listEditMsg');
                  listSaveMsg.classList.add('text-cat-error');
                  listSaveMsg.innerHTML = 'Error syncronizing interactive elements';
                  setTimeout(() => {listSaveMsg.classList.remove('text-cat-error'); listSaveMsg.innerHTML = '';}, 5000);
                  reject(error);
                });
              });
            }             
          }
        };
        window.interactivElementChangeHandler = interactivElementChangeHandler;
    

   const exitEditor = () => {
      window.interactivElementChangeHandler = undefined; 
      window.location.hash = '';
      props.exit()
      ReactDOM.createRoot(document.getElementById('listEditor')).unmount();
    
    }
    

    useEffect(() => {
        getContent()
    },[]);

    useEffect(() => {
        let [formCont, interElem] = (renderByLine(content, viewMode, listId));
        setRenderedContent(formCont);
        setInteractiveElements(interElem);
    },[content, viewMode]);

    const topBar = () => {
        return (
          viewMode == 'edit' ? (
            //Top bar in edit mode
            displayWidth > 600 ? (
              //>600px, show all buttons
              <div className='head'>
                <h6 className='leftBlock mr-0 text-sm'>Edit Mode</h6>
                {deleteListButton('leftBlock', parent, saveList, exitEditor)}

                {selectTag('centerBlock', setTag, tag, parent, tagsOfOwner)}
                {selectName('centerBlock', name, setName)}
                {selectColor('centerBlock', color, setColor, parent)}
                
                {exitEditorButton('rightBlock', parent, exitEditor, renderedContent)}
              </div>
            ) : (
              //show hamburger menu
              <div className='head'>
                <h6 className='leftBlock text-sm'>Edit Mode</h6>
                
                {selectName('centerBlock', name, setName)}

                {hamburgerIcon(showMenu, setShowMenu)}
                
                {showMenu && (
                  <>
                  <div className='overlay' onClick={() => setShowMenu(!showMenu)} />
                  
                  <div className="fixed top-0 right-0 z-50 grid grid-cols-2 grid-rows-5 gap-x-1 gap-y-3 bg-cat-surface rounded-bl-lg pl-2 pb-2">
                    <div className='col-start-2 justify-self-end'>
                      {hamburgerIcon(showMenu, setShowMenu)}
                    </div>
                    <div className='row-start-2 col-start-2 justify-self-center self-center'>
                      {deleteListButton("", parent, saveList, exitEditor)}
                    </div>
    
                    <p className='row-start-3 self-center justify-self-center'>Tag:</p>
                    <div className='row-start-3 justify-self-center self-center'>
                      {selectTag("", setTag, tag, parent, tagsOfOwner)}
                    </div>
                      
                    <p  className='row-start-4 self-center justify-self-center'>Color:</p>
                    <div className='row-start-4 justify-self-center self-center'>
                      {selectColor("", color, setColor, parent)}
                    </div>

                    <div className='row-start-5 col-start-2 justify-self-center self-center'>
                      {exitEditorButton("", parent, exitEditor, renderedContent)}
                    </div>
                  </div>
                  </>
                )
                }

              </div>
            )
          ) : (
            //Top bar in view mode
            <div className='head'>
              <h6 className='leftBlock text-sm'>View Mode</h6>
              <h3 className='centerBlock infoHl'>{name}</h3>
              {parent == 'largeViewer' ? <div className='ml-auto mr-1'>&nbsp;</div> :
               <img 
                id="exitEditor"
                src='static/media/close.png'
               className='ml-auto mr-1 mt-1 inputElementIcon' 
               onClick={() => exitEditor()}/>}
            </div>
          )
    
        )
      }
    
      const editButtons = () => {
        return (
          viewMode == 'edit' ? (
            //If in edit mode, show all edit buttons
            <div className='editButtons'>
              <img className="inputElementIcon" src="static/media/headline.png" onClick={() => { handleInsertion('# ') }}/>
              <img className="inputElementIcon" src="static/media/link.png" onClick={() => { handleInsertion('[]()') }}/>
              <img className="inputElementIcon" src="static/media/list.png" onClick={() => { handleInsertion('->. ') }}/>
              <img className="inputElementIcon" src="static/media/list_orderd.png" onClick={() => { handleInsertion('-x. ') }}/>
              <img className="inputElementIcon" src="static/media/checkbox.png" onClick={() => { handleInsertion('[ ] ') }}/>
              <img className='inputElementIcon' src="static/media/codeblock.png" onClick={() => {handleInsertion("```\n\n```", 4)}} ></img>
              <img className="inputElementIcon" src="static/media/spacer.png" onClick={() => { handleInsertion('---\n') }}/>
              <img className="inputElementIcon" src="static/media/ignore.png" onClick={() => { handleInsertion('!x!') }}/>
              <img className="inputElementIcon" src="static/media/media.png" 
              onClick={() => { ReactDOM.createRoot(document.getElementById("mediaContentManager"))
              .render(<MediaContentManager contentType={["*/*"]} selectedImg={(e) => handleInsertion(`[](embedded-locale:${e.name}@${e.id})\n`)}/>)}}
              />
            </div>
          ) : (
            //If in view mode, show no buttons
            <div hidden />)
    
        )
      }
    
      const contentArea = () => {
        return (
          viewMode == 'edit' ? (
            //If in edit mode, render textarea with content, (rendering must have finished first)
              <textarea
                key={renderedContent} //Must stay, otherwise react dosnt rerender
                id="listContent"
                className="mainBody bg-cat-bg2 text-cat-light font-mono focus:outline focus:outline-1 focus:outline-cat-border focus:text-cat-main"
                defaultValue={renderedContent}
                onKeyDown={(e) => {
                  monitorKeyPress(e, viewMode, saveHandler);
                }}
                onKeyUp={(e) => {
                  monitorKeyRelease(e)
                }}
                onBlur={() => {
                  monitorKeyRelease(null, true)
                }}
              ></textarea>
            ) : (
            // If in view mode, render div with content (rendering must have finished first)
              <div
                className="mainBody flex flex-col"
                dangerouslySetInnerHTML={{ __html: renderedContent }}
              ></div>
            
          )
    
        )
      }
    
      const fotter = () => {
        return (
          <div className='footer mt-2 pb-1 flex flex-wrap justify-center'>
            
              {isEditable ? 
                //If edit premission, render a button to change view mode
                changeViewMode(renderedContent, setViewMode, viewMode, getContent)
               : (
                <div />
              )}

              <p id='listEditMsg' className='w-10 h-10 min-w-fit mx-4 text-center'></p>
              
              {viewMode == 'edit' ? (
                //If in edit mode, render a button to save
                <img className="inputElementIcon" src='static/media/save.png' onClick={() => { saveHandler() }}/>
              ) : (
                //If in view mode, render a button to open all links
                <img className="inputElementIcon" 
                src='static/media/open.png'
                onClick={() => {
                  allLinks(content, listId).forEach(link => {
                    window.open((link.startsWith('http')
                      ? link
                      : `http://${link}`), '_blank').focus()
                  });
                }}
                />
              )}
            
          </div>
        )
      }
    
      return (
        <div className='overlay'>
          <div className={`${parent == "largeViewer" ? "largeViewerLargeOverlayBox" : "largeOverlayBox"}`}>
    
            {topBar()}
    
            {editButtons()}
    
            {contentArea()}
    
            {fotter()}

          </div>
          <div id="mediaContentManager"></div>
        </div>
      );//list_edit_msg used to display informations about saves and error msg
    };

export default ListEditor;