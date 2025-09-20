document.getElementById("managerForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = {
    fullname: e.target.fullname.value,
    phone: e.target.phone.value,
    password: e.target.password.value,
    location: e.target.location.value,
  };

  try {
    const res = await fetch("http://localhost:5000/api/manager", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    document.getElementById("msg").innerText = data.message;
  } catch (err) {
    document.getElementById("msg").innerText = "Error: " + err.message;
  }
});
