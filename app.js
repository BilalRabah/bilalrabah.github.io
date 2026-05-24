Pi.init({
  version: "2.0",
  sandbox: true
});

const scopes = ['username', 'payments'];

function onIncompletePaymentFound(payment) {
  console.log('Incomplete payment found:', payment);
}

async function login() {

  try {

    const auth = await Pi.authenticate(
      scopes,
      onIncompletePaymentFound
    );

    console.log(auth);

    document.getElementById("userinfo").innerHTML = `

      <h2>Welcome ${auth.user.username}</h2>

      <p>User ID:</p>

      <small>${auth.user.uid}</small>

    `;

  } catch (error) {

    console.error(error);

    alert("Login Failed");

  }

}

document
  .getElementById("login")
  .addEventListener("click", login);
