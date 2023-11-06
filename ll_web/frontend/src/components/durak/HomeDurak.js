import React, { useEffect, useState, Component} from 'react';
import TopBar from '../Other/TopBar';
import BottomBar from '../Other/BottomBar';

function HomeDurak() {
  return (
    <div className='content flex flex-col text-cat-main'>
            {TopBar()}
            <main className='max-w-[1624px] mx-auto shrink-0 grow-0 overflow-x-hidden'>
                <h1 className='mainHl'>Lobby</h1>
            </main>
            {BottomBar()}
    </div>
  )
}

export default HomeDurak;