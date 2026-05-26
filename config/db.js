const mongoose = require("mongoose");

const redactMongoUri = (uri = "") =>
  uri.replace(
    /^(mongodb(?:\+srv)?:\/\/)([^:@/?#]+)(?::([^@/?#]*))?@/i,
    "$1[username]:[password]@"
  );

const buildMongoUri = () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error("MONGO_URI is missing from the .env file.");
  }

  if (uri.includes("authSource=")) {
    return uri;
  }

  return `${uri}${uri.includes("?") ? "&" : "?"}authSource=admin`;
};

const connectDB = async () => {
  try {
    const mongoUri = buildMongoUri();
    const connection = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`MongoDB connected: ${connection.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    console.error(`MongoDB URI in use: ${redactMongoUri(process.env.MONGO_URI)}`);

    if (/bad auth|Authentication failed/i.test(error.message)) {
      console.error(
        "Atlas rejected the database credentials. In MongoDB Atlas, open Database Access, reset or create a database user password, then paste that exact username and password into MONGO_URI."
      );
    }

    console.error("The website can still run, but form APIs need MongoDB access.");
  }
};

module.exports = connectDB;
