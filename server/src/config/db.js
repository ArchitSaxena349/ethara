import mongoose from "mongoose";
import dns from "node:dns";

// On some machines Node's DNS resolver is left pointing at a local stub
// (e.g. 127.0.0.1 from a stopped Pi-hole/VPN/Docker proxy), which makes the
// SRV lookup for mongodb+srv:// fail with `querySrv ECONNREFUSED`. Fall back
// to public resolvers when the only configured server is unreachable loopback.
function ensureUsableDnsServers() {
  const servers = dns.getServers();
  const onlyLoopback = servers.every((s) => s === "127.0.0.1" || s === "::1");
  if (servers.length === 0 || onlyLoopback) {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
  }
}

export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is required");
  }

  ensureUsableDnsServers();
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri);
}
