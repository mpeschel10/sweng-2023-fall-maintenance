(() => {
	async function init() {
		const id = new URL(window.location.href).searchParams.get('id');
		if (id === null) {
			window.location.href = "/index.html";
		}

		const [data] = await fetch(`/request?id=${id}`).then(response => response.json());
		if (data === undefined) {
			window.location.href = "/index.html";
		}
		console.log(data);
		const g = s => document.getElementById(s);
		g("span-apartment").textContent = data.apartment;
		g("span-location").textContent = data.location;
		g("span-date").textContent = new Date(data.datetime * 1000);
		g("p-description").textContent = data.description;
		g("select-status").value = data.status;
		g("img-photo").src = data.photo;
	}

	window.addEventListener("load", init);
})();
