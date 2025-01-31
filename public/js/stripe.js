const stripe = Stripe(
  "pk_test_51PVJ8u02fwobMK5iOzYCTT2ZebbT8Geb75DA8Na3AQlGlALFRUsxcjR8qPo6SaZwZAgxDKCTbGE0VvqIBpg1ED5r00zlr0XeEH"
);

const orderBtn = document.getElementById("order-btn");
orderBtn.addEventListener("click", function () {
  const sessionId = this.getAttribute("data-session-id");

  stripe
    .redirectToCheckout({
      sessionId: sessionId,
    })
    .then(function (result) {
      if (result.error) {
        alert(result.error.message);
      }
    });
});
