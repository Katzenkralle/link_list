import React, { useEffect, useState, Component, useRef} from 'react';
import ReactDOM from 'react-dom/client';
import renderByLine from './ViewContent';
import '../../static/ViewUserContent.css'


const styles = {
    overlay: {
      position: 'fixed',
      display: 'flex',
      width: '100%',
      height: '100%',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 2,
      cursor: 'pointer',
    },
    box: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      color: 'white',
      transform: 'translate(-50%, -50%)',
      backgroundColor: '#787878',
      height:'90%',
      width: '90%',
      display: 'flex',
      flexDirection: 'column' 
    },
    head: {
      all: 'unset',
      flexGrow: 0,
      flexShrink: 1,
      flexBasis: 'auto',
      margin: 'auto',
      display: 'flex'
    },
    mainBody: {
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: 'auto',
      marginLeft: '1em',
      marginRight: '1em',
      cursor: 'default'
    },
    footer: {
      margin: 'auto'
    },
    button: {
      margin: 'auto' // Added margin property
    },
  };


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

    const deleatList = () => {
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
        <div style={styles.overlay}>
          <div style={styles.box}>
            
            {viewMode != 'view' ? (
            //Top bar in edit mode
            <div style={styles.head}>
              <button style={styles.button} onClick={() => deleatList()}>Deleat</button>
              <h3>{name}</h3>
              <select id='select_tag_editor' defaultValue={tag} style={styles.button}>
                  <option value="default" >Default</option>
                  {props.tag_names.map((option) => (
                      <option key={option} value={option}>{option}</option>
                  ))}
              </select>
              <input style={styles.button} type="color" id="list_color_editor" name="list_color_editor" defaultValue={color}/>
              <button style={styles.button} onClick={() => exitEditor()}>Exit</button>
            </div>
            ):(
            //Top bar in view mode
            <div style={styles.head}>
                <h3>{name}</h3>
                <button style={styles.button} onClick={() => exitEditor()}>Exit</button>
            </div>
            )}

            {viewMode != 'view' ? (
            //If in edit mode, show quick insert buttons
            <div style={styles.footer}>
                <button onClick={() => {handleInsertion('[]()')}}>Link</button>
                <button onClick={() => {handleInsertion('#')}}>Headline</button>
            </div>
            ):(
            //else show nothing (not possible so a hidden empty div is rendert)
            <div hidden/>)}
            
            {viewMode != 'view' ? (
                //If in edit mode, render textarea input field with default value gained from renderByLine
                <textarea id="list_content" style={{...styles.mainBody, backgroundColor: '#a5a5a5'}} defaultValue={renderByLine(content, 'edit')}></textarea>
            ) : (
                //If in view mode, render html container with inner html formated by renderByLine, it must be set dangously to enable this 
                <div style={styles.mainBody} dangerouslySetInnerHTML={{ __html: renderByLine(content, 'view') }} />
            )}
  
            <div style={styles.footer}>
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

                <p id='list_edit_msg'></p>
              </div>
          </div>
        </div>
      );//list_edit_msg used to display informations about saves and error msg
};

export default ListEditor