/* eslint-disble */
import axios from "axios";
import { showAlert } from "./alerts";

const bookTour = async (tourId) => {
  try {
    // 1) Get checkout session from the API
    const res = await axios.get(
      `${window.location.origin}/api/v1/bookings/checkout-session/${tourId}`
    );
    const { order, image, userName, userEmail } = res.data;

    // 2) Checkout and complete payment
    const successHandler = (response) => {
      // handle success case here
      // sample response
      //   {
      //     "razorpay_payment_id": "pay_NE6dPIN2PxCk50",
      //     "razorpay_order_id": "order_NE6d9hZ8AQoeKC",
      //     "razorpay_signature": "a876a955a2e032e730f0e666f4ecebebe0ef161bd9b70b0d9abef67c7eb139e8"
      // }
      showAlert("success", "Payment successfull!");
      setTimeout(() => {
        // window.location.href = window.location.origin;
      }, 1000);
    };

    const options = {
      key: "rzp_test_GWnuASKHFHS4pU",
      order_id: order.id,
      currency: order.currency,
      amount: order.amount.toString(),
      name: "Travel Trail",
      description: "Thank you for shopping with us",
      image,
      callback_url: "https://eneqd3r9zrjok.x.pipedream.net/",
      prefill: {
        name: userName,
        email: userEmail,
        contact: "9912345678"
      },
      theme: { color: "#55c57a" },
      handler: successHandler
    };
    const rzp1 = new window.Razorpay(options);
    rzp1.open();
    rzp1.on("payment.failed", function (response) {
      showAlert(
        "error",
        "Payment failed, please rest assured if any amount deducted will be transfered back to account in few minutes"
      );
    });
  } catch (error) {
    showAlert(
      "error",
      "Something went wrong while initiating the payment, please try again after sometime"
    );
    console.error(error);
  }
};

export { bookTour };
