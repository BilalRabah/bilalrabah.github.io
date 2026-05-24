export default async function handler(req, res) {

  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed'
    });
  }

  try {

    const { paymentId, txid } = req.body;

    const response = await fetch(
      `https://api.minepi.com/v2/payments/${paymentId}/complete`,
      {
        method: 'POST',
        headers: {
          Authorization: `Key YOUR_PI_API_KEY`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          txid: txid
        })
      }
    );

    const data = await response.json();

    res.status(200).json(data);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: error.message
    });

  }

}
