import React, { useEffect, useState, Component} from 'react';
import CreateList from './CreateList';
import ListGrid from './ListGrid';
import SelectMenu from './SelectMenu';
import '../../static/home.css'

function HomePage() {

  const [metaTags, setMetaTags] = useState([]);
  const [metaLists, setMetaLists] = useState([]);
  const [metaUser, setMetaUser] = useState([]);
  const [tagFilter, setTagFilter] = useState([]);
  const [listAfterFilter, setListAfterFilter] = useState([]);

  const filterHandler = () => {
    //Takes metaLists and filters dependet on user input, new value beeing stord in listAfterFilter
    //keyword=search bar value; tagFilter=array of all selectet Tags 
    var keyword = document.getElementById('list_search').value
    //console.log("Key:",keyword, "TagFilter:", tagFilter, "ListAfterFilter:",listAfterFilter)
    if (keyword == '' && tagFilter.length == 0) {
      //Default at Page load, unfilterd metaList as listAfterFilter
      if (JSON.stringify(listAfterFilter) !== JSON.stringify(metaLists)) {
        setListAfterFilter(metaLists);
      }
      return;
    }

    var listSelection = []
    if (keyword  != ''){
      //if keyword is not default, search for all lists with name=keyword
      console.log(keyword)
      metaLists.forEach(list => {
        if (list['name'].toLowerCase().includes(keyword.toLowerCase())){ //prior == instead of in
          if (tagFilter.length != 0){
            //if tagFilter is not default, also check if the found list is in the array of selected tags
            tagFilter.forEach(tag => {
              if (tag['value'] == list['tag']){
                //if so, add to working variable listSelection
                listSelection.push(list)
              }
            });
          } else {
            //if tagFilter is default just add match to listSelection
            listSelection.push(list)
          }
        }
      })
    } else {
      //If keyword is default, tagFilter must not be default (otherwise the abouve would have already returned)
      console.log("Tag!=None")
      tagFilter.forEach(tag => {
        metaLists.forEach(list => {
          //Iterates thou every tag in the array and every dict in metaList
          if (tag['value'] == list['tag']){
            //if list with fitting name found, add to listSelection
            listSelection.push(list)
          }
        })
      });
    }
    //set working ListAfterFilter to value of working variable
    setListAfterFilter(listSelection)
    return
  } 

  const fetchData = () => {
    //Fetching Data from api
    //split into metaTags=array of all tags of the user and metaList=arayy of dictonarys of all lists of the user
    fetch('api/getMetaHome/')
      .then(response => response.json())
      .then(data => {setMetaTags(JSON.parse(data.metaTags)); 
                     setMetaLists(JSON.parse(data.metaLists));
                     setMetaUser(JSON.parse(data.metaUser))
                     filterHandler();}) //console.log(data.metaTags)
      .catch(error => console.error('Error:', error));
  };

  useEffect(() => {
    fetchData();
    // maby not needet? 
  }, []);

  useEffect(() => {
    //calls filterHandler when metalists or tagFilter changes
    filterHandler();
  },[metaLists, tagFilter])

  const updateData = () => {
    //used to pass as prop to components
    console.log("Fetchin new Data")
    fetchData();
  };
  //
  console.log("SelectetTag:", tagFilter)
  return (
    <div>
      <div className="top_bar">
        <p className="alinge_left">{metaUser.name}</p>
        <button className="alinge_right" onClick={() => window.location.href = "settings"}>Settings</button>
      </div>

      <h1 id="headline">Link List</h1>

      <div className="box_for_main_contend tags">
        <CreateList tag_names={metaTags} update_data={updateData}></CreateList>
      </div>

      <div className='box_for_main_contend filter'>
        <input type='text' id='list_search' placeholder='Search...' onChange={filterHandler}></input>
        <SelectMenu
          id="filter_tag"
          type="checkbox"
          checked={tagFilter}
          isMulti={true}
          onChange={(e) => {setTagFilter(e);}}
          options={([{value: 'default', label: 'Default'}]).concat(
                    metaTags.map((tag) => ({
                    value: tag, label: tag,}))
                  )}/>
      </div>

      <div className='box_for_main_contend list_grid'>
        <ListGrid lists={listAfterFilter} tag_names={metaTags} update_data={updateData}></ListGrid>
      </div>

      <div id='tagContainer'></div>
      <div id='listEditor'></div>
      
    </div>
  );
}

export default HomePage;
