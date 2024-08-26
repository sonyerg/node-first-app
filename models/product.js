const db = require("../utils/datbase");

const Cart = require("./cart");

module.exports = class Product {
  constructor(id, title, imageUrl, price, description) {
    this.id = id;
    this.title = title;
    this.imageUrl = imageUrl;
    this.price = price;
    this.description = description;
  }

  //In OOP, specific instance refers to a unique object created from a class.
  save() {
    return db.execute(
      "INSERT INTO products (title, price, imageUrl, description) VALUES (?, ?, ?, ?)", //avoid sql injection
      [this.title, this.price, this.imageUrl, this.description]
    );
  }

  //Static methods belong to the class itself and do not operate on specific instances.
  //They can be called without creating an object of the class.
  static fetchAll() {
    return db.execute("SELECT * FROM products");
  }

  static findById(id) {
    return db.execute("SELECT * FROM products WHERE products.id = ?", [id]); // Select a single product by id
  }

  static deleteById(id) {}
};
