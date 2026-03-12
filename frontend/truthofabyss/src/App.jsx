import './App.css'
import Navbar from "./components/Navbar/Navbar.jsx";
import Buttons from "./components/Button/Button.jsx";
import { useEffect } from 'react';
import Button from "./components/Button/Button.jsx";

function App() {
    //const [count, setCount] = useState(0);

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch(
                    "http://localhost:3000"
                );
                const data = await response.json();
                console.log(data);
            } catch (error) {
                console.error(
                    "error fetching data",
                    error
                );
            }
        }
        fetchData();
    }, []);

    return (
        <>
            <h1>Welcome to my Page :)</h1>
            <div className={"uniformContainer"}>
                <Navbar />
            </div>
            <Buttons> Click Me!</Buttons>
        </>
    );
}

export default App
