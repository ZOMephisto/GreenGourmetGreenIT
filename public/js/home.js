fetch("/auth/status", { method: "GET", credentials: "include" })
  .then((res) => res.json())
  .then((data) => {
    const navLinks = document.getElementById("nav-links");

    navLinks.innerHTML = `
        <li><a href="index.html">Home</a></li>
        <li><a href="recipes.html">Recipes</a></li>
      `;

    if (data.role === "admin") {
      navLinks.innerHTML += `
          <li><a href="add-recipe.html">Add Recipe</a></li>
          <li><a href="admin.html">Admin</a></li>
            <li><a href="manage.html">Manage Users</a></li>
        `;
    }

    if (data.loggedIn) {
      navLinks.innerHTML += `
          <li id="logout-button"><a href="#">Logout</a></li>
        `;
      document
        .getElementById("logout-button")
        .addEventListener("click", handleLogout);
    } else {
      navLinks.innerHTML += `
          <li><a href="login.html">Login</a></li>
        `;
    }
  })
  .catch(() => {
    const navLinks = document.getElementById("nav-links");
    navLinks.innerHTML = `
        <li><a href="index.html">Home</a></li>
        <li><a href="recipes.html">Recipes</a></li>
        <li><a href="login.html">Login</a></li>
      `;
  });

function handleLogout() {
  fetch("/logout", { method: "POST", credentials: "include" })
    .then((res) => res.json())
    .then(() => {
      window.location.href = "index.html";
    })
    .catch((err) => {
      console.error("Logout failed:", err);
    });
}
