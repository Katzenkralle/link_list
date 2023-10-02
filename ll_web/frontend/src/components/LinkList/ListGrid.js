import React, { useEffect, useState, Component} from 'react';
import ListEditor from './ListEditor';
import ReactDOM from 'react-dom/client';


function ListGrid (props){
    const [lists, setLists] = useState(props.lists);

    useEffect(() => {
      //update the lists when the props change
      setLists(props.lists);
    }, [props.lists]);

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
                    update_data={props.update_data} 
                    id = {list.id}
                    name={list.name} 
                    color={list.color} 
                    tag={list.tag} 
                    content={list.content} 
                    tag_names={props.tag_names}
                    called_from_large_viewer = {false}
                    is_editable = {true}
                    />
                )}}>
                <h3 className='infoHl mb-2'>{list.name}</h3>
                <p className='font-bold justify-bottom'>{list.tag}</p>
                <p className='mt-auto justify-bottom'>{list.owner}</p>
                <p>{list.creation_date}</p>
            </div>
          ))}
        </div>
    )
};

export default ListGrid