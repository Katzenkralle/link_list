import React, { Component } from 'react';
import ReactDOM from 'react-dom/client';

export default class CreateTags extends Component {
    constructor(props) {
      super(props);
    }
    //TODO: (Maby) change to functional component
    //TODO: props.mode is useless
    //TODO: (Maby) add error handling

    handleSelfDestruct = () => {
      document.getElementById("select_tag").value = "Default"
      ReactDOM.createRoot(document.getElementById('tagContainer')).unmount()
      //This will rais an error, this is expected
    }
    handleSubmit = (event) => {
      //send Tags name to create to api, action = 'add' needet for manageTags to work
      //Prevent default form submission
      event.preventDefault(); 

      const formData = new FormData(event.target);
      formData.append("csrfmiddlewaretoken", document.querySelector('[name=csrfmiddlewaretoken]').value)
      formData.append("tag_name", document.getElementById("input_tag_name").value)
      formData.append("action", 'add')
      fetch("linkListApi/manageTags/", {
        method: 'POST',
        body: formData,
      })
        .then((response) => {
          console.log('Form data submitted successfully');
          this.props.update_data()
          this.handleSelfDestruct()
        })
        .catch((error) => {
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
