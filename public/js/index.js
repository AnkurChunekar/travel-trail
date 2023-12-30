/* eslint-disable */
import { userLogin, userLogout } from "./login";
import { updateUserSettings } from "./updateUserSettings";
import { enableMap } from "./mapbox";
import { bookTour } from "./razorpay";
import { showAlert } from "./alerts";

// constants
const BLURRED_HEADER_PATHS = {
  "/me": true,
  "/login": true
};

const SELECTORS = {
  loginForm: ".form.form--login",
  userDataForm: ".form.form-user-data",
  userPasswordForm: ".form.form-user-password",
  mapEl: "#map",
  logoutEl: "#logout",
  bookTourBtn: "#book-tour",
  header: "#header",
  useGuestCreds: "#use-guest-creds",
  email: "#email",
  password: "#password"
};

const GUEST_USER = {
  email: "admin@natours.io",
  password: "test1234"
};

// DOM ELEMENTS

const loginForm = document.querySelector(SELECTORS.loginForm);
const userDataForm = document.querySelector(SELECTORS.userDataForm);
const userPasswordForm = document.querySelector(SELECTORS.userPasswordForm);
const mapEl = document.querySelector(SELECTORS.mapEl);
const logoutEl = document.querySelector(SELECTORS.logoutEl);
const bookTourBtn = document.querySelector(SELECTORS.bookTourBtn);
const header = document.querySelector(SELECTORS.header);
const guestCredsBtn = document.querySelector(SELECTORS.useGuestCreds);

if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // construct a FormData object, which fires the formdata event
    const formData = new FormData(loginForm);
    // formdata gets modified by the formdata event
    userLogin(formData.get("email"), formData.get("password"));
  });

  // if user wants to use guest creds
  if (guestCredsBtn) {
    const emailInput = document.querySelector(SELECTORS.email);
    const passInput = document.querySelector(SELECTORS.password);
    guestCredsBtn.addEventListener("click", () => {
      emailInput.value = "guest@example.com";
      passInput.value = "12345678";

      userLogin(GUEST_USER.email, GUEST_USER.password);
    });
  }
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

    console.log(formData.get("photo"));
    updateUserSettings(formData);
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

if (bookTourBtn) {
  bookTourBtn.addEventListener("click", (e) => {
    bookTour(bookTourBtn.dataset.tourId);
  });
}

if (header) {
  const scrollHeightThreshold = 500;

  // do not blur the header & add a listener on paths such as /me, /login, /signup, etc
  if (BLURRED_HEADER_PATHS[window.location.pathname]) {
    header.classList.remove("bg-blur");
  } else {
    // add the listener here
    header.classList.add("bg-blur");

    function handleScroll() {
      // Check if the current scroll position is beyond the threshold
      if (window.scrollY > scrollHeightThreshold) {
        // Add a class to the header when scrolled
        header.classList.remove("bg-blur");
      } else {
        // Remove the class when not scrolled
        header.classList.add("bg-blur");
      }
    }
    window.addEventListener("scroll", handleScroll);
  }
}
