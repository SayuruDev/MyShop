import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import Order from "../models/order.js";

import Stripe from "stripe";
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);


const HARDCODED_TAX_RATE = 0.25;       // 25% tax
const FREE_SHIPPING_AMOUNT = 0;        // $0 shipping
const STANDARD_SHIPPING_AMOUNT = 20;   // $20 shipping

// Create Stripe Checkout Session => /api/v1/payment/checkout_session
export const stripeCheckoutSession = catchAsyncErrors(
  async (req, res, next) => {
    const body = req?.body;

    const line_items = body?.orderItems?.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item?.name,
          images: [item?.image],
          metadata: { productId: item?.product },
        },
        unit_amount: item?.price * 100,
      },
      quantity: item?.quantity,
    }));

    const shippingInfo = body?.shippingInfo;

    // ✅ Determine shipping amount
    const shippingAmount =
      body?.itemsPrice >= 200 ? FREE_SHIPPING_AMOUNT : STANDARD_SHIPPING_AMOUNT;

    // ✅ Calculate tax manually
    const taxAmount = body?.itemsPrice * HARDCODED_TAX_RATE;

    // ✅ Calculate total
    const totalAmount = body?.itemsPrice + taxAmount + shippingAmount;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      success_url: `${process.env.FRONTEND_URL}/me/orders?order_success=true`,
      cancel_url: `${process.env.FRONTEND_URL}`,
      customer_email: req?.user?.email,
      client_reference_id: req?.user?._id?.toString(),
      mode: "payment",
      metadata: {
        ...shippingInfo,
        itemsPrice: body?.itemsPrice,
        taxAmount,
        shippingAmount,
        totalAmount,
      },
      line_items,
    });

    res.status(200).json({ url: session.url });
  }
);

// Helper to extract order items from Stripe line items
const getOrderItems = async (line_items) => {
  return new Promise((resolve, reject) => {
    let cartItems = [];

    line_items?.data?.forEach(async (item) => {
      const product = await stripe.products.retrieve(item.price.product);
      const productId = product.metadata.productId;

      cartItems.push({
        product: productId,
        name: product.name,
        price: item.price.unit_amount_decimal / 100,
        quantity: item.quantity,
        image: product.images[0],
      });

      if (cartItems.length === line_items?.data?.length) {
        resolve(cartItems);
      }
    });
  });
};

// Stripe Webhook => /api/v1/payment/webhook
export const stripeWebhook = catchAsyncErrors(async (req, res, next) => {
  try {
    const signature = req.headers["stripe-signature"];

    const event = stripe.webhooks.constructEvent(
      req.rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      const line_items = await stripe.checkout.sessions.listLineItems(
        session.id
      );

      const orderItems = await getOrderItems(line_items);
      const user = session.client_reference_id;

      // ✅ Retrieve metadata values
      const itemsPrice = parseFloat(session.metadata.itemsPrice);
      const taxAmount = parseFloat(session.metadata.taxAmount);
      const shippingAmount = parseFloat(session.metadata.shippingAmount);
      const totalAmount = parseFloat(session.metadata.totalAmount);

      const shippingInfo = {
        address: session.metadata.address,
        city: session.metadata.city,
        phoneNo: session.metadata.phoneNo,
        zipCode: session.metadata.zipCode,
        country: session.metadata.country,
      };

      const paymentInfo = {
        id: session.payment_intent,
        status: session.payment_status,
      };

      const orderData = {
        shippingInfo,
        orderItems,
        itemsPrice,
        taxAmount,
        shippingAmount,
        totalAmount,
        paymentInfo,
        paymentMethod: "Card",
        user,
      };

      await Order.create(orderData);

      res.status(200).json({ success: true });
    }
  } catch (error) {
    console.log("Error => ", error);
    
  }
});