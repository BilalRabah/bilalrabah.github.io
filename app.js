async function pay() {

  const paymentData = {
    amount: 1,
    memo: "CashCam Payment",
    metadata: { type: "payment" }
  };

  const callbacks = {

    onReadyForServerApproval: async function(paymentId) {

      const res = await fetch('/api/approve-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ paymentId })
      });

      console.log(await res.json());
    },

    onReadyForServerCompletion: async function(paymentId, txid) {

      const res = await fetch('/api/complete-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          paymentId,
          txid
        })
      });

      console.log(await res.json());
    },

    onCancel: function(paymentId) {
      console.log("Cancelled", paymentId);
    },

    onError: function(error, payment) {
      console.error(error);
    }

  };

  await Pi.createPayment(
    paymentData,
    callbacks
  );

}
