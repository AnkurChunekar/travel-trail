/* eslint-disable */
import { userLogin, userLogout } from "./login";
import { enableMap } from "./mapbox";

// DOM ELEMENTS
const form = document.querySelector("#form");
const mapEl = document.querySelector("#map");
const logoutEl = document.querySelector("#logout");

if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // construct a FormData object, which fires the formdata event
    const formData = new FormData(form);
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
