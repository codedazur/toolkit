export function pascalCase(string: string) {
	return (string.match(/[a-zA-Z0-9]+/g) || [])
		.map((word: string) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
		.join("");
}