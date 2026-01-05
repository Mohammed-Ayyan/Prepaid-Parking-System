/**
 * MongoDB Connection Module
 * Uses singleton pattern to prevent multiple connections
 */

import { MongoClient } from "mongodb"

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your MongoDB URI to .env.local as MONGODB_URI")
}

const uri = process.env.MONGODB_URI
const options = {}

let client
let clientPromise

if (process.env.NODE_ENV === "development") {
  // Use global variable in development to preserve connection across hot reloads
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options)
    global._mongoClientPromise = client.connect()
  }
  clientPromise = global._mongoClientPromise
} else {
  // In production, create new client
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export default clientPromise
