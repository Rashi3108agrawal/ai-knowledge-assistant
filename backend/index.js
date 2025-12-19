require("dotenv").config();
const app = require("./src/app");

const connectDB = require("./src/utils/db");
connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
