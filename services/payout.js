// // services/payout.service.js
// const razorpay = require("../config/razorpay");


// const payoutToUPI = async ({ amount, upi, name, referenceId }) => {
//     console.log('hit');
//     console.log("Payouts object:", razorpay);
    
// //     if (!razorpay.payouts) {
// //     console.log("Razorpay payouts not available, returning dummy payout");
// //     return {
// //       id: "DUMMY_" + Date.now(),
// //       status: "processed",
// //       amount: Number(amount) * 100,
// //       vpa: upi,
// //       reference_id: referenceId,
// //     };
// //   }

//   return await razorpay.payouts.create({
//     account_number: process.env.RAZORPAY_ACCOUNT_NUMBER,
//     amount: Number(amount) * 100, // convert to paise
//     currency: "INR",
//     mode: "UPI",
//     purpose: "cashback",
//     fund_account: {
//       account_type: "vpa",
//       vpa: {
//         address: upi,
//         name: name,
//       },
//     },
//     reference_id: referenceId,
//     queue_if_low_balance: true,
//   });
// };

// module.exports = { payoutToUPI };

// services/payout.service.js
const axios = require('axios');

const payoutToUPI = async ({ amount, upi, name, referenceId }) => {
    // 1. Ensure amount is an integer (in paise)
    const amountInPaise = Math.round(Number(amount) * 100);

    // 2. Generate mandatory Idempotency Key (required as of March 2025)
    const idempotencyKey = `payout_${referenceId}_${Date.now()}`;

    // 3. Payload for Composite Payout
    const payload = {
        account_number: process.env.RAZORPAY_ACCOUNT_NUMBER, // Your RazorpayX account number
        amount: amountInPaise,
        currency: "INR",
        mode: "UPI",
        purpose: "cashback",
        fund_account: {
            account_type: "vpa",
            vpa: {
                address: upi,
            },
            contact: {
                name: name,
                type: "customer",
                reference_id: referenceId // Optional custom identifier
            }
        },
        queue_if_low_balance: true,
        reference_id: referenceId, // Merchant's reference ID for tracking
    };

    // 4. API Call using Basic Auth
    // Razorpay uses Basic Auth: 'KeyID:KeySecret'
    const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64');
    
    try {
        const response = await axios.post('https://api.razorpay.com/v1/payouts', payload, {
            headers: {
                'Authorization': `Basic ${auth}`,
                'X-Payout-Idempotency': idempotencyKey, // Mandatory header
                'Content-Type': 'application/json'
            }
        });
        return response.data;

    } catch (error) {
        // Log detailed error from Razorpay
        console.error("Razorpay Payout Error:", error.response ? error.response.data : error.message);
        throw error.response ? error.response.data : new Error(error.message);
    }
};

module.exports = { payoutToUPI };
