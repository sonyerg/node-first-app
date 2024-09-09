const mongodb = require("mongodb");

const getDb = require("../utils/database").getDb;

const ObjectId = mongodb.ObjectId;

class User {
  constructor(username, email, id, cart) {
    this.name = username;
    this.email = email;
    this._id = id;
    this.cart = cart; // {items: []}
  }

  save() {
    const db = getDb();

    return db.collection("users").insertOne(this).then().catch();
  }

  addToCart(product) {
    const db = getDb();

    const cartProductIndex = this.cart.items.findIndex((cp) => {
      return cp.productId.toString() === product._id.toString();
    });

    let newQuantity = 1;

    const updatedCartItems = [...this.cart.items];

    if (cartProductIndex >= 0) {
      newQuantity = this.cart.items[cartProductIndex].quantity + 1;
      updatedCartItems[cartProductIndex].quantity = newQuantity;
    } else {
      updatedCartItems.push({
        productId: new ObjectId(product._id),
        quantity: newQuantity,
      });
    }

    return db
      .collection("users")
      .updateOne(
        { _id: new ObjectId(this._id) },
        { $set: { cart: { items: updatedCartItems } } }
      );
  }

  getCart() {
    const db = getDb();

    //returns an array of productIds
    const productIds = this.cart.items.map((i) => {
      return i.productId;
    });

    return db
      .collection("products")
      .find({ _id: { $in: productIds } })
      .toArray()
      .then((products) => {
        return products.map((p) => {
          return {
            ...p,
            quantity: this.cart.items.find((i) => {
              return i.productId.toString() === p._id.toString();
            }).quantity,
          };
        });
      });
  }

  deleteItemFromCart(productId) {
    const updatedCartItems = this.cart.items.filter((item) => {
      return item.productId.toString() !== productId.toString();
    });

    const db = getDb();

    return db
      .collection("users")
      .updateOne(
        { _id: new ObjectId(this._id) },
        { $set: { cart: { items: updatedCartItems } } }
      );
  }

  static findById(userId) {
    const db = getDb();

    return db.collection("users").findOne({ _id: new ObjectId(userId) });
  }
}

module.exports = User;
