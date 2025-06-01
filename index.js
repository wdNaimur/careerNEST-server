const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

// middleWare
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@simple-crud.bz7pr69.mongodb.net/?retryWrites=true&w=majority&appName=simple-crud`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const jobsCollection = client.db("careerNest").collection("jobs");
    const applicationsCollection = client
      .db("careerNest")
      .collection("applications");

    // start jobs API
    //Get All Jobs
    app.get("/jobs", async (req, res) => {
      const cursor = jobsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    // Get single Job Details
    app.get("/jobs/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobsCollection.findOne(query);
      res.send(result);
    });
    // Job Applications Related Api
    app.get("/applications", async (req, res) => {
      const email = req.query.email;
      const query = { userEmail: email };
      const result = await applicationsCollection.find(query).toArray();
      for (const application of result) {
        const jobId = application.jobId;
        const jobQuery = { _id: new ObjectId(jobId) };
        const jobDetails = await jobsCollection.findOne(jobQuery);
        application.company_logo = jobDetails.company_logo;
        application.company = jobDetails.company;
        application.title = jobDetails.title;
        application.applicationDeadline = jobDetails.applicationDeadline;
        application.description = jobDetails.description;
        const deadline = new Date(jobDetails.applicationDeadline);
        const today = new Date();
        application.status = today <= deadline;
      }
      res.send(result);
    });
    app.delete("/applications/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await applicationsCollection.deleteOne(query);
      res.send(result);
    });
    app.post("/applications", async (req, res) => {
      const application = req.body;
      const result = await applicationsCollection.insertOne(application);
      res.send(result);
    });
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Carrier Code Running on ${port}`);
});
