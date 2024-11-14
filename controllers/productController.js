import Product from "../models/product.js";
import * as dotenv from "dotenv";
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
      image,
      categoryId,
      inStock,
      location,
    } = req.body;

    const newProduct = new Product({
      merchant_id,
      name,
      price,
      weight,
      description,
      quantity,
      image,
      categoryId,
      inStock,
      location,
    });

    await newProduct.save();
    res.status(200).send({ message: "Product successfully created!" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

//FETCH ALL PRODUCT API
const getAllProduct = async (req, res) => {
  try {
    const { searchQuery } = req.query;
    let products;

    // If searchQuery exists, perform a search, otherwise return all products
    if (searchQuery) {
      products = await Product.find({
        $or: [
          { name: { $regex: searchQuery, $options: "i" } },
          { description: { $regex: searchQuery, $options: "i" } },
        ],
      }).populate("merchant_id"); // Populate merchant details
    } else {
      products = await Product.find().populate("merchant_id"); // Populate merchant details
    }

    res.status(200).send({ allProduct: products });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

//FETCH ALL PRODUCT BASED ON ID API
const getAllProductID = async (req, res) => {
  try {
    const { id } = req.params;
    const products = await Product.findById(id);

    res.status(200).json(products);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

//UPDATE PRODUCT API
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndUpdate(id, req.body);

    if (!product) {
      return res.status(404).json({ message: "Product Not Found" });
    }

    const updatedProduct = await Product.findById(id);
    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({ message: "Product Not Found" });
    }

    res.status(200).json({ message: "Product Deleted" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

export {
  addProduct,
  getAllProduct,
  getAllProductID,
  updateProduct,
  deleteProduct,
};
