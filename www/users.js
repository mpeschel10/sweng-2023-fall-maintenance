(() => {
	async function search() {
		const table = document.getElementById("table-tenants");
		const headers = document.querySelectorAll("#table-tenants .th");
		
		const templateRowContent = document.getElementById("template-tenant").content;
		const n = s => document.importNode(templateRowContent.querySelector(s), true);
		const tenants = await fetch("/tenant").then(response => response.json());

		table.replaceChildren(...headers);
		// Username Password Name Phone Email Apartment <span class="th">Delete</span>
		for (const tenant of tenants) {
			const username = n(".span-username");
			const password = n(".span-password");
			const name = n(".span-name");
			const phone = n(".span-phone");
			const email = n(".span-email");
			const apartment = n(".text-apartment");
			const delete_ = n(".button-delete");
			
			username.textContent = tenant.username;
			password.textContent = tenant.password;
			name.textContent = tenant.name;
			phone.textContent = tenant.phone;
			email.textContent = tenant.email;
			
			apartment.value = tenant.apartment;
			apartment.tenantId = tenant.id;
			apartment.addEventListener("change", onTextApartmentChange);

			delete_.addEventListener("click", onButtonDeleteClick);
			delete_.tenantId = tenant.id;

			[username, password, name, phone, email, apartment, delete_].map(element => {
				table.appendChild(element);
			});
		}
	}

	async function onTextApartmentChange(event) {
		const textApartment = event.target;
		const tenantId = textApartment.tenantId;
		const apartment = textApartment.value;

		console.log("Updating tenant " + tenantId + " to have apartment " + apartment);
		const patchString = JSON.stringify({apartment});
		await fetch(`/tenant?id=${tenantId}`, {
			method: 'PATCH',
			headers: {"Content-Type": "application/merge-patch+json"},
			body: patchString,
		});
	}

	async function onButtonDeleteClick(event) {
		const buttonDelete = event.target;
		const tenantId = buttonDelete.tenantId;

		console.log("Deleting tenant " + tenantId);
		await fetch(`/tenant?id=${tenantId}`, {
			method: 'DELETE',
		});

		search();
	}

	async function init() {
		// document.getElementById("button")
		search();
	}

	window.addEventListener("load", init);
})();
