import React, { useEffect, useState, Component} from 'react';
import ListEditor from './ListEditor';
import '../../static/home.css'

function LargeViewer() {
    const [listData, setListData] = useState({passwd_needed: undefined});
    const [passwdForList, setPasswdForList] = useState('');

    const fetchData= () => {
        console.log("fetching data")
        fetch('api/getDataViewerLarge' + window.location.search + (passwdForList !== '' ? '&passwd=' + passwdForList : ''))
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
