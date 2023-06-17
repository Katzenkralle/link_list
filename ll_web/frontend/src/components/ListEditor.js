import React, { useEffect, useState, Component, useRef} from 'react';
import ReactDOM from 'react-dom/client';
import renderByLine from './ViewContent';
import '../../static/ViewUserContent.css'
import '../../static/ListEditor.css'


//If done, consider creatin on large if (mode = view){suite}else{suit} instead of many smal ones
//If done, consider moving styles ot a sepet css file

function ListEditor (props){
    //Presets all neaded useStates
    const [viewMode, setViewMode] = useState('view');
    const [content, setContent] = useState(props.content);
    const [tag, setTag] = useState(props.tag);
    const [color, setColor] = useState(props.color);
    const [name, setName] = useState(props.name)

    useEffect(() => {
      //Content needs to be dynamicly updated
      setContent(props.content);
    }, [props.content]);
    
    const handleInsertion = (strToInset) => {
      //Handels insertion of quick formatt buttons at current cursor possition
      //Takes string from preset str in the button element
      const textarea = document.getElementById('list_content');
      const startPos = textarea.selectionStart;
      const endPos = textarea.selectionEnd;

      const currentValue = textarea.value;
      //Inserts string
      const newValue =
        currentValue.substring(0, startPos) +
        strToInset +
        currentValue.substring(endPos);

      //Moves cursor to after str
      textarea.value = newValue;
      textarea.focus();
      textarea.setSelectionRange(startPos + strToInset.length, startPos + strToInset.length);
    };


    const updateListData = () => {
      //Fetches new information abou selected list from backend (only after changes saved)
      //and updates the useState of Color, Tag, Content
      fetch('api/getMetaHome/')
      .then(response => response.json())
      .then(data => {var relevantList = JSON.parse(data.metaLists).find(obj => obj.name === name);//.find needet becaus backend returns all lists from the user; Finds by list name
                     setColor(relevantList.color); setTag(relevantList.tag); setContent(relevantList.content)}) //console.log(data.metaTags)
      .catch(error => console.error('Error:', error));
  };
    
    const saveList = () => {
      //Saves List to backend, gets everything by Id, exept for name (which cant be changed)
      const formData = new FormData();
      formData.append("csrfmiddlewaretoken", document.querySelector('[name=csrfmiddlewaretoken]').value)
      formData.append("list_name", name)
      formData.append("list_tag", document.getElementById('select_tag_editor').value)
      formData.append("list_color", document.getElementById('list_color_editor').value)
      formData.append("list_content", document.getElementById('list_content').value)

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
            updateListData()
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

    const deletList = () => {
      //Request list removel, takes persistant (unique) name and sets color (which otherwise only can be hex) to del
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

    const exitEditor = () => {
      //calls to update all data (via the function in HomePage.js) and unmounts/closes editor
      //known to may rais an unimpactfull error
      props.update_data();
      ReactDOM.createRoot(document.getElementById('listEditor')).unmount();
    }
  
    return (
        <div className='overlay'>
          <div className='editorBox'>
            
            {viewMode != 'view' ? (
            //Top bar in edit mode
            <div className='head'>
              <button className='leftBlock' onClick={() => deletList()}>Delet</button>
              <select className='centerBlock' id='select_tag_editor' defaultValue={tag}>
                  <option value="default" >Default</option>
                  {props.tag_names.map((option) => (
                      <option key={option} value={option}>{option}</option>
                  ))}
              </select>
              <h3 className='centerBlock'>{name}</h3>
              <input className='centerBlock' type="color" id="list_color_editor" name="list_color_editor" defaultValue={color}/>
              <button  className='rightBlock' onClick={() => exitEditor()}>Exit</button>
            </div>
            ):(
            //Top bar in view mode
            <div className='head'>
                <h3 className='centerBlock' style={{marginLeft:'auto',}}>{name}</h3>
                <button className='rightBlock' onClick={() => exitEditor()}>Exit</button>
            </div>
            )}

            {viewMode != 'view' ? (
            //If in edit mode, show quick insert buttons
            <div className='editButtons'>
                <button onClick={() => {handleInsertion('[]()')}}>Link</button>
                <button onClick={() => {handleInsertion('#')}}>Headline</button>
                <button onClick={() => {handleInsertion('---')}}>Seperator</button>
                <button onClick={() => {handleInsertion('->. ')}}>List Item</button>
                <button onClick={() => {handleInsertion('-x. ')}}>Orderd List Item</button>
                <button onClick={() => {handleInsertion('!x!')}}>Ignore</button>
            </div>
            ):(
            //else show nothing (not possible so a hidden empty div is rendert)
            <div hidden/>)}
            
            {viewMode != 'view' ? (
                //If in edit mode, render textarea input field with default value gained from renderByLine
                <textarea id="list_content" className='mainBody' style={{backgroundColor: '#a5a5a5'}} defaultValue={renderByLine(content, 'edit')}></textarea>
            ) : (
                //If in view mode, render html container with inner html formated by renderByLine, it must be set dangously to enable this 
                <div className='mainBody' dangerouslySetInnerHTML={{ __html: renderByLine(content, 'view') }} />
            )}
  
            <div className='footer'>
                <button onClick={() => {if (viewMode === 'view'){setViewMode('edit');} else{setViewMode('view')}}}>Change Mode</button>
                {viewMode != 'view' ? (
                    //If in edit mode, render a Save button to save changes
                    <button onClick={() => {saveList()}}>Save</button>
                ) : (
                    //else render a button that opens all links in new tabs
                    //if link dos not start with http, append it --> convert to absolut link
                  <button onClick={() => {renderByLine(content, 'links').forEach(link => {
                                        window.open((link.startsWith('http')
                                                    ? link
                                                    : `http://${link}`), '_blank').focus()});}}
                                        >Open all Links</button>
                )}
              <p id='list_edit_msg' className='rightBlock'></p>
              </div>
          </div>
        </div>
      );//list_edit_msg used to display informations about saves and error msg
};

export default ListEditor