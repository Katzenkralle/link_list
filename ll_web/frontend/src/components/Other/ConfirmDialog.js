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
      <div class='overlay'>
      <div class='absolute top-1/2 left-1/2 text-white transform -translate-x-1/2 -translate-y-1/2 dialog_box bg-gray-700 h-40 w-80 justify-center flex rounded-lg'>
          <div class='flex flex-col items-center'>
              <h3 class='mt-1 infoHl text-center'>{props.question}</h3>
              <div class='mt-auto mb-2'>
                  <button onClick={handleTrueClick} class='mr-2 inputElement'>{props.trueBtnText}</button>
                  <button onClick={handleFalseClick} className='inputElement'>{props.falseBtnText}</button>
              </div>
          </div>
      </div>
  </div>
  
    );
    }

export default ConfirmDialog;