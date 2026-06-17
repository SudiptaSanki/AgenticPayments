const wallet = require('./wallet');

class X402Client {
  constructor(baseUrl = `http://localhost:${process.env.PORT || 3000}`) {
    this.baseUrl = baseUrl;
  }

  async fetchWithPayment(path, options = {}) {
    const url = `${this.baseUrl}${path}`;
    const initial = await fetch(url, options);

    if (initial.status !== 402) {
      const body = await initial.json().catch(() => ({}));
      return { response: initial, data: body, paid: false };
    }

    const paymentRequest = await initial.json();
    const merchant = paymentRequest.merchantAddress;
    const amount = parseFloat(paymentRequest.amount);

    const payment = await wallet.sendPayment(merchant, amount);

    const retry = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'x-402-receipt': payment.hash,
      },
    });

    const data = await retry.json().catch(() => ({}));
    return {
      response: retry,
      data,
      paid: true,
      paymentRequest,
      receipt: payment.hash,
      simulated: payment.simulated,
    };
  }
}

module.exports = new X402Client();
