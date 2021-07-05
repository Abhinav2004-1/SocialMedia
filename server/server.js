import express from "express";
import depthLimit from "graphql-depth-limit";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const ExpressGraphQL = require("express-graphql").graphqlHTTP;
import mongoose from "mongoose";
import dotenv from "dotenv";
import socket from "socket.io";
import cors from "cors";
import https from "https";
import redis from "async-redis";
import fs from "fs";
dotenv.config();
const cache = redis.createClient();

import CheckJWTRoute from "./Routes/check-jwt.js";
import LoginRoute from "./Routes/login.js";
import RegisterRoute from "./Routes/register.js";
import DeleteRoute from "./Routes/deleter.js";
import MainSchema from "./GraphQL/graphql.js";
import SearchSuggestionRoute from "./Routes/search-suggestion.js";

const app = express();
const options = {
  key: fs.readFileSync("key.pem"),
  cert: fs.readFileSync("cert.pem"),
};
const server = https.createServer(options, app);
const io = socket(server);
const PORT = 8000;

// middleware
app.use(
  cors({
    origin: ["https://localhost:3000", "https://192.168.56.1:3000"],
  })
);
app.use(express.json({ limit: "50mb" }));

// socket
io.on("connection", (socket) => {
  socket.on("join-primary-room", userID => {
    socket.join(userID);
  });

  socket.on("accept-follow-request", config => {
    console.log(config);
  }); 

  socket.on("real-time-request", async (extenedFrom, extendedTo, Username) => {
    const ProfilePicture = await cache.get(`ProfilePicture/${extenedFrom}`);
    socket.broadcast
      .to(extendedTo)
      .emit("real-time-request-receiver", {
        Username,
        extenderID: extenedFrom,
        ProfilePicture: ProfilePicture ? ProfilePicture : "",
      });
  });

  socket.on("disconnect", () => {});
});

// graphql endpoint
app.use(
  "/graphql",
  ExpressGraphQL({
    schema: MainSchema,
    graphiql: true,
    // prevention from circular query overload
    validationRules: [depthLimit(2)],
  })
);

// REST api endpoints
app.use("/check-auth", CheckJWTRoute);
app.use("/login", LoginRoute);
app.use("/signup", RegisterRoute);
app.use("/delete", DeleteRoute);
app.use("/search-profile", SearchSuggestionRoute);

// DB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: true,
  })
  .then(() => {
    console.log("connected to mongoDB");
  })
  .catch(() => {
    console.log("didnot connect to mongoDB");
  });
// main listener
server.listen(PORT, () => {
  console.log(`connected to localhost:${PORT}`);
});