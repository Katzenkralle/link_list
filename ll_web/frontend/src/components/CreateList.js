import React, { Component } from 'react';
import ManageTags from './ManageTags'
import ReactDOM from 'react-dom/client';
export default class CreateList extends Component {
    constructor(props) {
      super(props);
    }
  
    handleSubmit = (event) => {
      event.preventDefault(); // Prevent the default form submission
      // Perform any additional logic or data manipulation here
  
      // Send the form data to a different URL using AJAX/fetch
      const formData = new FormData(event.target);
      
  
      fetch("api/createList/", {
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
  
    tagField = () => {
      return (
        <select id='select_tag'>
          <option value="default" >Default</option>
          {this.props.tag_names.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
           <option onClick={() => {ReactDOM.createRoot(document.getElementById("tagContainer")).render(<ManageTags mode='create'/>)}}>Create New Tag</option>
        </select>
      );
    };
  
    render() {
      return (
        <div>
          <form onSubmit={this.handleSubmit}>
            <input type="text" placeholder="Name..." id="list_name" name="list_name" />
            <input type="color" id="list_color" name="list_color" />
            {this.tagField()}
            <button type="submit">Submit</button>
          </form>
        </div>
      );
    }
  }
