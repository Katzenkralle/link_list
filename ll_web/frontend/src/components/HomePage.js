import React, { useEffect, useState, Component} from 'react';
import CreateList from './CreateList';
import ReactDOM from 'react-dom/client';

function HomePage() {
//Fetching Data
  const [metaTags, setMetaTags] = useState([]);
  const [metaLists, setMetaLists] = useState([]);

  const fetchData = () => {
    fetch('api/getMetaHome/')
      .then(response => response.json())
      .then(data => {setMetaTags(JSON.parse(data.metaTags));}) //console.log(data.metaTags)
      .catch(error => console.error('Error:', error));
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateData = () => {
    console.log("Fetchin new Data")
    fetchData();
  };
  //

  return (
    <div>
      <div className="top_bar">
        <p className="alinge_left">Username</p>
        <p>{Date()}</p>
        <button className="alinge_right">Settings</button>
      </div>
      <h1 id="headline">Link Liste</h1>
      <div className="main_contend">
        <CreateList tag_names={metaTags} update_data={updateData}></CreateList>
      </div>

      <div id='tagContainer'></div>

    </div>
  );
}

export default HomePage;
