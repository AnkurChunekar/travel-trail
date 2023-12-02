/* eslint-disable */
const form = document.querySelector("#form");

if (form) {
  const triggerLogin = async (email, password) => {
    try {
      const res = await axios({
        method: "post",
        url: "/api/v1/users/login",
        data: { email, password }
      });

      alert(res.data.message);
      setTimeout(() => {
        // window;
      }, 1500);
      console.log("DONE", res);
    } catch (error) {
      alert(
        error.response.data.message ||
          "Something went wrong, please try again later!"
      );
    }
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // construct a FormData object, which fires the formdata event
    const formData = new FormData(form);
    // formdata gets modified by the formdata event
    triggerLogin(formData.get("email"), formData.get("password"));
  });
}
