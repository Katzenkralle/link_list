import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import CreateTags from '../LinkList/CreateTags';
import ConfirmDialog from './ConfirmDialog'
import TopBar from './TopBar';
import BottomBar from './BottomBar';
import LoadingAnimation from './LoadingAnimation';

function Settings() {
  //TODO: Add a way to change the password
  //TODO: Layout and style

  const [metaTags, setMetaTags] = useState([]);
  const [metaLists, setMetaLists] = useState([]);
  const [weatherProfile, setWeatherProfile] = useState({ 'locations': {} });

  const linkListFetchData = () => {
    //get data about the tags and lists from api
    return new Promise((resolve, reject) => {
    fetch('linkListApi/lists/')
      .then(response => response.json())
      .then(data => {
        setMetaTags(data.metaTags)
        setMetaLists(data.metaLists);
        resolve()
      })
      .catch(error => {console.error('Error:', error); reject()});
    }
    )
  };

  useEffect(() => {
    document.getElementById('loadingAnimation').style.display = '';

    Promise.all([linkListFetchData(), weatherFetchData()])
      .finally(() => {document.getElementById('loadingAnimation').style.display = 'none';})
    

    // fetch at load
  }, []);


  const deleteTag = (event) => {
    //Get the tag name from the event, and send it to the backend for deleation
    //Refetch the data after deleation, show short error message on failure
    //Prevent the default form submission
    event.preventDefault();
    if (document.getElementById("tag").value == 'Default') {
      return
    }

    const formData = new FormData(event.target);
    formData.append("csrfmiddlewaretoken", document.querySelector('[name=csrfmiddlewaretoken]').value)
    formData.append("tag", document.getElementById("tag").value)
    formData.append("action", 'del')
    formData.append("mode", 'tag')
    fetch("linkListApi/listProfileManager/", {
      method: 'POST',
      body: formData,
    })
      .then((response) => {
        // Handle the response if needed
        if (response.status == 202) {
          linkListFetchData()
        }
        else {
          ReactDOM.createRoot(document.getElementById("tagContainer")).render(<ConfirmDialog question={"This Tag is still in use!"} falseBtnText={"Ok"} trueBtnText={"To Somnia Notas"}
          onConfirmation={(userInput) => {userInput ? window.location.href = "/linkList" : null}}/>)
        }

      })
      .catch((error) => {
        console.error('Form submission error:', error);
      });
  };


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
            case 204: throw new Error("This should never happen!"); break;
            case 201: window.location.href = '/login'; break;
          }
        })
        .catch((error) => {
          ReactDOM.createRoot(document.getElementById("tagContainer")).render(
            <ConfirmDialog question={"This should never happen!"} falseBtnText={"The world"} trueBtnText={"is a bad place"}/>)
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
      Object.entries(concernedList.list).forEach(([key, value]) => {
        formData.append(key, value);
      });
      formData.append('read_only', concernedList.isReadonly == true ? true : concernedList.isReadonly == false ? 'rw' : 'false')
      formData.append('passwd', concernedList.passwd)
      fetch("linkListApi/lists/", {
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
        if (data.error != "none") {
          throw new Error(data.error)
        }; // Accessing the 'error' property
        weatherFetchData();

        if (mode == 'add') {
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
    return new Promise((resolve, reject) => {
    fetch('weatherApi/settings/')
      .then(response => response.json())
      .then(data => {
        setWeatherProfile(data.profile)
        return resolve()
      })
      .catch(error => {console.error(error); return reject()});
    }
    )
  };

const tagManagmet = () => {
  return (
    <div className='mx-auto mt-3'>
          <h3 className='infoHl'>Tag management:</h3>

          <form className='flex flex-wrap mt-1' onSubmit={(e) => deleteTag(e)}>
  
            <select className='inputElement mx-1' id='tag'>
              <option value="default">None</option>
              {metaTags.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <button className='inputElement mx-1' type='submit'>Delete!</button>

            <button
            className='inputElement ml-auto'
            onClick={() => {
              ReactDOM.createRoot(document.getElementById("tagContainer")).render(
                <CreateTags mode='create' update_data={linkListFetchData} />
              );
            }}>New Tag</button>

          </form>
        </div>
  )
}

const listPublicationTable = () => {
  return (
    <div className='mx-auto mt-3'>
      <h3 className='infoHl mt-2'>Share a List</h3>
      <div className='overflow-x-auto'>
        <table className='table-auto min-w-full bg-cat-surface border-2 border-cat-borderInactive mt-1 overflow-scroll'>
          {window.window.screen.width > 768 ? (
            <>
              <thead>
                <tr className='border-solid border-b-2 border-cat-borderInactive'>
                  <th className='tableElement'>List Name</th>
                  <th className='tableElement'>URL</th>
                  <th className='tableElement'>Read-only?</th>
                  <th className='tableElement'>Password?</th>
                  <th className='tableElement'>X</th>
                </tr>
              </thead>
              <tbody>
                {metaLists.map((list) =>
                  list.public_list !== 'false' ? (
                    <tr key={list.name}>
                      <th className='tableElement'>{list.name}</th>
                      <th className='tableElement'><a href={window.location.origin + list.url}
                                                      className='link'>
                                                    {(window.location.origin + list.url)}</a></th>
                      <th className='tableElement'>
                        <input
                          className='inputElement'
                          id={`${list.name}_cb`}
                          type="checkbox"
                          defaultChecked={list.public_list === 'r'}
                          onChange={(e) => { handelListPublication({ 'list': list, 'isReadonly': e.target.checked }) }}
                        />
                      </th>
                      <th className='tableElement'>{list.public_list_passwd ? 'Password protected.' : 'No Password set!'}</th>
                      <th className='tableElement'>
                        <button
                          className='inputElement'
                          id={`${list.name}_del`}
                          onClick={async () => {
                            await handelListPublication({ list: list, isReadonly: 'del' });
                            linkListFetchData();
                          }}
                        >Make private</button>
                      </th>
                    </tr>
                  ) : null
                )}
              </tbody>
            </>
          ) : (
            <>
              <thead>
                <tr className='border-solid border-b-2 border-gray-500'>
                  <th className='tableElement'>Name/Info</th>
                  <th className='tableElement'>Readonly?</th>
                </tr>
              </thead>
              <tbody>
                {metaLists.map((list) =>
                  list.public_list !== 'false' ? (
                    <tr key={list.name}>
                      <th className='tableElement'>
                        <button
                          className='inputElement mx-1 mt-1'
                          onClick={() => {
                            ReactDOM.createRoot(document.getElementById("tagContainer")).render(
                              <ConfirmDialog
                                onConfirmation={async (user_input) => {if (user_input) {
                                  await handelListPublication({ list: list, isReadonly: 'del' });
                                  linkListFetchData();
                                }}
                                }
                                question={window.location.origin + list.url}
                                trueBtnText="Make Private"
                                falseBtnText={list.public_list_passwd ? 'Password protected. (Sorry, this is a bodge!)' : 'No Password set! (Sorry, this is a bodge!)'}
                              />
                            )
                          }}
                        >
                          {list.name}
                        </button>
                      </th>
                      <th className='tableElement'>
                        <input
                          className='inputElement'
                          id={`${list.name}_cb`}
                          type="checkbox"
                          defaultChecked={list.public_list === 'r'}
                          onChange={(e) => { handelListPublication({ 'list': list, 'isReadonly': e.target.checked }) }}
                        />
                      </th>
                    </tr>
                  ) : null
                )}
              </tbody>
            </>
          )}
        </table>
      </div>
    </div>
  )
}

const listSelectToPublicate = () => {
  return (
    <div className='my-1 flex flex-wrap mx-auto'>
            <label className='mx-1 my-auto' htmlFor='selectPublishList'>List to publish:</label>
            <select className='max-w-[10em] inputElement mx-1 mt-1'
              id='selectPublishList'>
              {metaLists.map((list) =>
                list.public_list === 'false' ? (
                  <option key={list.name} value={list.id}>
                    {list.name}
                  </option>
                ) : null
              )}
            </select>
            <label className='mx-1 my-auto' htmlFor='publishListMode'>Read-only?</label>
            <input className='mx-1' type="checkbox" id='publishListMode' defaultChecked />
            <input className='inputElement mx-1 mt-1' type='password' id='publishListPasswd' placeholder='Password (optional)' />
            <button className='inputElement mx-1 mt-1'
              onClick={async (e) => {
                e.preventDefault();
                await handelListPublication({
                  'list': metaLists.filter((list) => document.getElementById('selectPublishList').value == list.id)[0],
                  'isReadonly': document.getElementById('publishListMode').checked,
                  'passwd': document.getElementById('publishListPasswd').value
                })
                linkListFetchData()
              }}>Submit</button>
          </div>
        
  )
}

const locationsTable = () => {
  return (
    <div className='overflow-x'>
    <table className='table-auto w-full bg-cat-surface border-2 border-cat-border mt-1 overflow-scroll'>
            <thead>
              <tr className='border-solid border-b-2 border-cat-border'>
                <th className='tableElement'>Location Name</th>
                <th className='tableElement'>Latitude</th>
                <th className='tableElement'>Longitude</th>
                <th className='tableElement'> X </th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(weatherProfile.locations).map(([key, value]) => (
                <tr key={key} className=''>
                  <th className='tableElement '
                    style={key == weatherProfile.default_location ? { color: "green" } : {}}>
                    <button className={`truncate max-w-[10em] ${key == weatherProfile.default_location ? "text-cat-success" : ""}`}
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
          </div>
  )
}

const addLocation = () => {
  return (
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
              <a href="https://www.latlong.net/" className='text-blue-600 ml-4 mt-auto'>Find coordinates →</a>
          </div>
  )
}

const AddWeatherApiKey = () => {
  return (
    weatherProfile.has_api_key ?
      <button className='inputElement'
        onClick={() => weatherProfileSetLocations("set_api_key")}>Unset Api Key</button>
      : <div className='flex flex-wrap'>
        <input className='inputElement' id="weatherApiKey" placeholder='Api Key..' />
        <button className='inputElement'
          onClick={() => { weatherProfileSetLocations('set_api_key', undefined, undefined, undefined, document.getElementById('weatherApiKey').value) }}
        >Set</button>
        <a href="https://home.openweathermap.org/api_keys" className='text-blue-600 ml-4 mt-auto'>Get an API Key →</a>
      </div>
    
  )
}

const removeAccount = () => {
  return (<div className='mx-auto mt-3'>  
  <button
    className='inputElement'
    onClick={() => {
      {
        ReactDOM.createRoot(document.getElementById("tagContainer")).render(<ConfirmDialog
          onConfirmation={(e) => { deleteAccount(e) }} question="Do you realy want to delete your Account?" trueBtnText="Delete!" falseBtnText="Go Back!" />)
      }
    }}>Delead Account</button>

</div>)
}


  return (
    <div className='flex flex-col text-cat-main'>
      <main className='flex flex-col'>
      {TopBar()}
      <div className='mx-auto mt-3'>
        <h1 className='maxHl'>Settings</h1>
      </div>

        
        <h1 className='mainHl mx-auto !mt-5'>Link Lists</h1>
        {tagManagmet()}

        {listPublicationTable()}

        {listSelectToPublicate()}
      
    
      <div className='flex flex-col'>
      <h3 className='mainHl mx-auto !mt-5'>Wee-Wee</h3>
        <div className='mx-auto'>
          {locationsTable()}

          {addLocation()}


          <h3 className='infoHl mt-2'>Weather API Key:</h3>
          {AddWeatherApiKey()}
        </div>
      </div>

      <div className='flex flex-col'>
        <h3 className='mainHl mx-auto !mt-5'>Other:</h3>
        {removeAccount()}
      
      </div>
      <div id='tagContainer'></div>
      <LoadingAnimation/>
      </main>
      {BottomBar()}
    </div>

  );
}

export default Settings;
