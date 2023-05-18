import React, { useEffect, useState } from 'react';
import CreateList from './CreateList';
import ReactDOM from 'react-dom/client';
import ManageTags from './ManageTags';

function Settings() {
  // Fetch Data
  const [metaTags, setMetaTags] = useState([]);
  const [metaLists, setMetaLists] = useState([]);

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
    if (document.getElementById("input_tag_name").value == 'default'){
      return
    }

    // Send the form data to a different URL using AJAX/fetch
    const formData = new FormData(event.target);
    formData.append("csrfmiddlewaretoken", document.querySelector('[name=csrfmiddlewaretoken]').value)
    formData.append("tag_name", document.getElementById("input_tag_name").value)
    formData.append("action", 'del')
    fetch("api/manageTags/", {
      method: 'POST',
      body: formData,
    })
      .then((response) => {
        // Handle the response if needed
        console.log('Form data submitted successfully');
        updateData()
      })
      .catch((error) => {
        // Handle any errors that occur during the submission
        console.error('Form submission error:', error);
      });
  };


  return (
    <div className='main_contend'>
      <div>
      <div id='tagContainer'></div>
        <h1>Settings</h1>
        <h3>Tag management:</h3>
        <form onSubmit={(e) => handleTagSubmit(e)}>
          <label htmlFor="input_tag_name">Delete Tag:</label>
          <select id='input_tag_name'>
            <option value="default">None</option>
            {metaTags.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <button type='submit'>Delete!</button>
        </form>
        <button onClick={() => {
          ReactDOM.createRoot(document.getElementById("tagContainer")).render(
            <ManageTags mode='create' update_data={updateData}/>
          );
        }}>New Tag</button>
        <h3>Other:</h3>
        
      </div>
    </div>
  );
}

export default Settings;
