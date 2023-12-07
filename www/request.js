(() => {
	let query;

	async function onStatusChange(event) {
		const element = event.target;
		const patch = {status: element.value};
		const patchString = JSON.stringify(patch);
		const url = '/request?' + query;
		console.log(url, patchString);
		response = await fetch(url, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/merge-patch+json'},
			body: patchString,
		});
		console.log(response);
	}

	async function init() {
		const id = new URL(window.location.href).searchParams.get('id');
		if (id === null) {
			window.location.href = "/index.html";
		}

		query = new URLSearchParams({id});
		console.log("Query paramenters: " + query);
		const [data] = await fetch('/request?' + query).then(response => response.json());
		if (data === undefined) {
			window.location.href = "/index.html";
		}
		console.log(data);
		const g = s => document.getElementById(s);
		g("span-apartment").textContent = data.apartment;
		g("span-location").textContent = data.location;
		g("span-date").textContent = new Date(data.datetime * 1000);
		g("p-description").textContent = data.description;
		const statusElement = g("select-status");
		statusElement.value = data.status;
		g("img-photo").src = data.photo;
		
		statusElement.addEventListener("change", onStatusChange);
	}

	window.addEventListener("load", init);
})();
