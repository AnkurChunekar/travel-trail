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
    location.assign("/");
  } catch (error) {
    showAlert(
      "error",
      error.response.data.message ||
        "Something went wrong, please try again later!"
    );
  }
};
