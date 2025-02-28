const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { Order, SKU, Customer, Counter } = require("../models");

// Order ID Generation Logic
async function getNextOrderId() {
  const counter = await Counter.findOneAndUpdate(
    { name: "order" },
    { $inc: { value: 1 } },
    { new: true, upsert: true }
  );
  return `OD-${counter.value.toString().padStart(5, "0")}`;
}

router.post("/", auth, async (req, res) => {
  try {
    const { customer_id, sku_id, quantity, rate } = req.body;

    // Fetch related entities with ownership check
    const [customer, sku] = await Promise.all([
      Customer.findOne({ _id: customer_id, createdBy: req.user._id }),
      SKU.findOne({ _id: sku_id, createdBy: req.user._id }),
    ]);

    if (!customer || !sku) {
      return res
        .status(404)
        .json({ message: "Customer/SKU not found or access denied" });
    }

    // Calculate total amount with tax
    const total_amount = quantity * rate * (1 + sku.tax_rate / 100);

    // Create order
    const order = new Order({
      order_id: await getNextOrderId(),
      customer_id: customer._id,
      sku_id: sku._id,
      quantity,
      rate,
      total_amount,
      createdBy: req.user._id,
    });

    await order.save();

    // WebSocket Notification
    const populatedOrder = await Order.populate(order, [
      { path: "customer_id" },
      { path: "sku_id" },
      { path: "createdBy", select: "username" },
    ]);

    req.app.locals.io.to("admin").emit("new_order", {
      message: "New order placed",
      order_id: order.order_id,
      user: populatedOrder.createdBy.username,
      customer: populatedOrder.customer_id.name,
      sku: populatedOrder.sku_id.sku_name,
      total_amount: order.total_amount,
      timestamp: order.timestamp,
    });

    res.status(201).json({
      order_id: order.order_id,
      customer: customer.name,
      sku: sku.sku_name,
      total_amount: order.total_amount,
      timestamp: order.timestamp,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/", auth, async (req, res) => {
  try {
    const filter = req.user.role === "admin" ? {} : { createdBy: req.user._id };
    const orders = await Order.find(filter)
      .populate("customer_id")
      .populate("sku_id");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
