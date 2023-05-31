import React, { useEffect, useState, Component} from 'react';
import '../../static/ListGrid.css'
import ListEditor from './ListEditor';
import ReactDOM from 'react-dom/client';


function ListGrid (props){
    const [lists, setLists] = useState(props.lists);

    useEffect(() => {
      setLists(props.lists);
      console.log("ListGridLists:", lists)
    }, [props.lists]);

    return(
        
        <div className='container'>
            {lists.map((list) => (
            <div key={list.name} style={{backgroundColor: list.color}} className='box' onClick={(e) => {
                    ReactDOM.createRoot(document.getElementById("listEditor")).render(
                    <ListEditor update_data={props.update_data} name={list.name} color={list.color} tag={list.tag} content={list.content} tag_names={props.tag_names}></ListEditor>
                )}}>
                <h5>{list.name}</h5>
                <p>{list.tag}</p>
            </div>
          ))}
        </div>
    )
};

export default ListGrid