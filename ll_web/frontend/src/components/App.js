import React from "react";
import { createRoot } from "react-dom/client";

import { BrowserRouter as Router,  Route, Routes} from "react-router-dom";

import HomePage from './HomePage';
import Settings from "./Settings";
import CreateAccount from "./AccountCreation";
import LargeViewer from "./LargeViewer";

function App() {
    return (
        <Router>
            <Routes>
                <Route exact path="/" element={<HomePage />} />
                <Route path="q" element={<LargeViewer />} />
                <Route path="settings" element={<Settings />} />
                <Route path="account-creation" element={<CreateAccount/>} />
            </Routes>
        </Router>
    );
}

const appDiv = document.getElementById('app');
createRoot(appDiv).render(<App />);
