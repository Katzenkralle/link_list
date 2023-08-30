import React, {useEffect, useState } from 'react';
import CreateTags from './CreateTags'
import ReactDOM from 'react-dom/client';


function CreateList(props) {
    const [newListTag, setNewListTag] = useState(["Default"]);

    useEffect(() => {
      if(newListTag == "create_new_list_90894390821"){
      setNewListTag("Default")
      ReactDOM.createRoot(document.getElementById("tagContainer")).render(<CreateTags mode='create' update_data={props.update_data}/>)
    }
    }, [newListTag]);

    const handleListSubmit = (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      formData.append("csrfmiddlewaretoken", document.querySelector('[name=csrfmiddlewaretoken]').value)
      formData.append("list_tag", document.getElementById("select_tag").value)

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
            props.update_data()
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

    return (
      <div>
        <form onSubmit={(e) => {handleListSubmit(e)}}>
          <input type="text" placeholder="Name..." id="list_name" name="list_name" />
          <input type="color" id="list_color" name="list_color" />

          <select id='select_tag' onChange={() => {setNewListTag(document.getElementById("select_tag").value )}}>
            <option value="Default" >Default</option>
            {props.tag_names.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
            <option key={"create_new_list_90894390821"} value={"create_new_list_90894390821"}>Create New Tag</option>
          </select>

          <button type="submit">Create List</button>
        </form>
        <div id="list_creation_msg"></div>
      </div>
      );
  }
export default CreateList;