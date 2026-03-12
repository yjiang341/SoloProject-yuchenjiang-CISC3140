import "./Button.css";
import { handleClick } from "./ButtonLogic";

function Button(props) {
    return (
        <button
            className="general-btn"
            onClick={(handleClick)}
        >
            {props.children}
        </button>
    );
}

//<Button>Click me</Button>

export default Button;