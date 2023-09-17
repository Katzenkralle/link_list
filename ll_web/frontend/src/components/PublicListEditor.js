import React, { useEffect, useState } from 'react';

function PublicListEditor(props){
    const [metaList, setMetaList] = useState([]);
    
    const fetchData = () => {
    //Fetching Data from api
    //split into metaTags=array of all tags of the user and metaList=arayy of dictonarys of all lists of the user
    const formData = new FormData();
    formData.append("csrfmiddlewaretoken", document.querySelector('[name=csrfmiddlewaretoken]').value)
    formData.append("list", window.location.search)
    formData.append("passwd", '')
    fetch("api/getPublicListData/", {
      method: 'POST',
      body: formData,
    })
      .then((response) => {})
  };
    
    useEffect(() => {
      fetchData();
      // maby not needet? 
    }, []);

    
   
    // Render the received data in your React components
    return (
      <div>
        Placeholder
      </div>
    );
      
    }
    

export default PublicListEditor;