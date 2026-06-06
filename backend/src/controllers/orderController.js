import Order from "../models/Order.js";
import Service from "../models/Service.js";


// CREATE ORDER
export const createOrder = async (req, res) => {
  try {
    const { serviceId, message } = req.body;

    const service = await Service.findById(serviceId);

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    if (!service.isActive) {
      return res.status(400).json({
        message: "This service is not available",
      });
    }

    // prevent purching service themselves
    if (service.seller.toString() === req.user.id) {
      return res.status(400).json({
        message: "You cannot order your own service",
      });
    }

    // delivery date
    const deliveryDate = new Date();
    deliveryDate.setDate(
      deliveryDate.getDate() + service.deliveryTime
    );

    // create order
    const order = await Order.create({
      service: service._id,
      buyer: req.user.id,
      seller: service.seller,
      price: service.price,
      message,
      deliveryDate,
    });

    res.status(201).json(order);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// GET BUYER ORDERS
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user.id })
      .populate("service", "title price")
      .populate("seller", "name avatar")
      .sort("-createdAt");

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// GET SELLER ORDERS
export const getSales = async (req, res) => {
  try {
    const orders = await Order.find({ seller: req.user.id })
      .populate("service", "title price")
      .populate("buyer", "name avatar")
      .sort("-createdAt");

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// GET SINGLE ORDER
export const getSingleOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("service", "title description price")
      .populate("buyer", "name avatar email")
      .populate("seller", "name avatar email");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const isBuyer = order.buyer._id.toString() === req.user.id;
    const isSeller = order.seller._id.toString() === req.user.id;

    if (!isBuyer && !isSeller) {
      return res.status(403).json({ message: "Not authorized to view this order" });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// UPDATE ORDER STATUS (SELLER)
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "pending",
      "accepted",
      "in_progress",
      "completed",
      "cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    order.status = status;

    const updatedOrder = await order.save();

    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
