import React, { useEffect, useState, Component} from 'react';
import CreateList from './CreateList';
import ListGrid from './ListGrid';
import Multiselect from 'multiselect-react-dropdown';
import '../../../static/LinkList/home.css'

function HomePage() {

  const multiselectStyles = {
      /* https://github.com/srigar/multiselect-react-dropdown */
      //to be replaced with tailwind
    searchBox: {
      border: 'none',
      borderRadius: '25px',
      background: '#1e1e1e',
      alignContent: 'center',
      display: 'flex',
      overflow: 'scroll',
      maxWidth: "19em",
      input: {
        border: 'none',
        fontSize: '10px',
        minHeight: '50px',
      },
    },
    inputField: {
      margin: '0',
    },
    chips: {
      background: '#565559',
      marginBottom: '0',
    },
    optionContainer: {
      border: '3px solid #565559',
      background: '#1e1e1e',
      overflow: 'hidden',
    },
    option: {
      color: 'white',
      overflow: 'hidden'
     },
    
    
    // groupHeading: {
    //   /* Add your styles here */
    //   /* Example: fontWeight: 'bold' */
    // },
  };

  const [metaTags, setMetaTags] = useState([]);
  const [metaLists, setMetaLists] = useState([]);
  const [metaUser, setMetaUser] = useState([]);
  const [tagFilter, setTagFilter] = useState([]);
  const [listAfterFilter, setListAfterFilter] = useState([]);

  const filterHandler = () => {
    //Takes metaLists and filters them by keyword and tag
    var keyword = document.getElementById('list_search').value
    if (keyword == '' && tagFilter.length == 0) {
      //Default, no filter
      if (JSON.stringify(listAfterFilter) !== JSON.stringify(metaLists)) {
        setListAfterFilter(metaLists);
      }
      return;
    }
    
    var listSelection = []
    if (keyword  != ''){
      //If keyword is not default, check if keyword is in name of list 
      metaLists.forEach(list => {
        if (list['name'].toLowerCase().includes(keyword.toLowerCase())){
          if (tagFilter.length != 0){
            //If tagFilter is not default, check if tag of list is in tagFilter
            tagFilter.forEach(tag => {
              if (tag == list['tag']){
                listSelection.push(list)
              }
            });
          } else {
            //else just add match to listSelection
            listSelection.push(list)
          }
        }
      })
    } else {
      //If keyword is default, check if tagFilter is not default
      //Check every possible combination of tagFilter and metaLists
      tagFilter.forEach(tag => {
        metaLists.forEach(list => {
          if (tag == list['tag']){
            listSelection.push(list)
          }
        })
      });
    }
    
    setListAfterFilter(listSelection)
    return
  } 

  const fetchData = () => {
    //Fetches meta data from api
    //split into attributes to simplify, also reruns filterHandler
    fetch('linkListApi/getMetaHome/')
      .then(response => response.json())
      .then(data => {setMetaTags(JSON.parse(data.metaTags)); 
                     setMetaLists(JSON.parse(data.metaLists));
                     setMetaUser(JSON.parse(data.metaUser))
                     filterHandler();})
      .catch(error => console.error('Error:', error));
  };

  useEffect(() => {
    //calls fetchData once on load
    fetchData();
  }, []);

  useEffect(() => {
    //calls filterHandler once metaLists or tagFilter changes
    filterHandler();
  },[metaLists, tagFilter])

  return (
    <div>
      <div className="top_bar">
        <p className="alinge_left">{metaUser.name}</p>
        <button className="alinge_right" onClick={() => window.location.href = "settings"}>Settings</button>
      </div>

      <h1 id="headline">Link List</h1>

      <div className="box_for_main_contend tags">
        <CreateList tag_names={metaTags} update_data={fetchData}></CreateList>
        <hr></hr>
      </div>

      <div className='box_for_main_contend filter'>
        <input type='text' id='list_search' placeholder='Search...' onChange={filterHandler}></input>
        <Multiselect
          id="filter_tag"
          type="checkbox"
          isObject={false}
          selectedValues={tagFilter}
          closeOnSelect={true}
          placeholder="▼ Select..."
          avoidHighlightFirstOption={true}
          style={{
            ...multiselectStyles,
            searchBox: {
              ...multiselectStyles.searchBox,
              with: '19em',
              minWidth: '12em',
              height: '1.75em',
            }}}
          onSelect={(e) => {setTagFilter(e)}}
          onRemove={(e) => {setTagFilter(e)}}
          options={(['Default']).concat(
            metaTags.map((tag) => tag))}/>
      </div>

      <div className='box_for_main_contend list_grid'>
        <ListGrid lists={listAfterFilter} tag_names={metaTags} update_data={fetchData}></ListGrid>
      </div>
      
      <div id='listEditor'></div> {/* div to create ListEditor in */}
      <div id='tagContainer'></div> {/* div to create CreateTags in */}
    </div>
  );
}

export default HomePage;
