import { Routes, Route } from "react-router-dom";

import Home from "../pages/HomePage.jsx";
import Game from "../pages/GamePage.jsx";
import LoginPage from "../pages/LoginPage.jsx";
import SignupPage from "../pages/SignUpPage.jsx";
import SignUpSuccessPage from "../pages/SignUpSuccessPage.jsx";
import CharaCreatePage from "../pages/CharaCreatePage.jsx";
import CharacterSelectPage from "../pages/CharacterSelectPage.jsx";
import ErrorPage from "../pages/ErrorPage.jsx";
import GuestCreatePage from "../components/guest/create/page.jsx";
import GuestPlayPage from "../components/guest/play/page.jsx";

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/game" element={<Game />} />
            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="/auth/sign-up" element={<SignupPage />} />
            <Route path="/auth/sign-up-success" element={<SignUpSuccessPage />} />
            <Route path="/character/create" element={<CharaCreatePage />} />
            <Route path="/character" element={<CharacterSelectPage />} />
            <Route path="/guest/create" element={<GuestCreatePage />} />
            <Route path="/guest/play" element={<GuestPlayPage />} />
            <Route path="*" element={<ErrorPage />} />
        </Routes>
    );
}

export default AppRoutes