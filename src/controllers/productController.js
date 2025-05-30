import Product from "../models/Product.js";

export const addProduct = async (req, res) => {
  try {
    const productData = req.body;
    const newProduct = await Product.create(productData);
    return res.status(201).json({
      status: 201,
      product: newProduct,
      message: "Berhasil add Product",
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const findProductById = async (req, res) => {
  const { product_id } = req.params;
  try {
    const product = await Product.findProductById(product_id);

    return res.status(200).json({ status: 200, product: product });
  } catch (err) {
    return res.status(500).json({ status: 500, error: err.message });
  }
};

export const findProductByName = async (req, res) => {
  const { name } = req.params;
  try {
    const product = await Product.findProductByName(name);
    return res.status(200).json({ status: 200, product: product });
  } catch (err) {
    return res.status(500).json({ status: 500, error: err.message });
  }
};
