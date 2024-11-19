const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const productSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model("Product", productSchema);

// const mongodb = require("mongodb");

// const getDb = require("../utils/database").getDb;

// class Product {
//   constructor(title, price, description, imageUrl, userId) {
//     this.title = title;
//     this.price = price;
//     this.description = description;
//     this.imageUrl = imageUrl;
//     this.userId = userId;
//   }

//   save() {
//     const db = getDb();

//     return db
//       .collection("products")
//       .insertOne(this)
//       .then()
//       .catch((err) => {
//         console.log(err);
//       });
//   }

//   update(prodId) {
//     const db = getDb();

//     const objectId = new mongodb.ObjectId(prodId);

//     return db
//       .collection("products")
//       .updateOne({ _id: objectId }, { $set: this })
//       .then((result) => {
//         console.log("Product updated!");
//         return result;
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//   }

//   static fetchAll() {
//     const db = getDb();

//     return db
//       .collection("products")
//       .find()
//       .toArray()
//       .then((products) => {
//         return products;
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//   }

//   static findById(prodId) {
//     const db = getDb();

//     const objectId = new mongodb.ObjectId(prodId);

//     return db
//       .collection("products")
//       .find({ _id: objectId }) //we expect to receive one product with this id
//       .next() //get the last document return by find
//       .then((product) => {
//         console.log(product);
//         return product;
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//   }

//   static deleteById(prodId) {
//     const db = getDb();

//     const objectId = new mongodb.ObjectId(prodId);

//     return db
//       .collection("products")
//       .deleteOne({ _id: objectId })
//       .then((result) => {
//         console.log("Succesfuly deleted product!!");
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//   }
// }

// module.exports = Product;
