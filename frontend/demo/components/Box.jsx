function Box({color, children}) {
//PROPs
	function Box(Props) {
		//const {color, children) = Props;
		return (
			<div
				style={{backgroundColor: color, padding: "20px", borderRadius: "5px"}}
			>
				{children}
			</div>
		);
	}
}

export default class Box {}