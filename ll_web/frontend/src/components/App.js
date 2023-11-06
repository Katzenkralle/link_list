import React from "react";
import { createRoot } from "react-dom/client";

import { BrowserRouter as Router,  Route, Routes} from "react-router-dom";

import HomePage from './LinkList/HomeLinkList';
import Settings from "./Other/Settings";
import CreateAccount from "./Other/AccountCreation";
import LargeViewer from "./LinkList/LargeViewer";
import AppHome from "./Other/AppHome";
import HomeWeather from "./weather/HomeWeather";
import HomeAsciiColor from "./asciiColor/HomeAsciiColor";
import HomeDurak from "./durak/HomeDurak";

function App() {
    return (
        <Router>
            <Routes>
                <Route exact path="linkList" element={<HomePage />} />
                <Route path="qLinkList" element={<LargeViewer />} />
                <Route path="settings" element={<Settings />} />
                <Route path="account-creation" element={<CreateAccount/>} />
                <Route path="" element={<AppHome />} /> 
                <Route path="weather" element={<HomeWeather />} />
                <Route path="asciiColor" element={<HomeAsciiColor />} />
                <Route path="durak" element={<HomeDurak />} />
            </Routes>
        </Router>
    );
}

const appDiv = document.getElementById('app');
createRoot(appDiv).render(<App />);
