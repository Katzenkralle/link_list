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
      formData.append("tag", document.getElementById('tag').value)

      fetch("linkListApi/lists/", {
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
        <select className='inputElement mx-1' 
        id='tag'>
          <option value="Default" >Default</option>
          {this.props.tag_names.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
           <option onClick={() => {ReactDOM.createRoot(document.getElementById("tagContainer")).render(<CreateTags mode='create' update_data={this.props.update_data}/>)}}>Create new Tag</option>
        </select>
      );
    };
  
    render() {
      return (
        <div className='flex flex-col'>
          <form onSubmit={(e) => {this.handleListSubmit(e)}} className='flex flex-wrap items-center justify-center'>
            <input type="text" placeholder="Name..." id="name" name="name" className='inputElement mx-1 my-1' />
            <input type="color" id="color" name="color" className='inputElement mx-1'/>
            {this.tagField()}
            <button type="submit" className='inputElement mx-1'>Create List</button>
          </form>
          <div id="list_creation_msg" className='text-purple-700 mx-auto mb-1'></div>
        </div>
      );
    }
  }
