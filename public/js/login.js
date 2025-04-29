const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const showLoginButton = document.getElementById("show-login");
const showRegisterButton = document.getElementById("show-register");

showLoginButton.addEventListener("click", () => {
  loginForm.classList.remove("hidden");
  registerForm.classList.add("hidden");
  showLoginButton.classList.add("active");
  showRegisterButton.classList.remove("active");
});

showRegisterButton.addEventListener("click", () => {
  registerForm.classList.remove("hidden");
  loginForm.classList.add("hidden");
  showRegisterButton.classList.add("active");
  showLoginButton.classList.remove("active");
});

// Login form submission
document.getElementById("login-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.error) {
        alert(data.error);
      } else {
        alert("Login successful!");
        window.location.href = "recipes.html";
      }
    });
});

document.getElementById("register-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("register-name").value;
  const email = document.getElementById("register-email").value;
  const password = document.getElementById("register-password").value;

  fetch("/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, role: "user" }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.error) {
        alert(data.error);
      } else {
        alert("Registration successful! You can now log in.");
        document.getElementById("register-form").reset();
        showLoginButton.click();
      }
    });
});
