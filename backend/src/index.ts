import express from "express";

const app = express();
app.use(express.json());

app.get("/user", (req, res) => {
  const { name } = req.body;

  res.send(name);
});

app.listen(3000, () => {
  console.log("working");
});
