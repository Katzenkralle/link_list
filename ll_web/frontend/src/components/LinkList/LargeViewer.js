import React, { useEffect, useState, Component} from 'react';
import ListEditor from './ListEditor';

function LargeViewer() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isEditable, setIsEditable] = useState(false);

    const [passwdForList, setPasswdForList] = useState('');

    const fetchData= () => {
      // Get data about list which id is in the url, if user provided a password, send it
      const formData = new FormData();
      formData.append("csrfmiddlewaretoken", document.querySelector('[name=csrfmiddlewaretoken]').value);
      formData.append("id", window.location.search.split('=')[1]);
      formData.append("passwd", passwdForList);
      fetch(`linkListApi/authGuest/`, {
          method: 'POST',
          body: formData,
      }).then((response) => {
          if (!response.ok || response == undefined) {
              throw Error(response.statusText);
          }
            return response.text()})
        .then((text) => {
            setIsEditable(true ? text == "rw" : false);
            setIsAuthenticated(true);
      }).catch(error => {
              setIsAuthenticated(false);
              const msg = document.getElementById('largeViewerMsg');
              msg.innerHTML = error;
              setTimeout(() => {
                  msg.innerHTML = '';
              }, 5000);
            });
          };

          useEffect(() => {
            fetchData();
          }, []);
    
    return (
      //when password is not needed, show the list editor, otherwise show a password input
      //password needet until list backend returns a list
        <div className='text-cat-main'>
          {isAuthenticated ? (
            <ListEditor update_data={() => fetchData()}
            listId = {window.location.search.split('=')[1]}
            parent = {'largeViewer'}
            isEditable = {isEditable}
            exit = {() => window.location.reload()}
            />
          ) : (
            <div className='flex flex-col text-cat-main'>
                <h1 className='maxHl mx-auto mt-8'>Somnia Notas</h1>
                <h3 className='mainHl mx-auto my-5'>Guest Viewer</h3>
                <p className='mx-auto infoHl mx-auto mb-2'>Password needed!</p>

                <div className='m-auto'>
                  <input className='inputElement' type='password' onChange={e => setPasswdForList(e.target.value)}/>
                  <button className='inputElement ml-1' onClick={() => fetchData()}>Submit</button>
                </div>
                <p id="largeViewerMsg" className='text-cat-error mx-auto'></p>
            </div>
          )}
        <div id='tagContainer'></div>
        </div>
      );
}

export default LargeViewer;
