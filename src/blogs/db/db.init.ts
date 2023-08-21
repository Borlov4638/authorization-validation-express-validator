import { MongoClient, ServerApiVersion } from "mongodb";

// Replace the placeholder with your Atlas connection string
const uri = "mongodb+srv://mrwiggle40000:OErZka7OiZTiToGx@cluster0.dt0bgxc.mongodb.net/";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
export const client = new MongoClient(uri,  {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        }
    }
);

export async function runDB() {
  try {
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();

    // Send a ping to confirm a successful connection
    await client.db("incubator").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch {
    // Ensures that the client will close when you finish/error
    console.log("Error occured within connection to DB");

    await client.close();
  }
}
