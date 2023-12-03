/* eslint-disable */
import { userLogin } from "./login";
import { enableMap } from "./mapbox";

// DOM ELEMENTS
const form = document.querySelector("#form");
const mapEl = document.getElementById("map");

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
