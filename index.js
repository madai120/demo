const express = require('express');
const bodyParser = require('body-parser');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

let secret;

// Endpoint para generar un nuevo secreto y mostrar el código QR
app.get('/setup', (req, res) => {
  secret = speakeasy.generateSecret({ name: 'MyApp' });
  qrcode.toDataURL(secret.otpauth_url, (err, data_url) => {
    res.json({ secret: secret.base32, qr_code: data_url });
  });
});

// Endpoint para verificar el código de 2FA
app.post('/verify', (req, res) => {
  const { token } = req.body;
  const verified = speakeasy.totp.verify({
    secret: secret.base32,
    encoding: 'base32',
    token
  });

  if (verified) {
    res.json({ success: true });
  } else {
    res.status(400).json({ success: false, message: 'Invalid token' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
