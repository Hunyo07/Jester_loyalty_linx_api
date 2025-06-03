import Product from "../models/product.js";
import * as dotenv from "dotenv";
import { cloudinary } from "../config/cloudinary.js";
dotenv.config();

const addProduct = async (req, res) => {
  try {
    const {
      merchant_id,
      name,
      price,
      weight,
      description,
      quantity,
      categoryId,
      inStock,
      location,
      image,
    } = req.body;
    // Handle image upload to Cloudinary
    let imageUrl;
    if (image) {
      // For base64 image data
      const result = await cloudinary.uploader.upload(image, {
        folder: "products",
      });
      imageUrl = result.secure_url;
    }

    // Validate required fields
    if (!merchant_id || !name || !price || !weight || !categoryId || !image) {
      return res.status(400).json({
        message: "Missing required fields",
        required: [
          "merchant_id",
          "name",
          "price",
          "weight",
          "categoryId",
          "image",
        ],
      });
    }

    const newProduct = new Product({
      merchant_id,
      name,
      price,
      weight,
      description: description || "",
      quantity: quantity || 0,
      image: imageUrl,
      categoryId,
      inStock: inStock ?? true,
      location: location || "",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const savedProduct = await newProduct.save();
    res.status(201).json({
      message: "Product successfully created!",
      product: savedProduct,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create product",
      error: error.message,
    });
  }
};
const getAllProduct = async (req, res) => {
  try {
    const {
      searchQuery,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      order = "desc",
      category,
      minPrice,
      maxPrice,
    } = req.query;

    // Build filter object
    const filter = {};

    if (searchQuery) {
      filter.$or = [
        { name: { $regex: searchQuery, $options: "i" } },
        { description: { $regex: searchQuery, $options: "i" } },
      ];
    }

    if (category) {
      filter.categoryId = category;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build sort object
    const sortOptions = {};
    sortOptions[sortBy] = order === "desc" ? -1 : 1;

    const products = await Product.find(filter)
      .populate("merchant_id", "name email")
      .populate("categoryId", "name")
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(filter);

    res.status(200).json({
      products,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};

const getAllProductID = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id)
      .populate("merchant_id", "name email")
      .populate("categoryId", "name");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch product",
      error: error.message,
    });
  }
};

const getProductsByMerchantId = async (req, res) => {
  try {
    const { merchantId } = req.params;
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      order = "desc",
    } = req.query;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build sort object
    const sortOptions = {};
    sortOptions[sortBy] = order === "desc" ? -1 : 1;

    const products = await Product.find({ merchant_id: merchantId })
      .populate("merchant_id", "name email")
      .populate("categoryId", "name")
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments({ merchant_id: merchantId });

    if (!products.length) {
      return res.status(404).json({
        message: "No products found for this merchant",
      });
    }

    res.status(200).json({
      products,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch merchant products",
      error: error.message,
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body, updatedAt: new Date() };

    // Validate price and weight if they're being updated
    if (updates.price && updates.price <= 0) {
      return res
        .status(400)
        .json({ message: "Price must be a positive number" });
    }
    if (updates.weight && updates.weight <= 0) {
      return res
        .status(400)
        .json({ message: "Weight must be a positive number" });
    }

    const product = await Product.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    })
      .populate("merchant_id", "name email")
      .populate("categoryId", "name");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update product",
      error: error.message,
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await Product.findByIdAndDelete(id);
    res.status(200).json({
      message: "Product deleted successfully",
      deletedProduct: product,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete product",
      error: error.message,
    });
  }
};

export {
  addProduct,
  getAllProduct,
  getAllProductID,
  updateProduct,
  deleteProduct,
  getProductsByMerchantId,
};
