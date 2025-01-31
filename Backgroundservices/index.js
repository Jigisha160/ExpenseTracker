const express = require("express");
const cron = require("node-cron");
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config();

mongoose
  .connect(process.env.DB_CONNECTION)
  .then(() => {
    console.log("DB connection is successfull");
  })
  .catch((e) => {
    console.log(e);
  });

const run = () => {
  cron.schedule("* * * * * *", () => {
    console.log('running a task every second');
  });
};
run();
const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Backgroundservice is running on port ${PORT}`);
});
