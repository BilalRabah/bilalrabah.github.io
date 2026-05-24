export default async function handler(req, res) {

  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed'
    });
  }

  try {

    const { paymentId } = req.body;

    const response = await fetch(
      `https://api.minepi.com/v2/payments/${paymentId}/approve`,
      {
        method: 'POST',
        headers: {
          Authorization: `Key YOUR_PI_API_KEY`
        }
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
