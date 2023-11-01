import React, { useEffect, useState, Component} from 'react';
import ReactDOM from 'react-dom/client';
import ConfirmDialog from '../Other/ConfirmDialog'

export const handleInsertion = (strToInset) => {
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

export const monitorKeyPressTextarea = (event) => {
    //Monitors keypresses in textarea
    if (event.keyCode === 9) { //If Tab is pressed
      event.preventDefault()
      handleInsertion("    ")
    }
}

export const hamburgerIcon = (showMenu, setShowMenu) => {
    return (
      //HTML Hamburger icon for small view mode, here becaus of symplisity
      <div className="hamburger-icon" onClick={() => setShowMenu(!showMenu)}>
        <div className="icon-bar"></div>
        <div className="icon-bar"></div>
        <div className="icon-bar"></div>
      </div>)
  }

export const selectName = (htmlClassName, name, setName) => {
  return ( 
    <input 
    value={name}
    onChange={(e) => {setName(e.target.value)}}
    className={`${htmlClassName} infoHl rounded-full bg-cat-bg text-center
    hover:outline hover:outline-2 hover:outline-cat-border hover:bg-cat-input 
    focus:outline focus:outline-2 focus:outline-cat-border focus:bg-cat-input`}/>
  )}

export const selectTag = (htmlClassName, setTag, tag, parent, tagsOfOwner) => {
    //HTML select tag element, with options from props.tagsOfOwner
    //If called from large viewer it can be undefined, then return empty div
    if (parent == 'largeViewer') {
      return (<div className={`${htmlClassName}`}>&nbsp;</div>)
    } else {
      return (
        <select
        className={`${htmlClassName} inputElementSlim`}
          onChange={(e) => { setTag(e.target.value) }}
          id="list_tag"
          defaultValue={tag}>

          <option value="Default">Default</option>
          {tagsOfOwner.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>

          ))}
        </select>
      )
    }
  }

export const selectColor = (htmlClassName, color, setColor, parent) => {
    //HTML color picker element, with default value from props.color
    //dosnt nead useState color, because it is only used to set the default value, props will change on save
    //If called from large viewer it can be undefined, then return empty div
    if (parent == 'largeViewer') {
      return (<div className={`${htmlClassName}`}>&nbsp;</div>)
    } else {
      return (
        <input
        className={`!p-[revert] h-[1.5em] ${htmlClassName} inputElementSlim`}
          onChange={(e) => { setColor(e.target.value) }}
          type="color"
          id="list_color_editor"
          name="list_color_editor"
          defaultValue={color}
        />
      )
    }
  } 

export const exitEditorButton = (htmlClassName, parent, exitEditor, renderedContent) => {
    //HTML exit button, if called from large viewer, return empty button
    //Displays a confirmation dialog if content has changed
    if (parent == 'largeViewer') {
      return (<div className={`${htmlClassName}`}>&nbsp;</div>)
    } else {
      return (
        <img
          className={`${htmlClassName} inputElementIcon mt-1`}
          src='/static/media/close.png'
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
        />
      )
    }
  }

export const deleteListButton = (htmlClassName, parent, saveList, exitEditor) => {
    //HTML delete button, if called from large viewer, return empty div
    //Displays a confirmation dialog bevor making the request
    if (parent == 'largeViewer') {
      return (<div className={`${htmlClassName}`}>&nbsp;</div>)
    } else {
      return (
        <img
        className={`${htmlClassName} inputElementIcon mt-1`}
          src='/static/media/delete.png'
          onClick={() => {
            ReactDOM.createRoot(
              document.getElementById('tagContainer')
            ).render(
              <ConfirmDialog
                onConfirmation={(usrInput) =>
                  usrInput === true ? Promise.resolve(saveList("del")).then(() => exitEditor()) : undefined
                }
                question="Do you really want to delete this List?"
                trueBtnText="Delete!"
                falseBtnText="Go Back!"
              />
            );
          }}
        />
      )
    }
  }

export const changeViewMode = (renderedContent, setViewMode, viewMode, getContent) => {
    return (
      <img
        className="inputElementIcon mx-1"
        src='/static/media/change_mode.png'
        onClick={async () => {
        if (viewMode === 'view') {
          //If in view mode, check if any interactive elements have changed, if so, update data then change view mode
          /*
          if (action === 'changed') {
            await getContent();
          }
          */
          setViewMode('edit');
        } else {
          //If in edit mode, check if content has changed, if so, display confirmation dialog, if not, change view mode
          if (document.getElementById('list_content').value.replace(/\r/g, '') === renderedContent.replace(/\r/g, '')) {
            setViewMode('view');
          } else {
            ReactDOM.createRoot(document.getElementById("tagContainer")).render(
              <ConfirmDialog
                onConfirmation={(usrInput) => {
                  if (usrInput === true) {
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
      }}/>
    )}

