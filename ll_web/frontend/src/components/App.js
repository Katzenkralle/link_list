import React from "react";
import { createRoot } from "react-dom";

import { BrowserRouter as Router,  Route, Routes} from "react-router-dom";

import HomePage from './HomePage';
import ViewList from "./ViewList";
import Settings from "./Settings";

function App() {
    return (
        <Router>
            <Routes>
                <Route exact path="/" element={<HomePage />} />
                <Route path="view" element={<ViewList />} />
                <Route path="settings" element={<Settings />} />
            </Routes>
        </Router>
    );
}

const appDiv = document.getElementById('app');
createRoot(appDiv).render(<App />);
