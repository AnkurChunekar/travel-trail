/* eslint-disable */
import { userLogin, userLogout } from "./login";
import { updateUserSettings } from "./updateUserSettings";
import { enableMap } from "./mapbox";
import { showAlert } from "./alerts";

// DOM ELEMENTS
const loginForm = document.querySelector(".form.form--login");
const userDataForm = document.querySelector(".form.form-user-data");
const userPasswordForm = document.querySelector(".form.form-user-password");
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

if (userDataForm) {
  userDataForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const formData = new FormData(userDataForm);
    const data = { email: formData.get("email"), name: formData.get("name") };
    updateUserSettings(data);
  });
}

if (userPasswordForm) {
  userPasswordForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const password = document.querySelector("#password");
    const passwordCurrent = document.querySelector("#password-current");
    const passwordConfirm = document.querySelector("#password-confirm");

    const data = {
      password: passwordCurrent.value,
      newPassword: password.value,
      confirmNewPassword: passwordConfirm.value
    };
    updateUserSettings(data, true);
  });
}
