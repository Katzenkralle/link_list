import React, { Component } from "react";



export default class HomePage extends Component {
    constructor(props){
        super(props);
    }

    render(){
        return <div>
        <div class="top_bar">
            <p>Username</p>
            <p>{ Date() }</p>
            <button>Settings</button>
        </div>
        <p1 id="headline">Link Liste</p1>
        <div class="main_contend">Contend div link liste</div>
    </div>
    }
}