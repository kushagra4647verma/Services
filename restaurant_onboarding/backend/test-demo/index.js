const express = require("express");
const app = express();

const users = {
  1: { id: 1, name: "Ishaan" }
};

app.get("/users/:id", (req, res) => {
  res.json(users[req.params.id]);
});

app.listen(3001, () => {
  console.log("User Service running on 3001");
});
