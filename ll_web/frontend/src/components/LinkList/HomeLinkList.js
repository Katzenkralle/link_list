import React, { useEffect, useState, Component} from 'react';
import CreateList from './CreateList';
import ListGrid from './ListGrid';
import Multiselect from 'multiselect-react-dropdown';
import TopBar, { topBar } from '../Other/TopBar';

function HomePage() {

  const multiselectStyles = {
    // ... other styles
    searchBox: {
      border: 'none',
    },
    inputField: {
      margin: '0',
    },
    chips: {
      background: '#565559',
      marginBottom: '0',
      transform: 'translateY(-1px)'
    },
    optionContainer: {
      border: '3px solid #565559',
      background: '#27272a',
      overflow: 'hidden',
    },
    option: {
      color: 'white',
      overflow: 'hidden'
     },
    // ... other styles
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
    <div className='dark:text-white'>
      {TopBar()}
      <h1 id="headline" className='maxHl text-center mt-5 mb-3'>Link List</h1>

      <div className="flex flex-wrap justify-center">
        <CreateList tag_names={metaTags} update_data={fetchData}></CreateList>
        <hr className='w-[90%] border-2 border-gray-500 mt-3'></hr>
      </div>

      <div className='flex flex-wrap justify-center my-2'>
        <input type='text' id='list_search' placeholder='Search...' onChange={filterHandler} className='inputElement h-9 my-2'></input>
        <Multiselect
          id="filter_tag"
          type="checkbox"
          isObject={false}
          selectedValues={tagFilter}
          closeOnSelect={true}
          placeholder="▼ Select..."
          avoidHighlightFirstOption={true}
          className='inputElement mx-1 my-2 h-9 pb-1'
          style={{
            ...multiselectStyles,
            searchBox: {
              ...multiselectStyles.searchBox,
              width: 'w-48', 
              minWidth: 'min-w-48',
              height: 'h-7', 
              transform: 'translateY(-3px)' //move 3px up to align with inputElement
            }
          }}
          onSelect={(e) => {setTagFilter(e)}}
          onRemove={(e) => {setTagFilter(e)}}
          options={(['Default']).concat(
            metaTags.map((tag) => tag))}/>
      </div>

      <div className=''>
        <ListGrid lists={listAfterFilter} tag_names={metaTags} update_data={fetchData}></ListGrid>
      </div>
      
      <div id='listEditor'></div> {/* div to create ListEditor in */}
      <div id='tagContainer'></div> {/* div to create CreateTags in */}
    </div>
  );
}

export default HomePage;
