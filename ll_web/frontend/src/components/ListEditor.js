import React, { useEffect, useState, Component, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import renderByLine from './ContentRender';
import ConfirmDialog from './ConfirmDialog'
import '../../static/ViewUserContent.css'
import '../../static/ListEditor.css'

import { updateListData, deleteList, saveList } from './ListEditorApiRequests';

function ListEditor(props) {
  //Presets all neaded useStates
  const [viewMode, setViewMode] = useState('view');
  const [id, setId] = useState(props.id);
  const [content, setContent] = useState(props.content);
  const [tag, setTag] = useState(props.tag);
  const [color, setColor] = useState(props.color);
  const [name, setName] = useState(props.name);
  const [renderedContent, setRenderedContent] = useState("")
  const [renderingContent, setRenderingContent] = useState(false)
  const [interactiveElements, setInteractiveElements] = useState([])
  const [displayWidth, setDisplayWidth] = useState(window.innerWidth);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditable, setIsEditable] = useState(props.is_editable);
  const [calledFromLargeViewer, setCalledFromLargeViewer] = useState(props.called_from_large_viewer);


  const toggleMenu = () => {
    //Toggles the menu in small view mode
    setShowMenu(!showMenu);
  };

  useEffect(() => {
    console.log(name)
    //On load, set event listener for window resize
    //save the window width in displayWidth on resize
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
    //Update content when props change, needs to be dynamic
    setContent(props.content);
  }, [props.content]);

  useEffect(() => {
    //When viewMode changes, reformats the content, get interactive elements
    //When finished, set renderedContent to false 
    var [formatedContent, intElem] = renderByLine(content, viewMode);
    setRenderedContent(formatedContent);
    setInteractiveElements(intElem);
    setRenderingContent(false);
  }, [viewMode]);



  const updateListData = () => {
    //Updates the list data from api
    //Returns a promise, which resolves when the request is finished, or rejects if there is an error; wait for finish before continuing
    return new Promise((resolve, reject) => {
      if (calledFromLargeViewer == true) {
        //Use different api call if called from large viewer gertting less data, and handeling auth 
        fetch('api/getDataViewerLarge' + window.location.search)
          .then(response => response.json())
          .then(data => {
            // : data.color/.tag in large viewer not always present
            setColor(('color' in data ? data.color : undefined));
            setTag(('tag' in data ? data.tag[0] : undefined));
            setContent(data.content);
          })
          .then(() => {
            if (viewMode !== 'view') {
              setRenderedContent(document.getElementById('list_content').value);
            }
          })
          .then(() => resolve())
          .catch(error => {
            console.error('Error:', error);
            reject();
          });
      } else {
        //Get all data from backend for loged in user
        fetch('api/getMetaHome/')
          .then(response => response.json())
          .then(data => {
            var relevantList = JSON.parse(data.metaLists).find(obj => obj.name === name);
            setColor(relevantList.color);
            setTag(relevantList.tag);
            setContent(relevantList.content);
          })
          .then(() => {
            if (viewMode !== 'view') {
              setRenderedContent(document.getElementById('list_content').value);
            }
          })
          .then(() => resolve())
          .catch(error => {
            console.error('Error:', error);
            reject();
          });
      }
    });
  }


  const saveList = () => {
    //Saves the list, sends a request to the backend, bundeling all changes
    //If error, display error msg, else update data and display info msg shortly
    //Only gets content by id
    const formData = new FormData();
    formData.append("csrfmiddlewaretoken", document.querySelector('[name=csrfmiddlewaretoken]').value)
    formData.append("list_id", id)
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
        if (response.status == 406) {
          document.getElementById('list_edit_msg').innerHTML = "An Error occurred!"
        }
        else {
          updateListData()
          document.getElementById('list_edit_msg').innerHTML = "Operation Successful";
        }
        //Resets previously set innerHTML info msg (after 5s)
        setTimeout(() => { document.getElementById('list_edit_msg').innerHTML = ''; }, 5000);

      })
      .catch((error) => {
        // Handle any errors that occur during the submission
        console.log("err")
        console.error('Form submission error:', error);
      });
  }

  const deleteList = () => {
    //Deletes the list, sends a request to the api
    //Uses del as color to signal deletion possible because normaly color can only be set to hex
    //If error, display error msg, else exit editor
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
        if (response.status == 406) {
          document.getElementById('list_edit_msg').innerHTML = "An Error occurred!"
          setTimeout(() => { document.getElementById('list_edit_msg').innerHTML = ''; }, 5000);
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


  const interactiveElementsChangeHandler = () => {
    //Checks if any interactive elements have changed, if so, send a request to the backend, bundeling all changes
    //Returns a promise, which resolves when the request is finished, or rejects if there is an error; wait for finish before continuing
    return new Promise((resolve, reject) => {
      var changes = [];
      var htmlId;
      var htmlStatus;
      if (viewMode == 'view') {
        interactiveElements.forEach(element => {
          htmlId = `interactiveElement${element.id}`;
          htmlStatus = document.getElementById(htmlId).checked;
          if (htmlStatus != element.state) {
            changes.push({ 'id': element.id, 'state': htmlStatus });
          }
        });
      }
      if (changes.length != 0) {
        changes = JSON.stringify(changes);
        var formData = new FormData();
        formData.append("csrfmiddlewaretoken", document.querySelector('[name=csrfmiddlewaretoken]').value);
        formData.append("changes", changes);
        formData.append("list_name", name);
        fetch("api/interactiveElements/", {
          method: 'POST',
          body: formData,
        })
          .then(() => resolve('changed')) // Resolve the promise when fetch completes
          .catch(error => reject(error)); // Reject the promise if there is an error
      } else {
        resolve(''); // Resolve the promise if no changes
      }
    })
  };

  const handleInsertion = (strToInset) => {
    //Handles the insertion of strings into the textarea
    //Insert at cursor position, the provided string
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
    //Monitors keypresses in textarea
    if (event.keyCode === 9) { //If Tab is pressed
      event.preventDefault()
      handleInsertion("    ")
    }
  };


  const exitEditor = async () => {
    //Wait for interactiveElementsChangeHandler to finish, then update data and exit editor
    await interactiveElementsChangeHandler();
    props.update_data()
    ReactDOM.createRoot(document.getElementById('listEditor')).unmount();
  }

  const hamburgerIcon = () => {
    return (
      //HTML Hamburger icon for small view mode, here becaus of symplisity
      <div className="hamburger-icon" onClick={toggleMenu}>
        <div className="icon-bar"></div>
        <div className="icon-bar"></div>
        <div className="icon-bar"></div>
      </div>)
  }

  const selectTag = (htmlClassName) => {
    //HTML select tag element, with options from props.tag_names
    //If called from large viewer it can be undefined, then return empty div
    if (props.tag_names == undefined) {
      return (<div></div>)
    } else {
      return (
        <select
          className={htmlClassName}
          onChange={(e) => { setTag(e.target.value) }}
          id="select_tag_editor"
          defaultValue={tag}>

          <option value="Default">Default</option>
          {props.tag_names.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>

          ))}
        </select>
      )
    }
  }

  const selectColor = (htmlClassName) => {
    //HTML color picker element, with default value from props.color
    //dosnt nead useState color, because it is only used to set the default value, props will change on save
    //If called from large viewer it can be undefined, then return empty div
    if (props.color == undefined) {
      return (<div></div>)
    } else {
      return (
        <input
          className={htmlClassName}
          onChange={(e) => { setColor(e.target.value) }}
          type="color"
          id="list_color_editor"
          name="list_color_editor"
          defaultValue={color}
        />
      )
    }
  }

  const exitEditorButton = (htmlClassName) => {
    //HTML exit button, if called from large viewer, return empty button
    //Displays a confirmation dialog if content has changed
    if (calledFromLargeViewer == true) {
      return (<button hidden />)
    } else {
      return (
        <button
          className={htmlClassName}
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
      )
    }
  }

  const deleteListButton = (htmlClassName) => {
    //HTML delete button, if called from large viewer, return empty div
    //Displays a confirmation dialog bevor making the request
    if (calledFromLargeViewer == true) {
      return (<div></div>)
    } else {
      return (
        <button
          className={htmlClassName}
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
      )
    }
  }

  const changeViewMode = () => {
    return (
      <button onClick={async () => {
        if (viewMode === 'view') {
          //If in view mode, check if any interactive elements have changed, if so, update data then change view mode
          const action = await interactiveElementsChangeHandler();
          if (action === 'changed') {
            await updateListData();
          }
          setRenderingContent(true);
          setViewMode('edit');
        } else {
          //If in edit mode, check if content has changed, if so, display confirmation dialog, if not, change view mode
          if (document.getElementById('list_content').value.replace(/\r/g, '') === renderedContent.replace(/\r/g, '')) {
            setRenderingContent(true);
            setViewMode('view');
          } else {
            ReactDOM.createRoot(document.getElementById("tagContainer")).render(
              <ConfirmDialog
                onConfirmation={(usrInput) => {
                  if (usrInput === true) {
                    setRenderingContent(true);
                    setViewMode('view');
                  }
                }}
                question="Do you really want to Change Mode without saving?"
                trueBtnText="Continue"
                falseBtnText="Go back"
              />
            );
          }
        }
      }}>
        Change Mode
      </button>
    )
  }

  const topBar = () => {
    return (
      viewMode == 'edit' ? (
        //Top bar in edit mode
        displayWidth > 600 ? (
          //>600px, show all buttons
          <div className='head'>
            <h6 className='leftBlock' style={{ marginRight: '0' }}>Edit Mode</h6>
            {deleteListButton('leftBlock')}
            {selectTag('centerBlock')}
            <h3 className='centerBlock'>{name}</h3>
            {selectColor('centerBlock')}
            {exitEditorButton('rightBlock')}
          </div>
        ) : (
          //show hamburger menu
          <div className='head'>
            <h6 className='leftBlock' style={{ marginRight: 'auto' }}>Edit Mode</h6>
            <h3 className='centerBlock' style={{ marginRight: 'auto' }}>{name}</h3>
            {hamburgerIcon()}
            {showMenu && (
              <div className="hamburger-menu">
                {hamburgerIcon()}
                <div className="menu-items">
                  <div className='blur_background' onClick={toggleMenu} />
                  {deleteListButton()}
                  <div>
                    <p>Tag:</p>
                    {selectTag()}
                  </div>
                  <div>
                    <p>Color:</p>
                    {selectColor()}
                  </div>
                  {exitEditorButton()}
                </div>
              </div>
            )
            }
          </div>
        )
      ) : (
        //Top bar in view mode
        <div className='head'>
          <h6 className='leftBlock'>View Mode</h6>
          <h3 className='centerBlock'>{name}</h3>
          {calledFromLargeViewer ? <div></div> : <button className='rightBlock' onClick={() => exitEditor()}>Exit</button>}
        </div>
      )

    )
  }

  const editButtons = () => {
    return (
      viewMode == 'edit' ? (
        //If in edit mode, show all edit buttons
        <div className='editButtons'>
          <button onClick={() => { handleInsertion('#') }}>Headline</button>
          <button onClick={() => { handleInsertion('[]()') }}>Link</button>
          <button onClick={() => { handleInsertion('->. ') }}>List</button>
          <button onClick={() => { handleInsertion('-x. ') }}>Orderd List</button>
          <button onClick={() => { handleInsertion('[ ] ') }}>Checkbox</button>
          <button onClick={() => { handleInsertion('---\n') }}>Seperator</button>
          <button onClick={() => { handleInsertion('!x!') }}>Ignore</button>
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
        renderingContent ? (
          <div></div>
        ) : (
          <textarea
            id="list_content"
            className="mainBody"
            style={{ backgroundColor: '#a5a5a5' }}
            defaultValue={renderedContent}
            onKeyDown={(e) => {
              monitorKeyPressTextarea(e);
            }}
          ></textarea>
        )
      ) : (
        // If in view mode, render div with content (rendering must have finished first)
        renderingContent ? (
          <div></div>
        ) : (
          <div
            className="mainBody"
            dangerouslySetInnerHTML={{ __html: renderedContent }}
          ></div>
        )
      )

    )
  }

  const fotter = () => {
    return (
      <div className='footer'>
        <p id='list_edit_msg'></p>
        <div>
          {isEditable ? 
            //If edit premission, render a button to change view mode
            changeViewMode()
           : (
            <div />
          )}

          {viewMode == 'edit' ? (
            //If in edit mode, render a button to save
            <button onClick={() => { saveList() }}>Save</button>
          ) : (
            //If in view mode, render a button to open all links
            <button onClick={() => {
              renderByLine(content, 'links').forEach(link => {
                window.open((link.startsWith('http')
                  ? link
                  : `http://${link}`), '_blank').focus()
              });
            }}
            >Open all Links</button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className='overlay'>
      <div className='editorBox'>

        {topBar()}

        {editButtons()}

        {contentArea()}

        {fotter()}

      </div>
    </div>
  );//list_edit_msg used to display informations about saves and error msg
};

export default ListEditor