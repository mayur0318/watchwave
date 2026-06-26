// require("dotenv").config({ path: "./env" });
import connectDb from "./db/dbConnection.js";

connectDb()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running at port : ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("Mongodb connection failed !!");
  });
