const { validationResult } = require("express-validator");

const Product = require("../models/product");

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
    hasError: false,
    errorMessage: null,
    validationErrors: [],
  });
};

exports.postAddProduct = (req, res, next) => {
  const errors = validationResult(req);
  const title = req.body.title;
  const price = req.body.price;
  const imageUrl = req.file;
  const description = req.body.description;

  const product = new Product({
    title,
    price,
    description,
    imageUrl,
    userId: req.user,
  });

  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      path: "/admin/add-product",
      pageTitle: product.title,
      product,
      editing: false,
      hasError: true,
      validationErrors: errors.array(),
      errorMessage: errors.array()[0].msg,
    });
  }

  product
    .save()
    .then((result) => {
      console.log("Succesfully created product");
      res.redirect("/admin/products");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getEditProduct = async (req, res, next) => {
  const editMode = req.query.edit;
  const productId = req.params.productId;

  if (!editMode) {
    return res.redirect("/");
  }

  try {
    const product = await Product.findById(productId);

    if (product.userId.toString() !== req.user._id.toString()) {
      return res.status(401).redirect("/");
    }

    res.render("admin/edit-product", {
      path: "/admin/add-product",
      editing: editMode,
      pageTitle: product.title,
      product,
      hasError: false,
      errorMessage: null,
      validationErrors: [],
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postEditProduct = async (req, res, next) => {
  const productId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedImageUrl = req.body.imageUrl;
  const updatedPrice = req.body.price;
  const updatedDescription = req.body.description;
  const errors = validationResult(req);
  let product;

  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render("admin/edit-product", {
      path: `/admin/edit-product`,
      pageTitle: "Edit Product",
      product: {
        title: updatedTitle,
        imageUrl: updatedImageUrl,
        price: updatedPrice,
        description: updatedDescription,
        _id: productId,
      },
      hasError: true,
      editing: true,
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }

  try {
    product = await Product.findById(productId);

    if (product.userId.toString() !== req.user._id.toString()) {
      return res.redirect("/");
    }

    product.title = updatedTitle;
    product.imageUrl = updatedImageUrl;
    product.price = updatedPrice;
    product.description = updatedDescription;

    await product.save();
    return res.redirect("/admin/products");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ userId: req.user._id });

    res.render("admin/products", {
      prods: products,
      path: "/admin/products",
      pageTitle: "Admin Products",
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postDeleteProduct = async (req, res, next) => {
  const productId = req.body.productId;
  try {
    await Product.deleteOne({
      _id: productId,
      userId: req.user._id,
    });

    res.redirect("/admin/products");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};
