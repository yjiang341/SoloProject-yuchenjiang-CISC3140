import { Routes, Route } from "react-router-dom";

import Home from "frontend/src/pages/HomePage";
import Game from "frontend/src/pages/GamePage";
import LoginPage from "frontend/src/pages/LoginPage";

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/game" element={<Game />} />
            <Route path="/login" element={<LoginPage />} />
        </Routes>
    );
}

export default AppRoutes