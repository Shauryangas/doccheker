// TEST SCRIPT: Shows the difference between direct execution vs npm run dev
// This demonstrates why running files directly doesn't load .env

console.log("=".repeat(60));
console.log("ENVIRONMENT VARIABLES TEST");
console.log("=".repeat(60));
console.log("");
console.log("How this file was run:", process.argv[1]);
console.log("Working directory:", process.cwd());
console.log("");
console.log("--- Environment Variables ---");
console.log("HIVE_API_KEY:", process.env.HIVE_API_KEY || "UNDEFINED ❌");
console.log(
  "GEMINI_API_KEY:",
  process.env.GEMINI_API_KEY
    ? `${process.env.GEMINI_API_KEY.substring(0, 12)}...`
    : "UNDEFINED ❌"
);
console.log("MONGODB_URI:", process.env.MONGODB_URI ? "SET ✓" : "UNDEFINED ❌");
console.log("PORT:", process.env.PORT || "UNDEFINED ❌");
console.log("");
console.log("=".repeat(60));
console.log("EXPLANATION:");
console.log("=".repeat(60));
console.log("");

if (!process.env.HIVE_API_KEY) {
  console.log("❌ HIVE_API_KEY is UNDEFINED because:");
  console.log("");
  console.log("  You ran this file DIRECTLY with: node <filename>");
  console.log("  This does NOT load .env file automatically!");
  console.log("");
  console.log("✅ To make it work, you MUST use one of these methods:");
  console.log("");
  console.log("  Method 1 (RECOMMENDED): Run through npm scripts");
  console.log("    cd c:\\...\\backend");
  console.log("    npm run dev");
  console.log("");
  console.log("  Method 2: Use -r dotenv/config flag");
  console.log("    cd c:\\...\\backend");
  console.log("    node -r dotenv/config utils/env-test.js");
  console.log("");
  console.log("  Method 3: Create .env in current directory (NOT RECOMMENDED)");
  console.log("    Copy .env to utils/ folder (bad practice!)");
  console.log("");
} else {
  console.log("✅ HIVE_API_KEY is LOADED correctly!");
  console.log("");
  console.log("  This means you used the correct method:");
  console.log("  - npm run dev, OR");
  console.log("  - node -r dotenv/config");
  console.log("");
}

console.log("=".repeat(60));
console.log('IMPORTANT: When your server runs via "npm run dev",');
console.log("ALL environment variables ARE accessible in all files!");
console.log("=".repeat(60));
