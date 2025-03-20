const { validationResult } = require("express-validator");
const {
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const crypto = require("crypto");

const Product = require("../models/product");
const fileHelper = require("../utils/file");

const BUCKET_NAME = process.env.BUCKET_NAME;

const randomImageName = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("hex");

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

exports.postAddProduct = async (req, res, next) => {
  const title = req.body.title;
  const price = req.body.price;
  const image = req.file.buffer;
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

  const imageName = randomImageName();

  const putCommand = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: imageName,
    Body: image,
    ContentType: req.file.mimetype,
  });

  try {
    await req.s3.send(putCommand);

    const getCommand = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: imageName,
    });

    const imageUrl = await getSignedUrl(req.s3, getCommand, {
      expiresIn: 3600,
    });

    const product = new Product({
      title,
      price,
      description,
      imageUrl,
      imageName,
      userId: req.user,
    });

    await product.save();
    console.log("Successfully created product");
    res.redirect("/admin/products");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
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
      const imageName = randomImageName();

      const putCommand = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: imageName,
        Body: image.buffer,
        ContentType: req.file.mimetype,
      });

      const getCommand = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: imageName,
      });

      const deleteCommand = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: product.imageName,
      });

      const imageUrl = await getSignedUrl(req.s3, getCommand, {
        expiresIn: 3600,
      });

      await Promise.all([req.s3.send(putCommand), req.s3.send(deleteCommand)]);

      product.imageUrl = imageUrl;
      product.imageName = imageName;
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

    for (const product of products) {
      const command = new GetObjectCommand({
        Bucket: process.env.BUCKET_NAME,
        Key: product.imageName,
      });

      const imageUrl = await getSignedUrl(req.s3, command, {
        expiresIn: 3600,
      });

      product.imageUrl = imageUrl;
    }

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

exports.deleteProduct = async (req, res, next) => {
  const productId = req.params.productId;

  try {
    const product = await Product.findById(productId);

    if (!product) {
      return next(new Error("Product not found"));
    }

    // Check user authorization
    if (product.userId.toString() !== req.user._id.toString()) {
      return res.status(403).redirect("/");
    }

    // Delete from S3
    const deleteCommand = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: product.imageName,
    });

    // Delete from S3 and MongoDB in parallel
    await Promise.all([
      req.s3.send(deleteCommand),
      Product.deleteOne({ _id: productId, userId: req.user._id }),
    ]);

    // Delete the image file
    // fileHelper.deleteFile(imagePath);

    return res.status(200).json({ message: "Delete product success!" });
  } catch (err) {
    return res.status(500).json({ message: "Delete product failed" });
  }
};
