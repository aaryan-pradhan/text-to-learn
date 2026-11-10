require("dotenv").config();
const createApp = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => createApp().listen(PORT, () => console.log(`API listening on ${PORT}`)))
  .catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
