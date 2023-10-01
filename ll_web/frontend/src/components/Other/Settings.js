import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import CreateTags from '../LinkList/CreateTags';
import ConfirmDialog from './ConfirmDialog'

function Settings() {
  //TODO: Add a way to change the password
  //TODO: Layout and style

  const [metaTags, setMetaTags] = useState([]);
  const [metaLists, setMetaLists] = useState([]);
  const [weatherProfile, setWeatherProfile] = useState({ 'locations': {} });

  const linkListFetchData = () => {
    //get data about the tags and lists from api

    fetch('linkListApi/getMetaHome/')
      .then(response => response.json())
      .then(data => {
        setMetaTags(JSON.parse(data.metaTags))
        setMetaLists(JSON.parse(data.metaLists));
      })
      .catch(error => console.error('Error:', error));
  };

  useEffect(() => {
    linkListFetchData();
    weatherFetchData();
    // fetch at load
  }, []);


  const deleteTag = (event) => {
    //Get the tag name from the event, and send it to the backend for deleation
    //Refetch the data after deleation, show short error message on failure
    //Prevent the default form submission
    event.preventDefault();
    if (document.getElementById("select_tag").value == 'default') {
      return
    }

    const formData = new FormData(event.target);
    formData.append("csrfmiddlewaretoken", document.querySelector('[name=csrfmiddlewaretoken]').value)
    formData.append("tag_name", document.getElementById("select_tag").value)
    formData.append("action", 'del')
    fetch("linkListApi/manageTags/", {
      method: 'POST',
      body: formData,
    })
      .then((response) => {
        // Handle the response if needed
        if (response.status == 202) {
          linkListFetchData()
        }
        else {
          document.getElementById('settings_tag_msg').innerHTML = 'Error, the Tag is proabably used by a list!'
        }
        setTimeout(() => { document.getElementById('settings_tag_msg').innerHTML = ''; }, 5000);
      })
      .catch((error) => {
        console.error('Form submission error:', error);
      });
  };

  const setErrorMsg = (msg) => {
    // Set the error message in the settings page
    document.getElementById('errorMsg').innerHTML = msg
    setTimeout(() => { document.getElementById('errorMsg').innerHTML = ''; }, 5000);
  }

  const deleteAccount = (usrInput) => {
    // If user confirms, send a request to the api to delete the account
    // If the request is successful, redirect to the login page, else show an error message
    if (usrInput != true) {
      return
    } else {
      const formData = new FormData();
      formData.append("csrfmiddlewaretoken", document.querySelector('[name=csrfmiddlewaretoken]').value)
      formData.append("action", 'account_removal')

      fetch("otherApi/accountCreation/", {
        method: 'POST',
        body: formData,
      })
        .then((response) => {
          switch (response.status) {
            case 204: setErrorMsg("This should never happen"); break;
            case 201: window.location.href = '/login'; break;
          }
        })
        .catch((error) => {
          setErrorMsg("This should never happen:" + error);
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
      fetch("linkListApi/listPublicationChanges/", {
        method: 'POST',
        body: formData,
      })
        .then((response) => resolve())
        .catch((error) => reject())
    })
  }

  const weatherProfileSetLocations = (mode, locationName, lat, lon, api_key) => {

    const formData = new FormData();
    formData.append("csrfmiddlewaretoken", document.querySelector('[name=csrfmiddlewaretoken]').value)
    formData.append('mode', mode)
    formData.append('location_name', locationName)
    formData.append('lat', lat)
    formData.append('lon', lon)
    formData.append('api_key', api_key)

    fetch("weatherApi/settings/", {
      method: 'POST',
      body: formData,
    })
    .then(response => response.json())
    .then(data => {
      if (data.error != "none"){
        throw new Error(data.error)
      }; // Accessing the 'error' property
      weatherFetchData();

      if (mode == 'add'){
      document.getElementById("newLocationName").value = "";
      document.getElementById("newLocationLat").value = "";
      document.getElementById("newLocationLon").value = "";
      }
      })
      .catch((error) => {
        setErrorMsg(error);
      });
  }



  const weatherFetchData = () => {
    //get data about the tags and lists from api

    fetch('weatherApi/settings/')
      .then(response => response.json())
      .then(data => {
        setWeatherProfile(data.profile)
      })
      .catch(error => console.error(error));
  };



  return (
    <div className='flex flex-col dark:text-white'>


      <div className='m-auto'>
        <h1 className='mainHl'>Settings</h1>
      </div>

      <div className='flex flex-col'>
        <div className='m-auto'>
          <h1 className='mainHl'>Link Lists</h1>
          <h3 className='infoHl'>Tag management:</h3>
          <form onSubmit={(e) => deleteTag(e)}>
            <label htmlFor="select_tag">Delete Tag:</label>

            <select className='inputElement mx-1' id='select_tag'>
              <option value="default">None</option>
              {metaTags.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>

            <button className='inputElement mx-1' type='submit'>Delete!</button>
          </form>

          <button
            className='inputElement'
            onClick={() => {
              ReactDOM.createRoot(document.getElementById("tagContainer")).render(
                <CreateTags mode='create' update_data={linkListFetchData} />
              );
            }}>New Tag</button>





          <h3 className='infoHl mt-2'>Publicate a List</h3>
          <div className=''>
          <table className='table-auto w-full bg-gray-700 border-2 border-gray-500 mt-1'>
            <thead>
              <tr className='border-solid border-b-2 border-gray-500'>
                <th className='tableElement'>List Name</th>
                <th className='tableElement'>URL</th>
                <th className='tableElement'>Readonly?</th>
                <th className='tableElement'>Password?</th>
                <th className='tableElement'>X</th>
              </tr>
            </thead>
            <tbody>
              {metaLists.map((list) =>
                list.is_public !== "False" ? (
                  <tr>
                    <th className='tableElement'>{list.name}</th>
                    <th className='tableElement'>{(window.location.origin + list.url)}</th>
                    <th className='tableElement'>
                      <input
                        className='inputElement'
                        id={`${list.name}_cb`} type="checkbox" defaultChecked={list.is_public === 'r'}
                        onChange={(e) => { handelListPublication({ 'name': list.name, 'isReadonly': e.target.checked }) }} /></th>
                    <th className='tableElement'>{list.has_passwd ? 'Password protected.' : 'No Password set!'}</th>
                    <th className='tableElement'>
                      <button
                        className='inputElement'
                        id={`${list.name}_del`}
                        onClick={async () => {
                          await handelListPublication({ name: list.name, isReadonly: 'del' });
                          linkListFetchData();
                        }}
                      >Make private</button></th>
                  </tr>
                ) : null
              )}

            </tbody>
          </table>
          </div> 
          
          <form my-1 flex justify-center flex-wrap>
            <label htmlFor='selectPublishList' className='mt-1'>Select a list to Publish:</label>
            <select className='max-w-[10em] inputElement mx-1 mt-1'
            id='selectPublishList'>
            {metaLists.map((list) =>
              list.is_public === "False" ? (
                <option key={list.name} value={list.name}>
                  {list.name}
                </option>
              ) : null
            )}
          </select>
            <label htmlFor='publishListMode' className='mx-1 mt-1'>Readonly?</label>
            <input className='mx-1' type="checkbox" id='publishListMode' defaultChecked/>
            <input className='inputElement mx-1 mt-1' type='password' id='publishListPasswd' placeholder='Password (optional)'/>
            <button className='inputElement mx-1 mt-1'
            onClick={async (e) => {e.preventDefault();
                            await handelListPublication({'name': document.getElementById('selectPublishList').value,
                                                          'isReadonly': document.getElementById('publishListMode').checked,
                                                          'passwd': document.getElementById('publishListPasswd').value})
                            fetchData()}}>Submit</button>
          </form>

        </div>
        
        
          

      </div>

      <div className='flex flex-col'>
        <div className='m-auto'>
          <h3 className='mainHl'>Wee-Wee</h3>
          
            <table className='table-auto w-full bg-gray-700 border-2 border-gray-500 mt-1'>
              <thead>
                <tr className='border-solid border-b-2 border-gray-500'>
                  <th className='tableElement'>Location Name</th>
                  <th className='tableElement'>Latitude</th>
                  <th className='tableElement'>Logitude</th>
                  <th className='tableElement'> X </th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(weatherProfile.locations).map(([key, value]) => (
                  <tr key={key} className=''>
                    <th className='tableElement ' 
                      style={key == weatherProfile.default_location? {color: "green"} : {}}>
                        <button className='truncate max-w-[10em]' 
                        onClick={() => weatherProfileSetLocations("set_default", key)}>
                          {key}</button>
                        </th>
                    <th className='tableElement'>{value[0]}</th>
                    <th className='tableElement'>{value[1]}</th>
                    {!weatherProfile.uneditable_locations.includes(key) ?
                      <th> <button className='inputElement'
                        onClick={() => { weatherProfileSetLocations('del', key) }}>Delete</button>
                      </th> : null}
                  </tr>
                ))
                }
                
              </tbody>
            </table>

            <div className='flex flex-wrap justify-center'>
                  <input type="text" id="newLocationName" className='inputElement my-1 mx-1' placeholder='New Location..' />
                  <input type="text" id="newLocationLat" className='inputElement my-1 mx-1' placeholder='Latitude..' />
                  <input type="text" id="newLocationLon" className='inputElement my-1 mx-1' placeholder='Longitude..' />
                
                  <button className='inputElement my-1 mx-1'
                      onClick={() => {
                        weatherProfileSetLocations('add',
                          document.getElementById('newLocationName').value,
                          document.getElementById('newLocationLat').value, document.getElementById('newLocationLon').value)
                      }}>Add</button>
                  </div>
               
        

          <h3 className='infoHl mt-2'>Weather API Key:</h3>
          {weatherProfile.has_api_key ?
            <button className='inputElement' 
              onClick={() => weatherProfileSetLocations("set_api_key")}>Unset Api Key</button> 
            : <div className='flex flex-wrap'>
              <input className='inputElement' id="weatherApiKey" placeholder='Api Key..' />
              <button className='inputElement'
                onClick={() => {weatherProfileSetLocations('set_api_key', undefined, undefined, undefined, document.getElementById('weatherApiKey').value)}}
              >Set</button>
              <a href="https://home.openweathermap.org/api_keys" className='text-blue-600 ml-4'>Get an API Key -&gt;</a>
            </div>
            }
        </div>
      </div>

      <div className='centerRow'>
        <div>
          <h3 className='mainHl'>Other:</h3>
          <div className=''>
            <button
              className='inputElement'
              onClick={() => {
                {
                  ReactDOM.createRoot(document.getElementById("tagContainer")).render(<ConfirmDialog
                    onConfirmation={(e) => { deleteAccount(e) }} question="Do you realy want to delete your Account?" trueBtnText="Delete!" falseBtnText="Go Back!" />)
                }
              }}>Delead Account</button>
          </div>
        </div>
      </div>

      <div id='tagContainer'></div>
      <div id='errorMsg' className='text-rose-700'></div>
    </div>

  );
}

export default Settings;
