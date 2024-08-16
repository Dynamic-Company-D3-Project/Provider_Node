const express = require("express");
const db = require("../db");
const utils = require("../utils");
const crypto = require("crypto-js");
const config = require("../config");
const jwt = require("jsonwebtoken");

const router = express.Router();

router.post("/login", (request, response) => {
  const { email, password } = request.body;

  const encryptedPassword = String(crypto.SHA256(password));
  const statement =
    "SELECT id, first_name, last_name FROM provider WHERE email = ? AND password = ? and is_deleted = false";
  db.pool.execute(statement, [email, password], (error, result) => {
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
          name: `${user.first_name} ${user.last_name}`,
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
  db.pool.execute(
    statement,
    [email, mobile, city, pincode, user_id],
    (error, data) => {
      response.send(utils.successError(error, data));
    }
  );
});

router.get("/orders", (request, response) => {
  const statement = `select order_id, DATE_FORMAT(order_date, '%Y-%m-%d') AS order_date, description, order_rate, status, order_time, 
  subcategory_id, first_name, last_name,
   address.house_no,
    address.street,
    address.city,
    address.pincode,
    address.state 
   from orders 
  JOIN 
    user on orders.user_id = user.id
  JOIN
    address ON address.address_id = orders.address_id
   where provider_id = ?;`;
  const user_id = request.userId;
  db.pool.execute(statement, [user_id], (error, data) => {
    response.send(utils.successError(error, data));
  });
});

router.get("/chart", (request, response) => {
  const statement = `select DATE_FORMAT(order_date, '%Y-%m-%d') as order_date, count(*) from 
  orders
   where provider_id = 1 
  group by order_date
 `;

  const user_id = request.userId;
  db.pool.execute(statement, [user_id], (error, data) => {
    response.send(utils.successError(error, data));
  });
});

router.get("/bookings", (request, response) => {
  const statement = `SELECT 
    bookings.booking_id, 
    DATE_FORMAT(bookings.booking_date, '%Y-%m-%d') AS booking_date, 
    bookings.status, 
    bookings.booking_time, 
    subcategory.price, 
    user.first_name, 
    user.last_name,
    address.house_no,
    address.street,
    address.city,
    address.pincode,
    address.state 
FROM 
    bookings 
JOIN 
    user ON bookings.user_id = user.id 
JOIN 
    subcategory ON bookings.subcategory_id = subcategory.id 
JOIN
    address ON address.address_id = bookings.address_id
WHERE 
    bookings.provider_id = ?;`;
  const user_id = request.userId;
  db.pool.execute(statement, [user_id], (error, data) => {
    response.send(utils.successError(error, data));
  });
});

router.put("/remove", (request, response) => {
  const id = request.query.id;

  const statement = `update bookings set status = 'PENDING' ,provider_id = null where provider_id = ? and booking_id = ?;`;
  const user_id = request.userId;
  db.pool.execute(statement, [user_id, id], (error, data) => {
    response.send(utils.successError(error, data));
  });
});
router.put("/accept", (request, response) => {
  const id = request.query.id;

  const statement = `update bookings set status = 'ONGOING' where provider_id = ? and booking_id = ?;`;
  const user_id = request.userId;
  db.pool.execute(statement, [user_id, id], (error, data) => {
    response.send(utils.successError(error, data));
  });
});

module.exports = router;
