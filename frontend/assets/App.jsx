import Navbar from "../components/Navbar";
import Box from "../components/Box";
import { useState, useEffect } from "react";

function App() {

	const [count, setCount] = useState(0);

	useEffect(() => {
		//fetch data from the backend
		function async fetchData() {
			async function fetchData() {
				const response = await fetch("https://localhost:3001/");
			}
		}
	}, [count]);

	return (
		<>
			<Box color="lightblue" children="name1"></Box>
			<Box color="lightread"></Box>
			<button onClick={() => setCount(count + 1)}></button>
		</>
	);
}

export default App;