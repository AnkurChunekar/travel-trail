/* eslint-disable */

export const hideAlert = () => {
  const el = document.querySelector(".alert");
  if (el) el.parentElement.removeChild(el);
};

export const showAlert = (type, msg) => {
  // hide previous alerts
  hideAlert();
  const newDiv = document.createElement("div");
  newDiv.textContent = msg;
  newDiv.className = `alert alert--${type}`;

  const body = document.querySelector("body");
  body.appendChild(newDiv);

  setTimeout(hideAlert, 5000);
};
