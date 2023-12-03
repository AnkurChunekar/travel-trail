/* eslint-disable */
import axios from "axios";

export const userLogin = async (email, password) => {
  try {
    const res = await axios({
      method: "post",
      url: "/api/v1/users/login",
      data: { email, password }
    });

    alert(res.data.message);
    // navigate the user to home route
    location.assign("/");
  } catch (error) {
    alert(
      error.response.data.message ||
        "Something went wrong, please try again later!"
    );
  }
};
