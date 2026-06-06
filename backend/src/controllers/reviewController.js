import Review from "../models/Review.js";
import Order from "../models/Order.js";
import Service from "../models/Service.js";

export const createReview = async (req, res) => {
  try {
    const { orderId, rating, comment } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // only buyer
    if (order.buyer.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not allowed to review this order" });
    }

    // only after completion
    if (order.status !== "completed") {
      return res.status(400).json({ message: "Order not completed yet" });
    }

    // Avoid duplicate reviews
    const existingReview = await Review.findOne({ order: orderId });

    if (existingReview) {
      return res.status(400).json({ message: "Review already submitted" });
    }

    const review = await Review.create({
      service: order.service,
      order: order._id,
      reviewer: req.user.id,
      rating,
      comment,
    });

    // Service rating update
    const stats = await Review.aggregate([
      { $match: { service: order.service } },
      {
        $group: {
          _id: "$service",
          avgRating: { $avg: "$rating" },
          count: { $sum: 1 },
        },
      },
    ]);

    await Service.findByIdAndUpdate(order.service, {
      ratingAverage: stats[0].avgRating,
      ratingCount: stats[0].count,
    });

    res.status(201).json(review);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Getting Reviews of a Service
export const getServiceReviews = async (req, res) => {
    try {
      const reviews = await Review.find({
        service: req.params.serviceId,
      })
        .populate("reviewer", "name avatar")
        .sort({ createdAt: -1 });
  
      res.json(reviews);
  
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  

  // Remove Review
  export const deleteReview = async (req, res) => {
    try {
  
      const review = await Review.findById(req.params.id);
  
      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }
  
      if (review.reviewer.toString() !== req.user.id) {
        return res.status(403).json({ message: "Not authorized" });
      }
  
      await review.deleteOne();
  
      res.json({ message: "Review removed" });
  
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  