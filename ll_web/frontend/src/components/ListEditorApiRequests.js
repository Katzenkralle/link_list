
export const updateListData = (calledFromLargeViewer, name, viewMode, setColor, setTag, setContent, setRenderedContent,) => {
    //Updates the list data from api
    //Returns a promise, which resolves when the request is finished, or rejects if there is an error; wait for finish before continuing
    return new Promise((resolve, reject) => {
      if (calledFromLargeViewer == true) {
        //Use different api call if called from large viewer gertting less data, and handeling auth 
        fetch('api/getDataViewerLarge' + window.location.search)
          .then(response => response.json())
          .then(data => {
            // : data.color/.tag in large viewer not always present
            setColor(('color' in data ? data.color : undefined));
            setTag(('tag' in data ? data.tag[0] : undefined));
            setContent(data.content);
          })
          .then(() => {
            if (viewMode !== 'view') {
              setRenderedContent(document.getElementById('list_content').value);
            }
          })
          .then(() => resolve())
          .catch(error => {
            console.error('Error:', error);
            reject();
          });
      } else {
        //Get all data from backend for loged in user
        fetch('api/getMetaHome/')
          .then(response => response.json())
          .then(data => {
            var relevantList = JSON.parse(data.metaLists).find(obj => obj.name === name);
            setColor(relevantList.color);
            setTag(relevantList.tag);
            setContent(relevantList.content);
          })
          .then(() => {
            if (viewMode !== 'view') {
              setRenderedContent(document.getElementById('list_content').value);
            }
          })
          .then(() => resolve())
          .catch(error => {
            console.error('Error:', error);
            reject();
          });
      }
    });
  }


  export const saveList = (id, name, tag, color, content, calledFromLargeViewer, viewMode, setColor, setTag, setContent, setRenderedContent) => {
    //Saves the list, sends a request to the backend, bundeling all changes
    //If error, display error msg, else update data and display info msg shortly
    //Only gets content by id
    const formData = new FormData();
    formData.append("csrfmiddlewaretoken", document.querySelector('[name=csrfmiddlewaretoken]').value)
    formData.append("list_id", id)
    formData.append("list_name", name)
    formData.append("list_tag", tag)
    formData.append("list_color", color)
    formData.append("list_content", content)

    fetch("api/manageLists/", {
      method: 'POST',
      body: formData,
    })
      .then((response) => {
        // Handle the response if needed
        if (response.status == 406){
          document.getElementById('list_edit_msg').innerHTML = "An Error occurred!"
        }
        else {
          updateListData(calledFromLargeViewer, name, viewMode, setColor, setTag, setContent, setRenderedContent)
          document.getElementById('list_edit_msg').innerHTML = "Operation Successful";
        }
        //Resets previously set innerHTML info msg (after 5s)
        setTimeout(() => {  document.getElementById('list_edit_msg').innerHTML = '';}, 5000);
        
      })
      .catch((error) => {
        // Handle any errors that occur during the submission
        console.log("err")
        console.error('Form submission error:', error);
      });
  }

export const deleteList = () => {
    //Deletes the list, sends a request to the api
    //Uses del as color to signal deletion possible because normaly color can only be set to hex
    //If error, display error msg, else exit editor
    const formData = new FormData();
    formData.append("csrfmiddlewaretoken", document.querySelector('[name=csrfmiddlewaretoken]').value)
    formData.append("list_name", name)
    formData.append("list_color", 'del')

    fetch("api/manageLists/", {
      method: 'POST',
      body: formData,
    })
      .then((response) => {
        // Handle the response if needed
        if (response.status == 406){
          document.getElementById('list_edit_msg').innerHTML = "An Error occurred!"
          setTimeout(() => {  document.getElementById('list_edit_msg').innerHTML = '';}, 5000);
        }
        else {
             //if sucsess, exit editor window
             exitEditor()         
        }          
      })
      .catch((error) => {
        // Handle any errors that occur during the submission
        console.log("err")
        console.error('Form submission error:', error);
      });
  }