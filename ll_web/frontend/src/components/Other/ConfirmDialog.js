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
      <div className='overlay'>
      <div className='min-w-min absolute top-1/2 left-1/2 text-white transform -translate-x-1/2 -translate-y-1/2 dialog_box h-auto w-1/4 bg-gray-700 justify-center flex rounded-lg'>
          <div className='flex flex-col items-center p-3'>
              <h3 className='mt-1 infoHl text-center mb-8'>{props.question}</h3>
              <div className='mt-auto'>
                  <button onClick={handleTrueClick} className='mr-2 inputElement mb-1'>{props.trueBtnText}</button>
                  <button onClick={handleFalseClick} className='inputElement mb-1'>{props.falseBtnText}</button>
              </div>
          </div>
      </div>
  </div>
  
    );
    }

export default ConfirmDialog;