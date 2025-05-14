import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config({ path: './config.env' });

const publicKey = process.env.LIQPAY_PUBLIC_KEY;
const privateKey = process.env.LIQPAY_PRIVATE_KEY;

export const createLiqPayPayment = (req, res) => {
  // Отримуємо параметри з тіла запиту
  const { amount, description } = req.body;
  // Отримуємо параметри з query (URL параметри)
  const { tourId, price } = req.body;

  console.log('Received data:', { amount, description, tourId, price });

  // Перевірка, чи всі параметри присутні
  if (!tourId) {
    console.error('Error: Missing required parameters (tourId or price)');
    return res
      .status(400)
      .json({ status: 'error', message: 'Missing required parameters' });
  }

  const order_id = 'order_' + Date.now();
  console.log('Generated order_id:', order_id);

  const liqpayData = {
    public_key: publicKey,
    version: '3',
    action: 'pay',
    amount: Number(amount),
    currency: 'UAH',
    description,
    order_id,
    sandbox: 1,
    result_url: `http://localhost:3000/payment-success?tourId=${tourId}&price=${price}`, // URL для результатів
    server_url: 'http://localhost:8000/liqpay-callback', // URL для вебхуку
  };

  console.log('LiqPay data:', liqpayData);

  const jsonString = JSON.stringify(liqpayData);
  const data = Buffer.from(jsonString).toString('base64');

  console.log('Base64 encoded data:', data);

  const signature = crypto
    .createHash('sha1')
    .update(privateKey + data + privateKey)
    .digest('base64');

  console.log('Generated signature:', signature);

  const formHtml = `
    <form id="liqpay-form" method="POST" action="https://www.liqpay.ua/api/3/checkout" accept-charset="utf-8">
      <input type="hidden" name="data" value="${data}" />
      <input type="hidden" name="signature" value="${signature}" />
    </form>
    <script>
      document.getElementById('liqpay-form').submit();
    </script>
  `;

  console.log('Form HTML:', formHtml);

  res.send(formHtml);
};
