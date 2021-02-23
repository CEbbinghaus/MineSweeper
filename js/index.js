var g;
window.directions = [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]]

window.onload = () => {
	const urlParams = new URLSearchParams(window.location.search);

	let fieldSize = Number.parseInt(urlParams.get('FieldSize'));
	if(isNaN(fieldSize))
		fieldSize = 10;

	let percentage = Number.parseInt(urlParams.get('Percentage'));
	if(isNaN(percentage))
		percentage = 20;

	g = new game("Canvas", fieldSize, percentage)
}