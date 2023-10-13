import React, { useEffect, useState, Component} from 'react';

function TopBar(){

    return(
        <div className="flex flex-row justify-between bg-cat-bg2 mb-1 z-30">
            {window.location.pathname === '/settings' ? 
                <a className="mx-1 font-bold" href="/logout">Logout</a> : 
                <a className="mx-1 font-bold" href="/settings">Settings</a>}
            <a className="mx-1 font-bold" href="/">Home</a>
        </div>
    )
}

export default TopBar;