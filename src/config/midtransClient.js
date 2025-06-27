import midtransClient from 'midtrans-client';

const snap = new midtransClient.Snap({
  isProduction: false, // ganti ke true kalau production
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY
});

export default snap;