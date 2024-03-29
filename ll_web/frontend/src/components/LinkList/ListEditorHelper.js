import React, { useEffect, useState, Component } from 'react';
import ReactDOM from 'react-dom/client';
import ConfirmDialog from '../Other/ConfirmDialog'

import { STATICS } from '../Other/StaticPaths';

export const handleInsertion = (strToInset, moveCursor) => {
  //Handles the insertion of strings into the textarea
  //Insert at cursor position, the provided string
  const textarea = document.getElementById('listContent');
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
  if (!moveCursor) {
    textarea.setSelectionRange(startPos + strToInset.length, startPos + strToInset.length);
  } else {
    textarea.setSelectionRange(startPos + moveCursor, startPos + moveCursor);
  }
};

let pressedKeys = []
export const monitorKeyPress = (event, saveHandler, editorFocused) => {
  pressedKeys.includes(event.keyCode) ? null : pressedKeys.push(event.keyCode)
  //Monitors keypresses in textarea
  if (editorFocused) {
    switch (event.keyCode) {
      case 9: //Tab
        event.preventDefault()
        handleInsertion("    ")
        break
    }
  }
  //Monitors keypresses in window
  if (pressedKeys.includes(17)) { //ctrl
    if (pressedKeys.includes(83)) { //s
      event.preventDefault()
      saveHandler()
    } else if (pressedKeys.includes(79)) { //o
      event.preventDefault()
      pressedKeys = []
      document.getElementById("exitEditor").click()
    } else if (pressedKeys.includes(69)) { //e
      event.preventDefault()
      document.getElementById("changeMode").click()
    }
  }
}

export const monitorKeyRelease = (event, delAll) => {
  if (delAll) {
    pressedKeys = []
    return
  }
  pressedKeys = pressedKeys.filter(key => key != event.keyCode)
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
      id="listName"
      onChange={(e) => { setName(e.target.value) }}
      className={`${htmlClassName} infoHl rounded-full bg-cat-bg text-center
    hover:outline hover:outline-2 hover:outline-cat-border hover:bg-cat-input 
    focus:outline focus:outline-2 focus:outline-cat-border focus:bg-cat-input`} />
  )
}

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
        id="listTag"
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
        id="listColor"
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
        id="exitEditor"
        className={`${htmlClassName} inputElementIcon mt-1`}
        src={`${STATICS.OTHER}close.png`}
        onClick={() => {
          if (document.getElementById('listContent').value.replace(/\r/g, '') === renderedContent.replace(/\r/g, '')) {
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
        src={`${STATICS.OTHER}delete.png`}
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
      id="changeMode"
      src={`${STATICS.OTHER}change_mode.png`}
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
          if (document.getElementById('listContent').value.replace(/\r/g, '') === renderedContent.replace(/\r/g, '')) {
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
      }} />
  )
}

