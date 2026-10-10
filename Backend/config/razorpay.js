import dotenv from "dotenv";
import Razorpay from "razorpay";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

dotenv.config({ path: resolve(dirname(fileURLToPath(import.meta.url)), "../.env") });

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

if (!keyId || !keySecret) {
    throw new Error("RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set in Backend/.env");
}

const razorpay = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
});

export default razorpay;
