import React, { Component } from 'react';
import ReactDOM from 'react-dom/client';

export default class CreateTags extends Component {
    constructor(props) {
      super(props);
    }

    handleSelfDestruct = () => {
      document.getElementById("select_tag").value = "Default"
      ReactDOM.createRoot(document.getElementById('tagContainer')).unmount()
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
        <div className='dialog_overlay'>
          <div className='dialog_box'>
            {this.props.mode === 'create' && (
              <div className='main_contend'>
                <button onClick={this.handleSelfDestruct} className='alinge_right'>Close</button>
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
