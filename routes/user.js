const express = require("express");
const db = require("../db");
const utils = require("../utils");
const crypto = require("crypto-js");
const jwt = require("jsonwebtoken");

const router = express.Router();

router.post("/login", (request, response) => {
  const { email, password } = request.body;

  const encryptedPassword = String(crypto.SHA256(password));
  const statement =
    "SELECT id, first_name, last_name FROM provider WHERE email = ? AND password = ?";
  db.pool.execute(statement, [email, encryptedPassword], (error, result) => {
    if (error) {
      response.send(utils.errorResult(error));
    } else {
      if (result.length === 0)
        response.send(utils.errorResult("user not found"));
      else {
        const user = result[0];
        const payload = { id: user.id };
        const token = jwt.sign(payload, config.secret);
        const userData = {
          token,
          name: `${user.firstName + " " + user.lastName}`,
        };
        response.send(utils.successResult(userData));
      }
    }
  });
});

router.get("/detail", (request, response) => {
  const statement = `select first_name, last_name, email, phone_number, city, zip_code, provider_image_path from provider where id = ?`;
  const user_id = request.userId;
  db.pool.execute(statement, [user_id], (error, data) => {
    response.send(utils.successError(error, data));
  });
});

router.put("/edit", (request, response) => {
  const user_id = request.userId;
  const { email, mobile, city, pincode } = request.body;
  const statement = `update provider set email = ?, phone_number = ?, city = ?, zip_code = ? where id = ?;`;
  db.pool.execute(statement, [email, mobile, city, pincode], (error, data) => {
    response.send(utils.successError(error, data));
  });
});

router.get("/orders", (request, response) => {
  const statement = `select order_id, user_id, subcategory_id, provider_id, status, description, rate, date, time  from orders where provider_id = ?;`;
  const user_id = request.userId;
  db.pool.execute(statement, [user_id], (error, data) => {
    response.send(utils.successError(error, data));
  });
});

router.get("/bookings", (request, response) => {
  const statement = `select booking_id, user_id, subcategory_id, provider_id, status, date, time  from orders where provider_id = ?;`;
  const user_id = request.userId;
  db.pool.execute(statement, [user_id], (error, data) => {
    response.send(utils.successError(error, data));
  });
});
module.exports = router;
