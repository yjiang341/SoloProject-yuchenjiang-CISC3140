import "./Button.css";
import { handleClick } from "./ButtonLogic";

function Button() {
    return (
        <button
            className="general-btn"
            onClick={handleClick}
        >
            Click Me!
        </button>
    );
}

export default Button;