import "../config/env.js";
import axios from "axios";

const API_BASE = "http://localhost:5000/api";

const endpoints = [
  { name: "Settings API (/settings)", url: "/settings" },
  { name: "Hero Banners API (/dashboard/hero)", url: "/dashboard/hero" },
  { name: "Products API (/products?featured=1&limit=12)", url: "/products?featured=1&limit=12" },
  { name: "Categories API (/categories?status=active)", url: "/categories?status=active" },
  { name: "Campaign API (/campaign)", url: "/campaign" },
  { name: "Lookbook API (/lookbook)", url: "/lookbook" }
];

async function measureEndpoint(endpoint) {
  const start = Date.now();
  try {
    const res = await axios.get(`${API_BASE}${endpoint.url}`);
    const duration = Date.now() - start;
    return { name: endpoint.name, duration, success: true, size: JSON.stringify(res.data).length };
  } catch (error) {
    const duration = Date.now() - start;
    return { name: endpoint.name, duration, success: false, error: error.message };
  }
}

async function runAudit() {
  console.log("=== COLD RUN (SEQUENTIAL) ===");
  for (const ep of endpoints) {
    const res = await measureEndpoint(ep);
    if (res.success) {
      console.log(`${res.name}: ${res.duration}ms (Response Size: ${res.size} bytes)`);
    } else {
      console.log(`${res.name}: FAILED - ${res.error} (${res.duration}ms)`);
    }
  }

  console.log("\n=== WARM RUN (SEQUENTIAL) ===");
  const startSeq = Date.now();
  const seqResults = [];
  for (const ep of endpoints) {
    const res = await measureEndpoint(ep);
    seqResults.push(res);
    if (res.success) {
      console.log(`${res.name}: ${res.duration}ms (Response Size: ${res.size} bytes)`);
    } else {
      console.log(`${res.name}: FAILED - ${res.error} (${res.duration}ms)`);
    }
  }
  const totalSeq = Date.now() - startSeq;
  console.log(`Total Sequential Request Time: ${totalSeq}ms`);

  console.log("\n=== WARM RUN (PARALLEL) ===");
  const startPar = Date.now();
  const parPromises = endpoints.map(measureEndpoint);
  const parResults = await Promise.all(parPromises);
  const totalPar = Date.now() - startPar;

  parResults.forEach((res) => {
    if (res.success) {
      console.log(`${res.name}: ${res.duration}ms`);
    } else {
      console.log(`${res.name}: FAILED - ${res.error}`);
    }
  });
  console.log(`Total Parallel Request Time (Promise.all): ${totalPar}ms`);
}

runAudit().catch(console.error);
