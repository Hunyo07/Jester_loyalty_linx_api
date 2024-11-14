import express from "express";
import cors from "cors";
import morgan from "morgan";
import * as dotenv from "dotenv";
import { connectDB } from "./config/database.js";

// user routes
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import rewardRoutes from "./routes/rewardRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import merchantRoutes from "./routes/merchantRoute.js";
import logRoutes from "./routes/logRoutes.js";
import uploadRoutes from "./routes/uploadRoute.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import orderDetailsRoutes from "./routes/orderDetailesRoutes.js";
import transactionRoutes from "./routes/transactionsRoutes.js"
// initialize app
const app = express();
const port = process.env.PORT || 5000;
dotenv.config();

// middlewares
app.use(cors());
// app.use(
//   cors({
//     origin: "https://loyalty-linx-web.vercel.app",
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//   })
// );
app.use(morgan("dev"));
app.use(express.json());

// connectDB();

// // endpoints
// app.get('/api/test', (req, res) => {
//     res.send('Hello World!');
// });
// app.use("/api/user", userRoutes);
// app.use("/api/rewards", rewardRoutes);

const startServer = () => {
  try {
    connectDB();
    app.listen(port, () => {
      console.log(`Server is running on ${port}`);
    });
  } catch (error) {
    console.log(error);
  }
};

startServer();

// endpoints
app.get("/api/test", (req, res) => {
  res.send("Hello World!s");
});

app.use("/api/user", userRoutes);
app.use("/api/product", productRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/rewards", rewardRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/merchant", merchantRoutes);
app.use("/api/logs", logRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/orderDetails", orderDetailsRoutes);
