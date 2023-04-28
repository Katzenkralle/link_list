import React, { Component } from "react";



export default class HomePage extends Component {
    constructor(props){
        super(props);
    }

    render(){
        return <div>
        <div class="top_bar">
            <p class="alinge_left">Username</p>
            <p>{ Date() }</p>
            <button class="alinge_right">Settings</button>
        </div>
        <h1 id="headline">Link Liste</h1>
        <div class="main_contend">Contend div link liste</div>
    </div>
    }
}