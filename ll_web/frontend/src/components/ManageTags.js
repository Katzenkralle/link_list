import React, { Component } from 'react';
import ReactDOM from 'react-dom/client';

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

    handleSelfDestruct = () => {
      document.getElementById("select_tag").value = "default"
      ReactDOM.createRoot(document.getElementById('tagContainer')).unmount()
      //document.getElementById('select_tag').value = 'default'
    }

    handleSubmit = (event) => {
      event.preventDefault(); // Prevent the default form submission
      // Perform any additional logic or data manipulation here
  
      // Send the form data to a different URL using AJAX/fetch
      const formData = new FormData(event.target);
      formData.append("csrfmiddlewaretoken", document.querySelector('[name=csrfmiddlewaretoken]').value)
      formData.append("tag_name", document.getElementById("input_tag_name").value)
      formData.append("action", 'add')
      fetch("api/manageTags/", {
        method: 'POST',
        body: formData,
      })
        .then((response) => {
          // Handle the response if needed
          console.log('Form data submitted successfully');
          this.props.update_data()
          this.handleSelfDestruct()
        })
        .catch((error) => {
          // Handle any errors that occur during the submission
          console.error('Form submission error:', error);
        });
    };

      render() {
      return (
        <div style={styles.overlay}>
          <div style={styles.box}>
            {this.props.mode === 'create' && (
              <div>
                <button onClick={this.handleSelfDestruct}>Close</button>
                <h3>Input New Tag:</h3>
                <form onSubmit={(e) => {this.handleSubmit(e)}}>
                  <input type="text" id="input_tag_name" placeholder="Name..."></input>
                  <button type="submit">Submit</button>
                </form>
              </div>
            )}
          </div>
        </div>
      );
    }
  }
