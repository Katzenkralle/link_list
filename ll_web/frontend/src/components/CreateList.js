import React, { Component } from 'react';
import ManageTags from './ManageTags'
import ReactDOM from 'react-dom/client';
export default class CreateList extends Component {
    constructor(props) {
      super(props);
    }
  
    handleListSubmit = (event) => {
      event.preventDefault(); // Prevent the default form submission
      // Perform any additional logic or data manipulation here
  
      // Send the form data to a different URL using AJAX/fetch
      const formData = new FormData(event.target);
      formData.append("csrfmiddlewaretoken", document.querySelector('[name=csrfmiddlewaretoken]').value)
      formData.append("list_tag", document.getElementById('select_tag').value)

      fetch("api/createList/", {
        method: 'POST',
        body: formData,
      })
        .then((response) => {
          // Handle the response if needed
          if (response.status == 406){
            document.getElementById('list_creation_msg').innerHTML = "An Error occurred!"
          }
          else {
            document.getElementById('list_creation_msg').innerHTML = "List Sucessfully created!";
          }
        })
        .catch((error) => {
          // Handle any errors that occur during the submission
          console.log("err")
          console.error('Form submission error:', error);
        });
      setTimeout(() => {  document.getElementById('list_creation_msg').innerHTML = '' }, 5000);
    };
  
    tagField = () => {
      return (
        <select id='select_tag'>
          <option value="default" >Default</option>
          {this.props.tag_names.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
           <option onClick={() => {ReactDOM.createRoot(document.getElementById("tagContainer")).render(<ManageTags mode='create' update_data={this.props.update_data}/>)}}>Create New Tag</option>
        </select>
      );
    };
  
    render() {
      return (
        <div>
          <form onSubmit={(e) => {this.handleListSubmit(e)}}>
            <input type="text" placeholder="Name..." id="list_name" name="list_name" />
            <input type="color" id="list_color" name="list_color" />
            {this.tagField()}
            <button type="submit">Submit</button>
          </form>
          <div id="list_creation_msg"></div>
        </div>
      );
    }
  }
