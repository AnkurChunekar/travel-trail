/* eslint-disable */
import { userLogin, userLogout } from "./login";
import { enableMap } from "./mapbox";

// DOM ELEMENTS
const loginForm = document.querySelector(".form.form--login");
const mapEl = document.querySelector("#map");
const logoutEl = document.querySelector("#logout");

if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // construct a FormData object, which fires the formdata event
    const formData = new FormData(loginForm);
    // formdata gets modified by the formdata event
    userLogin(formData.get("email"), formData.get("password"));
  });
}

if (mapEl) {
  enableMap(mapEl);
}

if (logoutEl) {
  logoutEl.addEventListener("click", userLogout);
}
