const fs = require("fs");

const requestHandler = (req, res) => {
  const url = req.url;
  const method = req.method;

  if (url === "/") {
    res.write("<html>");
    res.write("<body>");
    res.write("<h1>Hello from NodeJS server</h1>");
    res.write("<ul><li>User 1</l1><li>User 2</li></ul>");
    res.write(
      '<form action="/create-user" method="POST"><input type="text" name="username" /><button type="submit">Send</button></form>'
    );
    res.write("</body>");
    res.write("</html>");
    return res.end();
  }

  if (url === "/create-user" && method === "POST") {
    const body = [];

    req.on("data", (chunk) => {
      console.log(chunk);
      body.push(chunk);
    });

    return req.on("end", () => {
      const parsedBody = Buffer.concat(body).toString();
      const username = parsedBody.split("=")[1];
      console.log(username);
      fs.writeFile("message.txt", username, (error) => {
        res.writeHead(302, { Location: "/" });
        return res.end();
      });
    });
  }

  res.setHeader("Content-Type", "text/html");
  res.write("<html>");
  res.write("<body><h1>Hello from NodeJS server</h1></body>");
  res.write("</html>");
  res.end();
};

//module.exports = requestHandler
/**module.exports = {
        handler: requestHandler,
        someText: "Some text"
}
**/

exports.handler = requestHandler;
