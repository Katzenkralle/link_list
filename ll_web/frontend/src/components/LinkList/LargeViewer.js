import React, { useEffect, useState, Component} from 'react';
import ListEditor from './ListEditor';

function LargeViewer() {
    const [listData, setListData] = useState({passwd_needed: undefined});
    const [passwdForList, setPasswdForList] = useState('');

    const fetchData= () => {
      // Get data about list which id is in the url, if user provided a password, send it
        console.log("fetching data")
        fetch('linkListApi/getDataViewerLarge' + window.location.search + (passwdForList !== '' ? '&passwd=' + passwdForList : ''))
        .then(response => response.json())
            .then(data => {
                setListData(data);
            })
            .catch(error => console.error('Error:', error));
    };
    
    useEffect(() => {
        fetchData();
    }, []);
    
    return (
      //when password is not needed, show the list editor, otherwise show a password input
      //password needet until list backend returns a list
        <div>
          {listData.passwd_needed === false ? (
            <ListEditor update_data={fetchData}
            name={listData.name}
            id = {listData.id}
            color={('color' in listData ? listData.color : undefined)} 
            tag={('tag' in listData ? listData.tag[0] : undefined)}
            content={listData.content} 
            tag_names={('tag_names' in listData ? listData.tag_names : undefined)}
            is_editable={listData.is_editable}
            called_from_large_viewer={true}
            />
          ) : (
            <div>
                <p>Password needed...</p>
                <input type='password' onChange={e => setPasswdForList(e.target.value)}/>
                <button onClick={fetchData}>Submit</button>
            </div>
          )}
        </div>
      );
}

export default LargeViewer;
