import React, { Component } from 'react';
import TopBar from './TopBar';

function AppHome() {
    return (
        <div className='flex flex-col dark:text-white '>
           {TopBar()}
            <h1 className='!mt-12 !mb-8 mx-auto maxHl'>Some App jet without a name!</h1>
            <div className='flex flex-wrap justify-center items-center'>
                <div className='interactiveContainer bg-indigo-600'
                onClick={() => {window.location.href = "/linkList"}}>
                    <h3 className='infoHl mb-2'>Somina Notas</h3>

                    <div className='whitespace-normal'>Take notes with
                    <a className='underline decoration-2 decoration-pink-700'> Markdown </a>
                    create in<a className='underline decoration-2 decoration-green-700'> HTML </a> 
                    save in<a className='underline decoration-2 decoration-violet-950'> JSON</a>!</div>
                </div>

                <div className='interactiveContainer bg-emerald-600'
                onClick={() => {window.location.href = "/weather"}}>
                    <h3 className='infoHl mb-2'>Weather</h3>

                    <div className='whitespace-normal text-left'>A Weather app that allows you to look at the
                    <a className='underline decoration-2 decoration-cyan-700'> forecast </a>and provides you with 
                    <a className='underline decoration-2 decoration-red-700'> data from the past</a>!</div>
                
                </div>

                <div className='interactiveContainer bg-slate-600'
                onClick={() => {window.location.href = "/settings"}}>
                    <h3 className='infoHl mb-2'>Settings</h3>

                    <div className='whitespace-normal'>Change the
                    <a className='underline decoration-2 decoration-sky-700'> behaviour </a>of this App, manage your   
                     <a className='underline decoration-2 decoration-purple-700'> Profile</a>.</div>
                   
                </div>
            </div>
        </div>
    );
}
export default AppHome;