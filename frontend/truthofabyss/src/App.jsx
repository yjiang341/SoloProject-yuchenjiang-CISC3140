import './App.css'
import Navbar from "./components/Navbar/Navbar.jsx";
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
            <h1>Welcome to my Page :)</h1>
        </>
    );
}

export default App
