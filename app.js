Pi.init({
  version: "2.0",
  sandbox: true
});

const scopes = ['username', 'payments'];

function onIncompletePaymentFound(payment) {
  console.log('Incomplete payment found:', payment);
}

document.getElementById("login").addEventListener("click", async () => {

  try {

    const auth = await Pi.authenticate(
      scopes,
      onIncompletePaymentFound
    );

    console.log(auth);

    document.getElementById("userinfo").innerHTML = `
      <h2>${auth.user.username}</h2>
      <p>${auth.user.uid}</p>
    `;

  } catch (error) {

    console.error(error);

  }

});
