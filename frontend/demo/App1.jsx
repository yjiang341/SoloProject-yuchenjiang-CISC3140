import Navbar from "../components/Navbar";
import Box from "../components/Box";
import { useState, useEffect } from "react";

function App() {

	const [count, setCount] = useState(0);

	useEffect(() => {
		// fetch data from the backend
		async function fetchData() {
			try {
				const response = await fetch("https://localhost:3001/");
				const data = await response.text();
				console.log(data);
			} catch (err) {
				console.error(err);
			}
		}

		fetchData();
	}, [count]);

	return (
		<>
			<Box color="lightblue" children="name1"></Box>
			<Box color="lightread"></Box>
			<button onClick={() => setCount(count + 1)}> add count </button>
		</>
	);
}

export default App;