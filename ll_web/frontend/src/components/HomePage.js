import React, { useEffect, useState, Component} from 'react';
import CreateList from './CreateList';

function HomePage() {
//Fetching Data
  const [metaTags, setMetaTags] = useState([]);
  const [metaLists, setMetaLists] = useState([]);

  const fetchData = async () => {
    try {
      const response = await fetch('your-api-url');
      const data = await response.json();
      const { metaTags, metaLists } = data;

      setMetaTags(metaTags);
      setMetaLists(metaLists);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateData = () => {
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
        <CreateList tag_names={["a","b"]}></CreateList>
      </div>

      <div id='tagContainer'></div>

    </div>
  );
}

export default HomePage;
