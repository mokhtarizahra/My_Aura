import Service from "../models/Service.js";


// CREATE SERVICE
export const createService = async (req, res) => {
  try {

    const { title, description, price, category } = req.body;

    const service = await Service.create({
      title,
      description,
      price,
      category,
      seller: req.user.id
    });

    res.status(201).json({
      success: true,
      service
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};


// GET ALL SERVICES (Marketplace list)
export const getAllServices = async (req, res) => {
  try {
    const { keyword, category, minPrice, maxPrice } = req.query;

    let query = { isActive: true };

// Search in title or description (Keyword Search)
    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ];
    }

    // filter by category 
    if (category) {
      query.category = category;
    }

    // filter by price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const services = await Service.find(query)
      .populate("seller", "name avatar")
      .sort("-createdAt");

    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// GET SINGLE SERVICE
export const getSingleService = async (req, res) => {
  try {

    const service = await Service.findById(req.params.id)
      .populate("seller", "name avatar email");

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found"
      });
    }

    res.status(200).json({
      success: true,
      service
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};



// UPDATE SERVICE
export const updateService = async (req, res) => {
  try {

    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found"
      });
    }

    if (service.seller.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized"
      });
    }

    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.status(200).json({
      success: true,
      service: updatedService
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};


// DELETE SERVICE
export const deleteService = async (req, res) => {
  try {

    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found"
      });
    }

    if (service.seller.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized"
      });
    }

    await service.deleteOne();

    res.status(200).json({
      success: true,
      message: "Service deleted"
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};


// GET MY SERVICES
export const getMyServices = async (req, res) => {
  try {

    const services = await Service.find({ seller: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: services.length,
      services
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};
