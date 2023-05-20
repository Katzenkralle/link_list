import React, { useEffect, useState, Component} from 'react';
import '../../static/ListGrid.css'
import ListEditor from './ListEditor';
import ReactDOM from 'react-dom/client';


function ListGrid (props){
    return(
        
        <div className='container'>
            {props.lists.map((list) => (
            <div key={list.name} style={{backgroundColor: list.color}} className='box' onClick={(e) => {
                    ReactDOM.createRoot(document.getElementById("listEditor")).render(
                    <ListEditor name={list.name} tag={list.tag} content={list.content} tag_names={props.tag_names}></ListEditor>
                )}}>
                <h5>{list.name}</h5>
                <p>{list.tag}</p>
            </div>
          ))}
        </div>
    )
};

export default ListGrid