import "../config/env.js";
import mongoose from "mongoose";
import Product from "../models/Product.js";

async function runExplain() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  // Explain the query executed by the homepage products API
  const explanation = await Product.find({ featured: true })
    .sort({ createdAt: -1 })
    .limit(12)
    .explain("executionStats");

  console.log("=== MONGO QUERY EXPLAIN ===");
  console.log("Winning Plan Stage:", explanation.queryPlanner.winningPlan.stage);
  
  // Print inputStage details recursively
  let stage = explanation.queryPlanner.winningPlan;
  while (stage) {
    console.log(`Stage: ${stage.stage}`);
    if (stage.inputStage) {
      stage = stage.inputStage;
    } else if (stage.inputStages) {
      stage = stage.inputStages[0];
    } else {
      break;
    }
  }

  console.log("\nExecution Stats:");
  console.log("nReturned:", explanation.executionStats.nReturned);
  console.log("executionTimeMillis:", explanation.executionStats.executionTimeMillis);
  console.log("totalKeysExamined:", explanation.executionStats.totalKeysExamined);
  console.log("totalDocsExamined:", explanation.executionStats.totalDocsExamined);

  await mongoose.disconnect();
}

runExplain().catch(console.error);
