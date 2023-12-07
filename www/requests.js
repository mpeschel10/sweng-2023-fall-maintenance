(() => {
	async function search() {
		const formSearch = document.getElementById("form-search");
		const params = new URLSearchParams(new FormData(formSearch));
		
		const beforeString = params.get("before");
		if (beforeString !== "") {
			params.set("before", new Date(beforeString).getTime() / 1000);
		}
		const afterString = params.get("after");
		if (afterString !== "") {
			params.set("after", new Date(afterString).getTime() / 1000);
		}
		
		const requests = await fetch("/request?" + params).then(response => response.json());
		
		const oldHeader = document.querySelectorAll(".th");
		const table = document.getElementById("table-requests");
		table.replaceChildren(...oldHeader);

		const n = s => document.importNode(templateRow.content.querySelector(s), true);
		const templateRow = document.getElementById("template-row");
		for (const request of requests) {
			const apartment = n(".span-apartment");
			const location = n(".span-location");
			const date = n(".span-date");
			const status = n(".span-status");
			const view = n(".a-view");
			
			apartment.textContent = request.apartment;
			location.textContent = request.location;
			date.textContent = new Date(parseInt(request.datetime) * 1000);
			status.textContent = request.status;
			view.href = `/request.html?id=${request.id}`;
			
			table.appendChild(apartment);
			table.appendChild(location);
			table.appendChild(date);
			table.appendChild(status);
			table.appendChild(view);
		}
	}

	function onButtonSubmit(event) {
		event.preventDefault();
		search();
	}

	function init() {
		document.getElementById("button-submit").addEventListener("click", onButtonSubmit);
		search();
	}

	window.addEventListener("load", init);
})();