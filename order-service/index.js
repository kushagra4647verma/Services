const express = require("express");
const axios = require("axios");

const app = express();

const orders = {
  101: { id: 101, userId: 1, item: "Laptop" }
};

app.get("/orders/:id", async (req, res) => {
  const order = orders[req.params.id];

  const userRes = await axios.get(
    `http://user-service:3001/users/${order.userId}`
  );

  res.json({
    order,
    user: userRes.data
  });
});

app.listen(3002, () => {
  console.log("Order Service running on 3002");
});
