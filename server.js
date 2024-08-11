const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const utils = require("./utils");
const config = require("./config");
const userRouter = require("./routes/user");

const app = express();

app.use(cors());
app.use(express.json());

app.use((request, response, next) => {
  if (request.url === "/provider/login") {
    next();
  } else {
    const token = request.headers["token"];
    if (!token || token.length === 0) {
      response.send(utils.errorResult("missing token"));
    } else {
      try {
        const payload = jwt.verify(token, config.secret);
        request.userId = payload["id"];
        next();
      } catch (ex) {
        response.send(utils.errorResult("invalid token"));
      }
    }
  }
});
app.use("/provider", userRouter);

app.listen(5000, "0.0.0.0", () => {
  console.log("server started on port 5000");
});
