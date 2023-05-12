import React, { Component } from 'react';
import ReactDOM from 'react-dom';

const styles = {
  overlay: {
    position: 'fixed',
    display: 'flex',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 2,
    cursor: 'pointer',
  },
  box: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    color: 'white',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#787878',
    height:'10em',
    width: '20em',
    justifyContent: 'center',
    display: 'flex'
  },
};



export default class ManageTags extends Component {
    constructor(props) {
      super(props);
    }

    handleSubmit = (event) => {
      event.preventDefault(); // Prevent the default form submission
      // Perform any additional logic or data manipulation here
  
      // Send the form data to a different URL using AJAX/fetch
      const formData = new FormData(event.target);
      formData.append("csrfmiddlewaretoken", document.querySelector('[name=csrfmiddlewaretoken]').value)
      fetch("api/manageTags/", {
        method: 'POST',
        body: formData,
      })
        .then((response) => {
          // Handle the response if needed
          console.log('Form data submitted successfully');
        })
        .catch((error) => {
          // Handle any errors that occur during the submission
          console.error('Form submission error:', error);
        });
    };
    handleSelfDestruct = () => {
      ReactDOM.createRoot(document.getElementById('tagContainer')).unmount()
      document.getElementById('select_tag').value = 'default'
    }

      render() {
      return (
        <div style={styles.overlay}>
          <div style={styles.box}>
            {this.props.mode === 'create' && (
              <div>
                <button onClick={this.handleSelfDestruct}>Close</button>
                <h3>Input New Tag:</h3>
                <form onSubmit={this.handleSubmit}>
                  <input type="text" placeholder="Name..."></input>
                  <button type='submit'>Submit</button>
                </form>
              </div>
            )}
          </div>
        </div>
      );
    }
  }
