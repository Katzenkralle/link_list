import React, { Component } from "react";
import { render } from "react-dom";

import HomePage from './HomePage';
import { BrowserRouter as Router,  Route, Routes} from "react-router-dom";
import ViewList from "./ViewList";

function App() {
    
        return (
            <Router>
                <Routes>
                    <Route exact path="/" element= {<HomePage />} />
                    <Route path="view" element= {<ViewList />} />
                </Routes>
          </Router>
        );
    
}

const appDiv = document.getElementById('app');
render(<App />, appDiv);