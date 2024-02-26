import express from "express";
import cors from "cors";
import Stripe from "stripe";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = 5000;

app.use(express.json());
app.use(cors());

//chekout API
app.use("/api/create-checkout-session", async (req, res) => {
    const stripe = new Stripe(`${process.env.STRIPE_SECRET_KEY}`);
    const cart = req.body;

    const line_items = cart.map((currElem) => {
        return {
            price_data: {
                currency: "inr",
                product_data: {
                    name: currElem.name,
                    images: [currElem.image]
                },
                unit_amount: currElem.price,
            },
            quantity: currElem.amount
        }
    });

    line_items.push({
        price_data: {
            currency: "inr",
            product_data: {
                name: "Shipping Fee",
                images: ["https://www.newlivingconcept.com/image/newlivingconcept/image/data/all_product_images/product-594/jOmFWoNo1631522288.png"]
            },
            unit_amount: 500 * 100,
        },
        quantity: 1
    })
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items,
        mode: "payment",
        success_url: `${process.env.FRONTEND_URL}/success`,
        cancel_url: `${process.env.FRONTEND_URL}/cancel`
    });

    return res.status(200).json({ id: session.id });
});

app.listen(PORT, () => {
    console.log(`Server is Listening at http://localhost:${PORT}`);
});