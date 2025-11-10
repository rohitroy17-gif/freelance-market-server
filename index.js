const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json())

// Your working URI (no need to change it)
const uri = "mongodb+srv://freelance:CYopzocONsR09pUy@cluster0.4yiiw4x.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


app.get('/', (req, res) => {
  res.send('freelance server is running')
})

async function run() {
  try {
    await client.connect();

    const db = client.db("freelance_db");
    const productsCollection = db.collection("products");

    // ✅ GET all products
    app.get('/products', async(req, res) => {
      const result = await productsCollection.find().toArray();
      res.send(result);
    });

    app.get('/products/:id', async(req, res) => {
      const id = req.params.id;
      const query={ _id: new ObjectId(id)}
      const result= await productsCollection.findOne(query);
      res.send(result);
    });

    // ✅ POST add new product
    app.post('/products', async(req, res) => {
      const newProduct = req.body;
      const result = await productsCollection.insertOne(newProduct);
      res.send(result);
    });

     app.patch('/products/:id', async(req, res) => {
      const id =req.params.id;
       const updatedProduct= req.body;
      const query={ _id: new ObjectId(id)}
     
      const update={
        $set:{
            name:updatedProduct.name,
            price:updatedProduct.price
        }
      }
      const result= await productsCollection.updateOne(query,update)
      res.send(result)
    });



    app.delete('/products/:id', async(req, res) => {
      const id =req.params.id;
      const query={_id: new ObjectId(id)}
      const result= await productsCollection.deleteOne(query);
      res.send(result);
    });


    await client.db("admin").command({ ping: 1 });
    console.log("MongoDB connected successfully!");

  } finally { }
}

run().catch(console.dir);


app.listen(port, () => {
  console.log(`freelance server is running now on port: ${port}`)
})
