import React, { useEffect, useState, Component } from 'react';
import ListEditor from './ListEditor';
import ReactDOM from 'react-dom/client';
import { Draggable, Droppable } from 'react-drag-and-drop';

import { STATIC_VARS } from '../Other/StaticPaths';

function ListGrid(props) {
  const [lists, setLists] = useState(props.lists);
  const [draging, setDraging] = useState(false);

  let [listEditorRoot, setListEditorRoot] = useState(null);

  const updateOrder = (lists) => {
    const errorDisplay = document.getElementById('list_creation_msg');
    const order = lists.map((list) => list.id);
    const formData = new FormData();
    formData.append("csrfmiddlewaretoken", document.querySelector('[name=csrfmiddlewaretoken]').value);
    formData.append('list_order', order);
    fetch('linkListApi/lists/', {
      method: 'POST',
      body: formData
    })
      .then((response) => {
        if (!response.ok)
          errorDisplay.innerHTML = "An Error occurred!";
          setTimeout(() => {  errorDisplay.innerHTML = '' }, 5000);
      })
  }

  
  useEffect(() => {
    setListEditorRoot(ReactDOM.createRoot(document.getElementById('listEditor')));
  }, []);

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
      listEditorRoot.render(
        <ListEditor
          listId={matchingList.id}
          parent={'default'}
          isEditable={true}
          exit={() => {props.update_data();listEditorRoot.render();}}
        />
      );
    }
  }
    , [props.lists]);

  const getBgColor = (color, link) => {
    let rgb = color.match(/\w\w/g).map((hex) => parseInt(hex, 16));
    rgb = 0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2];

    if (link) {
      return rgb > 186 ? true : false;
    }
    return rgb > 186 ? '#303446' : '#c6d0f5';
  }

  const moveList = (movingId, targetId) => {
    const movingList = lists.find((list) => list.id == movingId);
    const targetIndex = lists.findIndex((list) => list.id == targetId);
    let newList = lists.filter((list) => list.id != movingId);
    newList.splice(targetIndex, 0, movingList);//Id startet bei 1, index bei 0
    setLists(newList);
    updateOrder(newList);
  }

  return (
    //show the lists in a grid, when clicked, show the list editor
    //for that create a new root and render the list editor in listEditor div (see HomePage)
    <div className='flex flex-wrap justify-center align-center'>
      {lists.map((list) => (
        <Draggable key={list.id} type="list" data={list.id} onDragStart={() => {setDraging(true)}} onDragEnd={() => {setDraging(false)}}>
          <Droppable types={['list']} onDrop={(e) => moveList(e.list, list.id)}>
            <div className={`interactiveContainer ${draging ? 'outline outline-cat-borderInactive outline-5' : ''}`}
              style={{ backgroundColor: list.color, color: getBgColor(list.color) }}
              onClick={(e) => {
                listEditorRoot.render(
                  <ListEditor
                    listId={list.id}
                    parent={'default'}
                    isEditable={true}
                    exit={() => {props.update_data();listEditorRoot.render();}}
                  />
                )
              }}>
              <h3 className='infoHl mb-2'>{list.name}</h3>
              <p className='font-bold justify-bottom'>{list.tag}</p>
              <div className='flex flex-row !my-auto mainHl'>
                <button className='mr-auto p-2 hover:text-cat-link'
                onClick={(e) => {
                    e.stopPropagation();
                    moveList(list.id, lists[lists.findIndex((l) => l.id == list.id) - 1].id)
                  }}
                  hidden={list.id == lists[0].id}
                  >{STATIC_VARS.LARGE_SCREEN ? "←" : "↑" }</button>
                <button className='ml-auto p-2 hover:text-cat-link'
                onClick={(e) => {
                    e.stopPropagation();
                    moveList(list.id, lists[lists.findIndex((l) => l.id == list.id) + 1].id)
                  }}
                  hidden={list.id == lists[lists.length - 1].id}
                >{STATIC_VARS.LARGE_SCREEN ? "→" : "↓" }</button>
              </div>
              <p className='mt-auto justify-bottom'>{list.owner}</p>
              <p>{list.creation_date}</p>
              {list.url ? <a
                style={getBgColor(list.color, true) ? { color: '#1e66f5', ':hover': { color: '#0d306f !important' } } : {}}
                className='link'
                href={window.location.origin + list.url}
              >List is Public {list.public_list == 'r' ? "(Readonly)" : ""}</a>
                : null}
            </div>
          </Droppable>
        </Draggable>
      ))}
    </div>
  )
};

export default ListGrid