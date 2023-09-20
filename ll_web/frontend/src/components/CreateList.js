import React, { Component } from 'react';
import CreateTags from './CreateTags'
import ReactDOM from 'react-dom/client';

//TODO: (Maby) change to functional component

export default class CreateList extends Component {
    constructor(props) {
      super(props);
    }
  
    handleListSubmit = (event) => {
      //send contest of form field and selectet tag to api for listcreation
      //if succesfull update data, shortly display message else display error message 
      // Prevent the default form submission
      event.preventDefault(); 
      
      const formData = new FormData(event.target);
      formData.append("csrfmiddlewaretoken", document.querySelector('[name=csrfmiddlewaretoken]').value)
      formData.append("list_tag", document.getElementById('select_tag').value)

      fetch("api/manageLists/", {
        method: 'POST',
        body: formData,
      })
        .then((response) => {
          // Handle the response if needed
          if (response.status == 406){
            document.getElementById('list_creation_msg').innerHTML = "An Error occurred!"
          }
          else {
            this.props.update_data()
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
      //Arrow function just to simplify code
      //Option Create New Tag spawns CreateTags component in tagContainer (see HomePage)
      return (
        <select id='select_tag'>
          <option value="Default" >Default</option>
          {this.props.tag_names.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
           <option onClick={() => {ReactDOM.createRoot(document.getElementById("tagContainer")).render(<CreateTags mode='create' update_data={this.props.update_data}/>)}}>Create New Tag</option>
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
            <button type="submit">Create List</button>
          </form>
          <div id="list_creation_msg"></div>
        </div>
      );
    }
  }
