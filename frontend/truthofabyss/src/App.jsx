import './App.css'
import Navbar from "./components/Navbar";
import { useState, useEffect } from 'react';

function App() {
    const [count, setCount] = useState(0);

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
            <Navbar />
            <div className="App">
                <h1>Hello there!</h1>
            </div>
            <div className="logo">Click Me!</div>
        </>
    );
}

export default App
