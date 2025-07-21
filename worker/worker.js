document.querySelector("form").addEventListener("submit", function(e) {
  e.preventDefault(); // Stop default form submission

  // Redirect to postwork.html within the same folder
  window.location.href = "worker.html";
});