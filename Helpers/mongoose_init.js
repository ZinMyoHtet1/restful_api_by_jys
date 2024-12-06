import mongoose from "mongoose";

mongoose
  .connect(process.env.MONGOOSE_URL)
  .then(() => console.log("connected to mongodb"))
  .catch((error) => console.log(error));

mongoose.connection.on("connected", () => console.log("connected to mongoose"));
mongoose.connection.on("disconnected", () =>
  console.log("disconnected to mongoose")
);

process.on("SIGINT", async () => {
  await mongoose.connection.close();
  process.exit(0);
});
