import express from 'express'
import Stripe from 'stripe'
import 'dotenv/config'
import bodyParser from 'body-parser'

const app = express()
app.use(express.static('public'))
const stripe = new Stripe(process.env.STRIPE_KEY)
const endpointSecret = process.env.WEBHOOK



async function fulfillCheckout(sessionId) {
  console.log('Fulfilling Checkout Session ' + sessionId);

  // TODO: Make this function safe to run multiple times,
  // even concurrently, with the same session ID

  // TODO: Make sure fulfillment hasn't already been
  // performed for this Checkout Session

  // Retrieve the Checkout Session from the API with line_items expanded
  console.log('hit fulfillment')
  const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['line_items'],
  });

  // Check the Checkout Session's payment_status property
  // to determine if fulfillment should be performed
  if (checkoutSession.payment_status !== 'unpaid') {
    // TODO: Perform fulfillment of the line items

    // TODO: Record/save fulfillment status for this
    // Checkout Session
  }
}

app.post('/webhook', bodyParser.raw({type : 'application/json'}),  async (req, res) => {
  const payload = req.body;
  console.log("hit webhook")
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
  } catch (err) {
    console.log("webhook error boys")
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (
    event.type === 'checkout.session.completed'
    || event.type === 'checkout.session.async_payment_succeeded'
  ) {
    console.log('right webhook')
    fulfillCheckout(event.data.object.id);
  } else {
    console.log("unnecessary webhook")
  }

  res.status(200).end();
});




app.post('/create-checkout-session', async(req, res) => {
    
const session = await stripe.checkout.sessions.create({
    customer_email: 'mailer@gmail.com',
    submit_type: 'donate',
    line_items : [
        {
            price: 'price_1SpjwDEWTDD3yGxm6Kjsf6oD',
            quantity: 15,
        },
    ],
    mode: 'payment',
    success_url: `${process.env.DOMAIN}/success.html`,
})
    res.redirect(303, session.url);
    
})

app.listen(process.env.PORT, ()=> {
    console.log(`listening at port ${process.env.PORT}`)
})