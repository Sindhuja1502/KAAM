function selectRole(role) {
  alert("You selected: " + role);
  // You can redirect later like this:
  // window.location.href = `/${role}/login.html`;
}
document.querySelector("#signupForm").addEventListener("submit", async function(e) {
  e.preventDefault();

  const data = {
    name: document.querySelector("#name").value,
    phone: document.querySelector("#phone").value,
    password: document.querySelector("#password").value,
    location: document.querySelector("#location").value
  };

  const res = await fetch("http://localhost:5000/manager/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  const result = await res.json();
  alert(result.message);
});
