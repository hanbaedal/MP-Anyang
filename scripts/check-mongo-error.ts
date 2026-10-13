import {
  isMongoFailure,
  mongoUserMessage,
  MONGO_AUTH_FAILED,
  MONGO_FORBIDDEN,
  MONGO_URI_BAD,
  MONGO_URI_MISSING,
  MONGO_WRITE_FAILED,
} from "../src/lib/mongo-error";

function check(name: string, got: unknown, want: unknown) {
  if (got !== want) {
    console.error(`FAIL ${name}\n got: ${String(got)}\nwant: ${String(want)}`);
    process.exitCode = 1;
    return;
  }
  console.log(`ok ${name}`);
}

check("uri missing", mongoUserMessage(new Error("MONGODB_URI missing")), MONGO_URI_MISSING);
check("parse", mongoUserMessage({ name: "MongoParseError", message: "Invalid connection string" }), MONGO_URI_BAD);
check("auth code", mongoUserMessage({ name: "MongoServerError", code: 18, codeName: "AuthenticationFailed" }), MONGO_AUTH_FAILED);
check("auth wrapped", mongoUserMessage({ name: "MongoServerSelectionError", message: "bad auth : Authentication failed." }), MONGO_AUTH_FAILED);
check("forbidden", mongoUserMessage({ name: "MongoServerError", code: 13, codeName: "Unauthorized" }), MONGO_FORBIDDEN);
check(
  "network",
  mongoUserMessage({
    name: "MongoServerSelectionError",
    message: "Could not connect. IP that isn't whitelisted.",
  }),
  MONGO_WRITE_FAILED,
);
check("generic mongo write", mongoUserMessage({ name: "MongoBulkWriteError", code: 1 }), MONGO_WRITE_FAILED);
check("source pull is not mongo", isMongoFailure(new Error("timeout")), false);
check("mongo name", isMongoFailure({ name: "MongoNetworkError" }), true);

if (process.exitCode) {
  console.error("mongo-error checks failed");
} else {
  console.log("mongo-error checks passed");
}
