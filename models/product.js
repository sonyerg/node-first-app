const fs = require("fs");
const path = require("path");

const rootDir = require("../utils/path");
const Cart = require("./cart");

const p = path.join(rootDir, "data", "products.json");

const getProductsFromFile = (cb) => {
  fs.readFile(p, (err, fileContent) => {
    if (err) {
      return cb([]);
    } else {
      cb(JSON.parse(fileContent));
    }
  });
};

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
    getProductsFromFile((products) => {
      if (this.id) {
        const existingProductIndex = products.findIndex(
          (product) => product.id === this.id
        );

        const updatedProducts = [...products];
        updatedProducts[existingProductIndex] = this;

        fs.writeFile(p, JSON.stringify(updatedProducts), (err) => {
          console.log(`Error saving exising product: ${err}`);
        });
      } else {
        this.id = Math.random().toString();
        products.push(this);
        fs.writeFile(p, JSON.stringify(products), (err) => {
          console.log("error in getproducts save", err);
        });
      }
    });
  }

  //Static methods belong to the class itself and do not operate on specific instances.
  //They can be called without creating an object of the class.
  static fetchAll(cb) {
    getProductsFromFile(cb);
  }

  static findById(id, cb) {
    getProductsFromFile((products) => {
      const product = products.find((product) => product.id === id);
      cb(product);
    });
  }

  static deleteById(id) {
    getProductsFromFile((products) => {
      const product = products.find((product) => product.id === id);
      const filteredProducts = products.filter((product) => product.id !== id);

      fs.writeFile(p, JSON.stringify(filteredProducts), (err) => {
        if (!err) {
          //TODO: remove from cart
          Cart.deleteProduct(id, product.price);
        }
      });
    });
  }
};
