/* eslint-disable */
import axios from "axios";
import { showAlert } from "./alerts";

export const updateUserSettings = async (data, isPasswordUpdate = false) => {
  try {
    const res = await axios({
      method: "PATCH",
      url: `/api/v1/users/${isPasswordUpdate ? "updatePassword" : "updateMe"}`,
      data
    });

    showAlert(
      "success",
      `${isPasswordUpdate ? "Password" : "Data"} Updated Successfully!`
    );

    if (!isPasswordUpdate) window.location.reload();
  } catch (error) {
    showAlert(
      "error",
      error.response.data.message ||
        "Something went wrong, please try again later!"
    );
  }
};
