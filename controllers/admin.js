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
  const title = req.body.title;
  const price = req.body.price;
  const image = req.file;
  const description = req.body.description;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      path: "/admin/add-product",
      pageTitle: "Add Product",
      product: {
        title,
        price,
        description,
      },
      editing: false,
      hasError: true,
      validationErrors: errors.array(),
      errorMessage: errors.array()[0].msg,
    });
  }

  if (!image) {
    return res.status(422).render("admin/edit-product", {
      path: "/admin/add-product",
      pageTitle: "Add Product",
      product: {
        title,
        price,
        description,
      },
      editing: false,
      hasError: true,
      validationErrors: [],
      errorMessage: "Attached file is not an image",
    });
  }

  const imageUrl = image.path;

  const product = new Product({
    title,
    price,
    description,
    imageUrl,
    userId: req.user,
  });

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
  const image = req.file;
  const updatedPrice = req.body.price;
  const updatedDescription = req.body.description;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render("admin/edit-product", {
      path: `/admin/edit-product`,
      pageTitle: "Edit Product",
      product: {
        title: updatedTitle,
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
    const product = await Product.findById(productId);

    if (product.userId.toString() !== req.user._id.toString()) {
      return res.redirect("/");
    }

    product.title = updatedTitle;
    product.price = updatedPrice;
    product.description = updatedDescription;

    if (image) {
      product.imageUrl = image.path;
    }

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
