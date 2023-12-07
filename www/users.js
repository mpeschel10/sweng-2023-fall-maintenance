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
			const apartment = n(".span-apartment");
			const delete_ = n(".button-delete");
			
			username.textContent = tenant.username;
			password.textContent = tenant.password;
			name.textContent = tenant.name;
			phone.textContent = tenant.phone;
			email.textContent = tenant.email;
			apartment.textContent = tenant.apartment;

			[username, password, name, phone, email, apartment, delete_].map(element => {
				table.appendChild(element);
			});
		}
	}

	async function init() {
		// document.getElementById("button")
		search();
	}

	window.addEventListener("load", init);
})();
