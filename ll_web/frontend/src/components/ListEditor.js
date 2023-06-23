import React, { useEffect, useState, Component, useRef} from 'react';
import ReactDOM from 'react-dom/client';
import renderByLine from './ViewContent';
import ConfirmDialog from './ConfirmDialog'
import '../../static/ViewUserContent.css'
import '../../static/ListEditor.css'


//If done, consider creatin on large if (mode = view){suite}else{suit} instead of many smal ones
//If done, consider moving styles ot a sepet css file

function ListEditor (props){
    //Presets all neaded useStates
    const [viewMode, setViewMode] = useState('view');
    const [content, setContent] = useState(props.content);
    const [tag, setTag] = useState(props.tag);
    const [color, setColor] = useState(props.color);
    const [name, setName] = useState(props.name);
    const [renderedContent, setRenderedContent] = useState("")
    const [displayWidth, setDisplayWidth] = useState(window.innerWidth);
    const [showMenu, setShowMenu] = useState(false);

    const toggleMenu = () => {
      setShowMenu(!showMenu);
    };

  useEffect(() => {
    const handleResize = () => {
      setDisplayWidth(window.innerWidth);
    };

    // Add event listener for window resize
    window.addEventListener('resize', handleResize);

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

    useEffect(() => {
      //Content needs to be dynamicly updated
      setContent(props.content);
    }, [props.content]);
    
    useEffect(() => {
      //For exit confirmation, when not saved and to render content once when view mode changes
      if (viewMode !== 'view') {
        setRenderedContent(renderByLine(content, 'edit'));
      }
  }, [viewMode]);


    const handleInsertion = (strToInset) => {
      //Handels insertion of quick formatt buttons at current cursor possition
      //Takes string from preset str in the button element
      const textarea = document.getElementById('list_content');
      const startPos = textarea.selectionStart;
      const endPos = textarea.selectionEnd;

      const currentValue = textarea.value;
      //Inserts string
      const newValue =
        currentValue.substring(0, startPos) +
        strToInset +
        currentValue.substring(endPos);

      //Moves cursor to after str
      textarea.value = newValue;
      textarea.focus();
      textarea.setSelectionRange(startPos + strToInset.length, startPos + strToInset.length);
    };

    const monitorKeyPressTextarea = (event) => {
      if (event.keyCode === 9) { //If Tab is pressed
        event.preventDefault()
        handleInsertion("    ")
      }};


    const updateListData = () => {
      //Fetches new information abou selected list from backend (only after changes saved)
      //and updates the useState of Color, Tag, Content
      fetch('api/getMetaHome/')
      .then(response => response.json())
      .then(data => {var relevantList = JSON.parse(data.metaLists).find(obj => obj.name === name);//.find needet becaus backend returns all lists from the user; Finds by list name
                     setColor(relevantList.color); setTag(relevantList.tag); setContent(relevantList.content)})
      .then(viewMode !== 'view' ? setRenderedContent(document.getElementById('list_content').value) : undefined)
      .catch(error => console.error('Error:', error));
  };
    
    const saveList = () => {
      //Saves List to backend, gets everything by Id, exept for name (which cant be changed)
      const formData = new FormData();
      formData.append("csrfmiddlewaretoken", document.querySelector('[name=csrfmiddlewaretoken]').value)
      formData.append("list_name", name)
      formData.append("list_tag", tag)
      formData.append("list_color", color)
      formData.append("list_content", document.getElementById('list_content').value)

      fetch("api/manageLists/", {
        method: 'POST',
        body: formData,
      })
        .then((response) => {
          // Handle the response if needed
          if (response.status == 406){
            document.getElementById('list_edit_msg').innerHTML = "An Error occurred!"
          }
          else {
            updateListData()
            document.getElementById('list_edit_msg').innerHTML = "Operation Successful";
          }
          //Resets previously set innerHTML info msg (after 5s)
          setTimeout(() => {  document.getElementById('list_edit_msg').innerHTML = '';}, 5000);
          
        })
        .catch((error) => {
          // Handle any errors that occur during the submission
          console.log("err")
          console.error('Form submission error:', error);
        });
    }

    const deleteList = () => {
      //Request list removel, takes persistant (unique) name and sets color (which otherwise only can be hex) to del
      const formData = new FormData();
      formData.append("csrfmiddlewaretoken", document.querySelector('[name=csrfmiddlewaretoken]').value)
      formData.append("list_name", name)
      formData.append("list_color", 'del')

      fetch("api/manageLists/", {
        method: 'POST',
        body: formData,
      })
        .then((response) => {
          // Handle the response if needed
          if (response.status == 406){
            document.getElementById('list_edit_msg').innerHTML = "An Error occurred!"
            setTimeout(() => {  document.getElementById('list_edit_msg').innerHTML = '';}, 5000);
          }
          else {
               //if sucsess, exit editor window
               exitEditor()         
          }          
        })
        .catch((error) => {
          // Handle any errors that occur during the submission
          console.log("err")
          console.error('Form submission error:', error);
        });
    }

    const exitEditor = () => {
      //calls to update all data (via the function in HomePage.js) and unmounts/closes editor
      //known to may rais an unimpactfull error
      props.update_data();
      ReactDOM.createRoot(document.getElementById('listEditor')).unmount();
    }
  
    return (
        <div className='overlay'>
          <div className='editorBox'>
            
            {viewMode != 'view' ? (
            //Top bar in edit mode
            displayWidth > 600 ? (
              <div className='head'>
                <h6 className='leftBlock' style={{ marginRight: '0' }}>Edit Mode</h6>

                <button
                  className='leftBlock'
                  onClick={() => {
                    ReactDOM.createRoot(document.getElementById('tagContainer')).render(
                      <ConfirmDialog
                        onConfirmation={(usrInput) => usrInput === true ? deleteList() : undefined}
                        question="Do you really want to delete this List?"
                        trueBtnText="Delete!"
                        falseBtnText="Go Back!"
                      />
                    );
                  }}>
                  Delete
                </button>
    
                <select className='centerBlock' id='select_tag_editor' defaultValue={tag} onChange={(e) => {setTag(e.target.value)}}>
                  <option value="Default">Default</option>
                  {props.tag_names.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                <h3 className='centerBlock'>{name}</h3>
                <input className='centerBlock' type="color" id="list_color_editor" name="list_color_editor" defaultValue={color} onChange={(e) => {setColor(e.target.value)}}/>
                <button
                  className='rightBlock'
                  onClick={() => {
                    if (document.getElementById('list_content').value.replace(/\r/g, '') === renderedContent.replace(/\r/g, '')) {
                      exitEditor();
                    } else {
                      ReactDOM.createRoot(document.getElementById('tagContainer')).render(
                        <ConfirmDialog
                          onConfirmation={(usrInput) => usrInput === true ? exitEditor() : undefined}
                          question="Do you really want to exit without saving?"
                          trueBtnText="Exit"
                          falseBtnText="Stay"
                        />
                      );
                    }
                  }}
                >
                  Exit
                </button>
              </div>
            ) : (
              <div className='head'>
                <h6 className='leftBlock' style={{ marginRight: 'auto' }}>Edit Mode</h6>
                <h3 className='centerBlock' style={{ marginRight: 'auto' }}>{name}</h3>
              <div className="hamburger-menu">
              <div className="hamburger-icon" onClick={toggleMenu}>
                <div className="icon-bar"></div>
                <div className="icon-bar"></div>
                <div className="icon-bar"></div>
              </div>
              {showMenu && (
                <div className="menu-items">
                  <div className='blur_background' onClick={toggleMenu}></div>
                  <button
                    onClick={() => {
                      ReactDOM.createRoot(
                        document.getElementById('tagContainer')
                      ).render(
                        <ConfirmDialog
                          onConfirmation={(usrInput) =>
                            usrInput === true ? deleteList() : undefined
                          }
                          question="Do you really want to delete this List?"
                          trueBtnText="Delete!"
                          falseBtnText="Go Back!"
                        />
                      );
                    }}
                  >
                    Delete
                  </button>
                  <div>
                    <p>Tag:</p>
                    <select
                      onChange={(e) => {setTag(e.target.value)}}
                      id="select_tag_editor"
                      defaultValue={tag}
                    >
                      <option value="Default">Default</option>
                      {props.tag_names.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <p>Color:</p>
                  <input
                    onChange={(e) => {setColor(e.target.value)}}
                    type="color"
                    id="list_color_editor"
                    name="list_color_editor"
                    defaultValue={color}
                  />
                  </div>
                  <button
                  onClick={() => {
                    if (document.getElementById('list_content').value.replace(/\r/g, '') === renderedContent.replace(/\r/g, '')) {
                      exitEditor();
                    } else {
                      ReactDOM.createRoot(document.getElementById('tagContainer')).render(
                        <ConfirmDialog
                          onConfirmation={(usrInput) => usrInput === true ? exitEditor() : undefined}
                          question="Do you really want to exit without saving?"
                          trueBtnText="Exit"
                          falseBtnText="Stay"
                        />
                      );
                    }
                  }}
                >
                  Exit
                </button>
                  </div>
                
              )
              }
            </div>
            </div>
            )
//" asdad\ndvbnnvn\n  fuj\nasd\n"
//" asdad\ndvbnnvn\n  fuj\nasd\nsd"
            ):(
            //Top bar in view mode
            <div className='head'>
                <h6 className='leftBlock'>View Mode</h6>
                <h3 className='centerBlock'>{name}</h3>
                <button className='rightBlock' onClick={() => exitEditor()}>Exit</button>
            </div>
            )}

            {viewMode != 'view' ? (
            //If in edit mode, show quick insert buttons
            <div className='editButtons'>
                <button onClick={() => {handleInsertion('[]()')}}>Link</button>
                <button onClick={() => {handleInsertion('#')}}>Headline</button>
                <button onClick={() => {handleInsertion('---\n')}}>Seperator</button>
                <button onClick={() => {handleInsertion('->. ')}}>List Item</button>
                <button onClick={() => {handleInsertion('-x. ')}}>Orderd List Item</button>
                <button onClick={() => {handleInsertion('!x!')}}>Ignore</button>
            </div>
            ):(
            //else show nothing (not possible so a hidden empty div is rendert)
            <div hidden/>)}
            
            {viewMode != 'view' ? (
                //If in edit mode, render textarea input field with default value gained from renderByLine
                
                <textarea id="list_content" className='mainBody' style={{backgroundColor: '#a5a5a5'}} defaultValue={renderedContent} onKeyDown={(e) => {monitorKeyPressTextarea(e)}}></textarea>
            ) : (
                //If in view mode, render html container with inner html formated by renderByLine, it must be set dangously to enable this 
                <div className='mainBody' dangerouslySetInnerHTML={{ __html: renderByLine(content, 'view') }} />
            )}
  
            <div className='footer'>
            <p id='list_edit_msg'></p>
                <div>
                  <button onClick={() => {if (viewMode === 'view'){setViewMode('edit');} else{if (document.getElementById('list_content').value.replace(/\r/g, '') === renderedContent.replace(/\r/g, '')) {
                      setViewMode('view')
                  } else {
                      ReactDOM.createRoot(document.getElementById("tagContainer")).render(
                          <ConfirmDialog
                              onConfirmation={(usrInput) => usrInput === true ? setViewMode('view') : undefined}
                              question="Do you really want to Change Mode without saving?"
                              trueBtnText="Continue"
                              falseBtnText="Go back"
                          />
                      );
                  }}}}>Change Mode</button>
                  {viewMode != 'view' ? (
                      //If in edit mode, render a Save button to save changes
                      <button onClick={() => {saveList()}}>Save</button>
                  ) : (
                      //else render a button that opens all links in new tabs
                      //if link dos not start with http, append it --> convert to absolut link
                    
                    <button onClick={() => {renderByLine(content, 'links').forEach(link => {
                                          window.open((link.startsWith('http')
                                                      ? link
                                                      : `http://${link}`), '_blank').focus()});}}
                                          >Open all Links</button>
                  )}
                </div>
              </div>
          </div>
        </div>
      );//list_edit_msg used to display informations about saves and error msg
};

export default ListEditor