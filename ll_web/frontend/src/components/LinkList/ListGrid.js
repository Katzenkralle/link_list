import React, { useEffect, useState, Component} from 'react';
import ListEditor from './ListEditor';
import ReactDOM from 'react-dom/client';


function ListGrid (props){
    const [lists, setLists] = useState(props.lists);

    useEffect(() => {
      //update the lists when the props change
      setLists(props.lists);
    }, [props.lists]);

    useEffect(() => {

      if (props.lists.length === 0) {
        return;
      }

      const stripedHash = window.location.hash.replace('#', '');
      const matchingList = props.lists.find((list) => list.id == stripedHash);

      if (!matchingList) {
        window.location.hash = '';
      } else {
        ReactDOM.createRoot(document.getElementById("listEditor")).render(
          <ListEditor 
            listId={matchingList.id}
            parent={'default'}
            isEditable={true}
            exit={() => props.update_data()}
          />
        );
      }
    }
    , [props.lists]);


    return(
      //show the lists in a grid, when clicked, show the list editor
      //for that create a new root and render the list editor in listEditor div (see HomePage)
        <div className='flex flex-wrap justify-center align-center'>
            {lists.map((list) => (
            <div className='interactiveContainer'
            key={list.name} 
            style={{backgroundColor: list.color}}  
            onClick={(e) => {
                    ReactDOM.createRoot(document.getElementById("listEditor")).render(
                    <ListEditor 
                    listId = {list.id}
                    parent = {'default'}
                    isEditable = {true}
                    exit = {() => props.update_data()}
                    />
                )}}>
                <h3 className='infoHl mb-2'>{list.name}</h3>
                <p className='font-bold justify-bottom'>{list.tag}</p>
                <p className='mt-auto justify-bottom'>{list.owner}</p>
                <p>{list.creation_date}</p>
                {list.url ? <a className='link' href={window.location.origin + list.url}>List is Public {list.public_list == 'r' ? "(Readonly)" : ""}</a> 
                :null}
            </div>
          ))}
        </div>
    )
};

export default ListGrid