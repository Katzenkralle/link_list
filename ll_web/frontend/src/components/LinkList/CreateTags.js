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
        <div className="overlay">
        <div className="absolute top-1/2 left-1/2 text-white transform -translate-x-1/2 -translate-y-1/2 bg-gray-700 h-40 w-80 justify-center flex rounded-md">
          {this.props.mode === 'create' && (
            <div> 
              <button onClick={this.handleSelfDestruct} className="inputElement flex ml-auto mr-1 my-1 ">Close</button>
              <div className="flex justify-center items-center flex-col">
                <h3 className="infoHl my-1">Input New Tag:</h3>
                <form onSubmit={(e) => { this.handleSubmit(e) }}>
                  <input
                    type="text"
                    id="input_tag_name"
                    placeholder="Name..."
                    className="inputElement"
                  ></input>
                  <button type="submit" className="inputElement ml-1">Submit</button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      );
    }
  }
