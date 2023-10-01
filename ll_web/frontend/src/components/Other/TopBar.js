import React, { useEffect, useState, Component} from 'react';

function TopBar(){

    return(
        <div className="flex flex-row justify-between">
            <a className="mx-1" href="/settings">Settings</a>
            <a className="mx-1" href="/">Home</a>

        </div>
    )
}

export default TopBar;