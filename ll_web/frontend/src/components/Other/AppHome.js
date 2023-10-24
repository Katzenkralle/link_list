import React, { Component } from 'react';
import TopBar from './TopBar';
import BottomBar from './BottomBar';

function AppHome() {
    return (
        <div className='flex flex-col dark:text-white'>
            {TopBar()}
            <main className='flex flex-col'>
                <h1 className='!mt-12 !mb-8 mx-auto maxHl'>
                    Some App jet without a name!
                </h1>
                <div className='flex flex-wrap justify-center items-center'>
                    <div
                        className='interactiveContainer bg-indigo-600'
                        onClick={() => {
                            window.location.href = '/linkList';
                        }}
                    >
                        <h3 className='infoHl mb-2'>Somina Notas</h3>

                        <div className='whitespace-normal'>
                            Take notes with Markdown create in HTML save in JSON!
                        </div>
                    </div>

                    <div
                        className='interactiveContainer bg-emerald-600'
                        onClick={() => {
                            window.location.href = '/weather';
                        }}
                    >
                        <h3 className='infoHl mb-2'>Weather</h3>

                        <div className='whitespace-normal text-left'>
                            A Weather app that allows you to look at the forecast and provides
                            you with data from the past!
                        </div>
                    </div>

                    <div
                        className='interactiveContainer bg-purple-600'
                        onClick={() => {
                            window.location.href = '/asciiColor';
                        }}
                    >
                        <h3 className='infoHl mb-2'>Ascii Art</h3>

                        <div className='whitespace-normal'>
                            Lorem ipsum dolorem sit amet.
                        </div>
                    </div>


                    <div
                        className='interactiveContainer bg-pink-900'
                        onClick={() => {
                            window.location.href = 'https://github.com/Katzenkralle/link_list';
                        }}
                    >
                        <h3 className='infoHl mb-2'>GitHub</h3>

                        <div className='whitespace-normal'>
                            Look at the source code of this App!
                        </div>
                    </div>

                    <div
                        className='interactiveContainer bg-slate-600'
                        onClick={() => {
                            window.location.href = '/settings';
                        }}
                    >
                        <h3 className='infoHl mb-2'>Settings</h3>

                        <div className='whitespace-normal'>
                            Change the behavior of this App, manage your Profile.
                        </div>
                    </div>
                </div>
            </main>
        {BottomBar()}
        </div>
    );
}
export default AppHome;