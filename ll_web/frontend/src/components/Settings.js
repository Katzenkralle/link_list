import React, { useEffect, useState } from 'react';
import CreateList from './CreateList';
import ReactDOM from 'react-dom/client';
import CreateTags from './CreateTags';
import ConfirmDialog from './ConfirmDialog'

function Settings() {
  // Fetch Data
  const [metaTags, setMetaTags] = useState([]);
  //const [metaLists, setMetaLists] = useState([]);

  const fetchData = () => {
    fetch('api/getMetaHome/')
      .then(response => response.json())
      .then(data => {
        setMetaTags(JSON.parse(data.metaTags));
      })
      .catch(error => console.error('Error:', error));
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateData = () => {
    console.log("Fetching new Data");
    fetchData();
  };
//Delead Tag
const handleTagSubmit = (event) => {
    event.preventDefault(); // Prevent the default form submission
    // Perform any additional logic or data manipulation here
    if (document.getElementById("select_tag").value == 'default'){
      return
    }

    // Send the form data to a different URL using AJAX/fetch
    const formData = new FormData(event.target);
    formData.append("csrfmiddlewaretoken", document.querySelector('[name=csrfmiddlewaretoken]').value)
    formData.append("tag_name", document.getElementById("select_tag").value)
    formData.append("action", 'del')
    fetch("api/manageTags/", {
      method: 'POST',
      body: formData,
    })
      .then((response) => {
        // Handle the response if needed
        if (response.status == 202){
          updateData()
        }
        else {
          document.getElementById('settings_tag_msg').innerHTML = 'Error, the Tag is proabably used by a list!'
        }
        setTimeout(() => {  document.getElementById('settings_tag_msg').innerHTML = '';}, 5000);
      })
      .catch((error) => {
        // Handle any errors that occur during the submission
        console.error('Form submission error:', error);
      });
  };

//Handel Acount Deletion:
const deleteAccount = (usrInput) => {
  if (usrInput != true){
    return
  } else {
    const formData = new FormData();
        formData.append("csrfmiddlewaretoken", document.querySelector('[name=csrfmiddlewaretoken]').value)
        formData.append("action", 'account_removal')

      fetch("api/accountCreation/", {
        method: 'POST',
        body: formData,
      })
        .then((response) => {
          switch (response.status){
            case 204: setCreationMsgInnerHTML("This should never happen"); break;
            case 201: window.location.href = '/login'; break;
          }
        })
        .catch((error) => {
          setCreationMsgInnerHTML("This should never happen:" + error);
        });
  }

}

  return (
    <div>
      <div className="top_bar">
        <button className="alinge_left" onClick={() => window.location.href = "/"}>Home</button>
        <button className="alinge_right" onClick={() => window.location.href = "logout"}>Logout</button>
      </div>
      

        <h1>Settings</h1>

        <div className='box_for_main_contend'>
          <div className='main_contend'>
          <h3>Tag management:</h3>
          <form onSubmit={(e) => handleTagSubmit(e)}>
            <label htmlFor="select_tag">Delete Tag:</label>
            <select id='select_tag'>
              <option value="default">None</option>
              {metaTags.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <button type='submit'>Delete!</button>
          </form>
          <button onClick={() => {
            ReactDOM.createRoot(document.getElementById("tagContainer")).render(
              <CreateTags mode='create' update_data={updateData}/>
            );
          }}>New Tag</button>
          </div>
        </div>

        
        <h3>Other:</h3>
        <div className='box_for_main_contend'>
          <button onClick={() => {
            {ReactDOM.createRoot(document.getElementById("tagContainer")).render(<ConfirmDialog 
              onConfirmation={(e) => {deleteAccount(e)}} question="Do you realy want to delete your Account?" trueBtnText="Delete!" falseBtnText="Go Back!"/>)}
          }}>Delead Account</button>
        </div>
          

        <div id='tagContainer'></div>
      </div>
    
  );
}

export default Settings;
