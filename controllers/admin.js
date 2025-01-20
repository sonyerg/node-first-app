const Product = require("../models/product");

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const price = req.body.price;
  const imageUrl = req.body.imageUrl;
  const description = req.body.description;

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
    .catch((err) => console.log(err));
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
    });
  } catch (err) {
    console.error("Error getEditProduct:", err);
  }

  // Product.findById(productId)
  //   .then((product) => {
  //     res.render("admin/edit-product", {
  //       path: `/admin/add-product`,
  //       editing: editMode,
  //       pageTitle: product.title,
  //       product: product,
  //     });
  //   })
  //   .catch((err) => console.log(err));
};

exports.postEditProduct = async (req, res, next) => {
  const productId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedImageUrl = req.body.imageUrl;
  const updatedPrice = req.body.price;
  const updatedDescription = req.body.description;

  // Product.findById(productId)
  //   .then((product) => {
  //     if (product.userId.toString() !== req.user._id.toString()) {
  //       return res.redirect("/");
  //     }

  //     product.title = updatedTitle;
  //     product.imageUrl = updatedImageUrl;
  //     product.price = updatedPrice;
  //     product.description = updateDescription;

  //     return product.save().then((result) => {
  //       res.redirect("/admin/products");
  //     });
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //   });

  try {
    const product = await Product.findById(productId);

    if (product.userId.toString() !== req.user._id.toString()) {
      return res.redirect("/");
    }

    product.title = updatedTitle;
    product.imageUrl = updatedImageUrl;
    product.price = updatedPrice;
    product.description = updatedDescription;

    await product.save();
    res.redirect("/admin/products");
  } catch (err) {
    console.error("Error editing the product:", err);
    res.status(500).redirect("/");
  }
};

exports.getProducts = async (req, res, next) => {
  // control which fields to populate or select
  // .select("title price description imageUrl -_id")
  // .populate("userId", "name")
  // Product.find({ userId: req.user._id });
  // .then((products) => {
  //   console.log(products);
  //   res.render("admin/products", {
  //     prods: products,
  //     path: "/admin/products",
  //     pageTitle: "Admin Products",
  //   });
  // })
  // .catch((err) => {
  //   console.log(err);
  // });

  try {
    const products = await Product.find({ userId: req.user._id });

    res.render("admin/products", {
      prods: products,
      path: "/admin/products",
      pageTitle: "Admin Products",
    });
  } catch (err) {
    console.error("Error getting products", err);
    res.status(500).redirect("/");
  }
};

exports.postDeleteProduct = async (req, res, next) => {
  const productId = req.body.productId;
  // Product.deleteOne({ _id: productId, userId: req.user._id })
  //   .then((resut) => {
  //     res.redirect("/admin/products");
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //   });

  try {
    await Product.deleteOne({
      _id: productId,
      userId: req.user._id,
    });

    res.redirect("/admin/products");
  } catch (err) {
    console.error("Error deleting product", err);
  }
};
