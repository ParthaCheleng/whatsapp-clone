import mongoose from "mongoose";

export async function connectDB(uri: string) {
  if (!uri) throw new Error("MONGO_URI missing");
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 20000,
    family: 4,                 // force IPv4 (helps on some Windows/ISP setups)
    tls: true,                 // explicit TLS
    // The next line is ONLY to diagnose local TLS/AV interception issues:
    // tlsAllowInvalidCertificates: true,
  } as any);
  console.log("Mongo connected");
}
