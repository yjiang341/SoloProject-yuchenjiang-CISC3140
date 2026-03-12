import "./Navbar.css";
import Buttons from "../Button/Button.jsx";

function Navbar() {
    return (
        <nav className="navbar">
            <Buttons>My Game</Buttons>
            <Buttons> Story </Buttons>
            <Buttons> About me </Buttons>
        </nav>
    );
}

export default Navbar;