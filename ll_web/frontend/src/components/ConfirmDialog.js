import React, { Component } from 'react';
import ReactDOM from 'react-dom/client';

function ConfirmDialog(props){
  //Universal Dialog for confirmation
  //gets props.question, props.trueBtnText, props.falseBtnText, props.onConfirmation

    const hadnleSelfDestruct = () => {
      ReactDOM.createRoot(document.getElementById('tagContainer')).unmount()
    }
    
    const handleTrueClick = () => {
        props.onConfirmation(true); // Call the onUserAnswer function with the user's answer
        hadnleSelfDestruct()
    };
  
    const handleFalseClick = () => {
        props.onConfirmation(false); // Call the onUserAnswer function with the user's answer
        hadnleSelfDestruct()
    };
  
  
    return (
    <div className='dialog_overlay'>
        <div className='dialog_box'>
          <div className='main_contend'>
            <h3>{props.question}</h3>
            <div>
              <button onClick={handleTrueClick}>{props.trueBtnText}</button>
              <button onClick={handleFalseClick}>{props.falseBtnText}</button>
            </div>
          </div>
        </div>
    </div>
    );
    }

export default ConfirmDialog;