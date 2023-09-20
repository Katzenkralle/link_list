import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import CreateTags from './CreateTags';
import ConfirmDialog from './ConfirmDialog'

function Settings() {
  //TODO: Add a way to change the password
  //TODO: Layout and style

  const [metaTags, setMetaTags] = useState([]);
  const [metaLists, setMetaLists] = useState([]);

  const fetchData = () => {
    //get data about the tags and lists from api

    fetch('api/getMetaHome/')
      .then(response => response.json())
      .then(data => {
        setMetaTags(JSON.parse(data.metaTags))
        setMetaLists(JSON.parse(data.metaLists));
      })
      .catch(error => console.error('Error:', error));
  };

  useEffect(() => {
    fetchData();
    // fetch at load
  }, []);


const deleteTag = (event) => {
    //Get the tag name from the event, and send it to the backend for deleation
    //Refetch the data after deleation, show short error message on failure
    //Prevent the default form submission
    event.preventDefault(); 
    if (document.getElementById("select_tag").value == 'default'){
      return
    }

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
          fetchData()
        }
        else {
          document.getElementById('settings_tag_msg').innerHTML = 'Error, the Tag is proabably used by a list!'
        }
        setTimeout(() => {  document.getElementById('settings_tag_msg').innerHTML = '';}, 5000);
      })
      .catch((error) => {
        console.error('Form submission error:', error);
      });
  };


const deleteAccount = (usrInput) => {
  // If user confirms, send a request to the api to delete the account
  // If the request is successful, redirect to the login page, else show an error message
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

const handelListPublication = (concernedList) => {
  // Send a request to the api to change the publication status of a list
  // Asynchronous because it needs to wait for the response before refetching the data, data only needs to be refetched
  // when creating or deleting a publication, not updating readonly
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("csrfmiddlewaretoken", document.querySelector('[name=csrfmiddlewaretoken]').value)
    formData.append('list', concernedList.name)
    formData.append('readonly', concernedList.isReadonly == true ? true : concernedList.isReadonly == false ? 'writable' : 'false')
    formData.append('passwd', concernedList.passwd)
    fetch("api/listPublicationChanges/", {
      method: 'POST',
      body: formData,
    })
      .then((response) => resolve())
      .catch((error) => reject())
    })
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
          <form onSubmit={(e) => deleteTag(e)}>
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
              <CreateTags mode='create' update_data={fetchData}/>
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

        <div>
          <form>
            <label htmlFor='selectPublishList'>Select a list to Publish:</label>
            <select id='selectPublishList'>
            {metaLists.map((list) =>
              list.is_public === "False" ? (
                <option key={list.name} value={list.name}>
                  {list.name}
                </option>
              ) : null
            )}
          </select>

            <label htmlFor='publishListMode'>Readonly?</label>
            <input type="checkbox" id='publishListMode' defaultChecked/>
            <input type='password' id='publishListPasswd' placeholder='Password (optional)'/>
            <button onClick={async (e) => {e.preventDefault();
                            await handelListPublication({'name': document.getElementById('selectPublishList').value,
                                                          'isReadonly': document.getElementById('publishListMode').checked,
                                                          'passwd': document.getElementById('publishListPasswd').value})
                            fetchData()}}>Submit</button>
          </form>

            <table>
              <thead>
              <tr>
                <th>List Name</th>
                <th>URL</th>
                <th>Readonly?</th>
                <th>Password?</th>
                <th>Remove from public</th>
              </tr>
              </thead>
              <tbody>
              {metaLists.map((list) =>
              list.is_public !== "False" ? (
              <tr>
                <th>{list.name}</th>
                <th>{(window.location.origin + list.url)}</th>
                <th><input id={`${list.name}_cb`} type="checkbox" defaultChecked={list.is_public === 'r'} 
                      onChange={(e) => {handelListPublication({'name':list.name, 'isReadonly': e.target.checked})}} /></th>
                <th><p>{list.has_passwd ? 'Password protected.' : 'No Password set!'}</p></th>
                <th><button id={`${list.name}_del`} 
                    onClick={async () => {
                      await handelListPublication({ name: list.name, isReadonly: 'del' });
                      fetchData();
                    }}
                    >Make private</button></th>
              </tr>
              ) : null
            )}
              </tbody>
            </table>
        </div>
        <div id='tagContainer'></div>
      </div>
    
  );
}

export default Settings;
