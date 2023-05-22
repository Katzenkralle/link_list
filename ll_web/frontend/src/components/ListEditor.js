import React, { useEffect, useState, Component} from 'react';
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

function ListEditor (props){
    const [viewMode, setViewMode] = useState('view');

    const [content, setContent] = useState(props.content);
    const [tag, setTag] = useState(props.tag);
    const [color, setColor] = useState(props.color);
    const [name, setName] = useState(props.name)

    useEffect(() => {
      setContent(props.content);
    }, [props.content]);

    const addLink = () => {

    }

    const addHeadlineLevel = () => {

    }

    const colorLine = () => {

    }

    const seperator = () => {

    }

    const updateListData = () => {
      fetch('api/getMetaHome/')
      .then(response => response.json())
      .then(data => {var relevantList = JSON.parse(data.metaLists).find(obj => obj.name === name);
                     setColor(relevantList.color); setTag(relevantList.tag); setContent(relevantList.content)}) //console.log(data.metaTags)
      .catch(error => console.error('Error:', error));
  };
    
    const saveList = () => {
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
          setTimeout(() => {  document.getElementById('list_edit_msg').innerHTML = '';}, 5000);
          
        })
        .catch((error) => {
          // Handle any errors that occur during the submission
          console.log("err")
          console.error('Form submission error:', error);
        });
    }

    const deleatList = () => {
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
      props.update_data();
      ReactDOM.createRoot(document.getElementById('listEditor')).unmount();
    }

    const TopBarEdit = () => {
      return(
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
      )
    }

  
    return (
        <div style={styles.overlay}>
          <div style={styles.box}>
            
          {viewMode != 'view' ? (<TopBarEdit></TopBarEdit>):(<div style={styles.head}>
            <h3>{name}</h3>
            <button style={styles.button} onClick={() => exitEditor()}>Exit</button>
          </div>)}

            {viewMode != 'view' ? (
            <div style={styles.footer}>
                <button onClick={() => {addLink}}>Link</button>
                <button onClick={() => {addHeadlineLevel}}>Headline</button>
                <button onClick={() => {colorLine}}>Color Line</button>
                <button onClick={() => {seperator}}>Spacer</button>
            </div>):(<div hidden/>)}
            
            {viewMode === 'view' ? (
                <div style={styles.mainBody} dangerouslySetInnerHTML={{ __html: renderByLine(content, 'view') }} />
            ) : (
                <textarea id="list_content" style={{...styles.mainBody, backgroundColor: '#a5a5a5'}} defaultValue={renderByLine(content, 'edit')}></textarea>
            )}
            
            <div style={styles.footer}>
                <button onClick={() => {if (viewMode === 'view'){setViewMode('edit');} else{setViewMode('view')}}}>Change Mode</button>
                {viewMode === 'view' ? (
                    <button onClick={() => {}}>Open all Links</button>
                ) : (
                    <button onClick={() => {saveList()}}>Save</button>
                )}
                <p id='list_edit_msg'></p>
              </div>
            
          </div>
        </div>
      );
};

export default ListEditor