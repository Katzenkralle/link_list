import React, { useEffect, useState, Component} from 'react';
import ReactDOM from 'react-dom/client';

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
      flexGrow: 0,
      flexShrink: 1,
      flexBasis: 'auto',
      margin: 'auto',
      display: 'flex'
    },
    mainBody: {
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: 'auto'
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

    const addLink = () => {

    }

    const addHeadlineLevel = () => {

    }

    const colorLine = () => {

    }

    const seperator = () => {

    }

    const save_list = () => {

    }

    const DivViewMode = () => {
        return (
          <div style={styles.mainBody}>
            {/* Content for view mode */}
          </div>
        );
      };
      
      const DivEditMode = () => {
        return (
          <div style={styles.mainBody}>
            {/* Content for edit mode */}
          </div>
        );
      };
    return (
        <div style={styles.overlay}>
          <div style={styles.box}>
            
            <div style={styles.head}>
                <h3>{props.name}</h3>
                <select id='select_tag' defaultValue={props.tag} style={styles.button}>
                    <option value="default" >Default</option>
                    {props.tag_names.map((option) => (
                        <option key={option} value={option}>{option}</option>
                    ))}
                </select>
                <button style={styles.button} onClick={() => {ReactDOM.createRoot(document.getElementById('listEditor')).unmount()}}>Exit</button>
            </div>

            {viewMode != 'view' ? (
            <div style={styles.footer}>
                <button onClick={() => {addLink}}>Link</button>
                <button onClick={() => {addHeadlineLevel}}>Headline</button>
                <button onClick={() => {colorLine}}>Color Line</button>
                <button onClick={() => {seperator}}>Spacer</button>
            </div>):(<div hidden/>)}
            
            {viewMode === 'view' ? (
                <DivViewMode />
            ) : (
                <DivEditMode />
            )}
            
            <div style={styles.footer}>
                <button onClick={() => {if (viewMode === 'view'){setViewMode('edit');} else{setViewMode('view')}}}>Change Mode</button>
                <button onClick={() => {save_list}}>Save</button>
                </div>
            
          </div>
        </div>
      );
};

export default ListEditor