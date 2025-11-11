const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Atlas connection
const uri = "mongodb+srv://freelance:CYopzocONsR09pUy@cluster0.4yiiw4x.mongodb.net/?appName=Cluster0";
const client = new MongoClient(uri, {
  serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true }
});

async function run() {
  try {
    await client.connect();
    console.log("MongoDB connected successfully!");

    const db = client.db("freelance_db");
    const jobsCollection = db.collection("jobs");

    // Get all jobs (latest first)
    app.get('/jobs', async (req, res) => {
      const jobs = await jobsCollection.find().sort({ _id: -1 }).toArray();
      res.send(jobs);
    });

    // Get job by ID
    app.get('/jobs/:id', async (req, res) => {
      const id = req.params.id;
      const job = await jobsCollection.findOne({ _id: new ObjectId(id) });
      res.send(job);
    });

    // Add new job
    app.post('/jobs', async (req, res) => {
      const newJob = req.body;
      newJob.acceptedUsers = []; // initialize acceptedUsers array
      const result = await jobsCollection.insertOne(newJob);
      res.send(result);
    });

    // Accept a job (add userEmail to acceptedUsers array)
    app.post('/jobs/accept/:id', async (req, res) => {
      const id = req.params.id;
      const { userEmail } = req.body;
      const result = await jobsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $addToSet: { acceptedUsers: userEmail } } // prevents duplicates
      );
      res.send(result);
    });

    // Get jobs added by a specific user
    app.get('/myAddedJobs', async (req, res) => {
      const email = req.query.email;
      const jobs = await jobsCollection.find({ userEmail: email }).toArray();
      res.send(jobs);
    });

    // Get jobs accepted by a specific user
    app.get('/myAcceptedTasks', async (req, res) => {
      const email = req.query.email;
      const jobs = await jobsCollection.find({ acceptedUsers: email }).toArray();
      res.send(jobs);
    });

    // Update job
    app.patch('/jobs/:id', async (req, res) => {
      const id = req.params.id;
      const updatedJob = req.body;
      const result = await jobsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedJob }
      );
      res.send(result);
    });

    // Delete job
    app.delete('/jobs/:id', async (req, res) => {
      const id = req.params.id;
      const result = await jobsCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });

  } finally {}
}

run().catch(console.dir);

app.get('/', (req, res) => res.send('Freelance Marketplace server is running'));
app.listen(port, () => console.log(`Server running on port ${port}`));

