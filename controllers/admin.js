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

  const product = new Product(
    title,
    price,
    description,
    imageUrl,
    req.user._id
  );
  product
    .save()
    .then((result) => {
      console.log("Succesfully created product");
      res.redirect("/admin/products");
    })
    .catch((err) => console.log(err));
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/");
  }

  const productId = req.params.productId;
  Product.findById(productId)
    .then((product) => {
      res.render("admin/edit-product", {
        path: `/admin/add-product`,
        editing: editMode,
        pageTitle: product.title,
        product: product,
      });
    })
    .catch((err) => console.log(err));
};

exports.postEditProduct = (req, res, next) => {
  const productId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedImageUrl = req.body.imageUrl;
  const updatedPrice = req.body.price;
  const updateDescription = req.body.description;

  const editedProduct = new Product(
    updatedTitle,
    updatedPrice,
    updateDescription,
    updatedImageUrl
  );

  editedProduct
    .update(productId)
    .then((result) => {
      res.redirect("/admin/products");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getProducts = (req, res, next) => {
  // req.user
  //   .getProducts()
  //   .then((products) => {
  Product.fetchAll()
    .then((products) => {
      res.render("admin/products", {
        prods: products,
        path: "/admin/products",
        pageTitle: "Admin Products",
      });
    })
    .catch((err) => {
      console.log(err);
    });
  // })
  // .catch((err) => {
  //   console.log(err);
  // });
};

exports.postDeleteProduct = (req, res, next) => {
  const productId = req.body.productId;
  Product.deleteById(productId)
    .then((resut) => {
      res.redirect("/admin/products");
    })
    .catch((err) => {
      console.log(err);
    });
};
