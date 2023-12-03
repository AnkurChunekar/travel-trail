/* eslint-disable */
import axios from "axios";
import { showAlert } from "./alerts";

export const userLogin = async (email, password) => {
  try {
    const res = await axios({
      method: "post",
      url: "/api/v1/users/login",
      data: { email, password }
    });

    showAlert("success", res.data.message);
    // navigate the user to home route
    setTimeout(() => {
      location.assign("/");
    }, 1000);
  } catch (error) {
    showAlert(
      "error",
      error.response.data.message ||
        "Something went wrong, please try again later!"
    );
  }
};

export const userLogout = async () => {
  try {
    console.log(1);
    const res = await axios({
      method: "post",
      url: "/api/v1/users/logout"
    });
    console.log({ res });

    showAlert("success", "Logged out successfully!");
    // navigate the user to home route
    setTimeout(() => {
      location.assign("/");
    }, 1000);
  } catch (error) {
    showAlert(
      "error",
      error.response.data.message ||
        "Something went wrong, please try again later!"
    );
  }
};
