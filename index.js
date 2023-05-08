const express = require('express')
const app = express()
const port = process.env.PORT || 5000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const cors = require("cors")
app.use(express.json())
const services = require("./data/services.json")
const images = require("./data/images.json")

app.use(cors())
app.get('/', (req, res) => {
    res.send('Espresso_Emporium_server_running...........')
})
app.get('/services', (req, res) => {
    res.send(services)
})
app.get('/images', (req, res) => {
    res.send(images)
})

const uri = `mongodb+srv://${process.env.DBUSER_NAME}:${process.env.DBUSER_PASS}@cluster0.w8zzyxt.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        const productDbCollection = client.db("espressoEmporiumCoffeeBd").collection("productDb")

        app.get("/products", async (req, res) => {
            const cursor = productDbCollection.find()
            const result = await cursor.toArray()
            res.send(result)
        })
        app.get("/products/:id", async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await productDbCollection.findOne(query)
            res.send(result)
        })



        app.post("/addProduct", async (req, res) => {
            const product = req.body
            console.log(product);
            const result = await productDbCollection.insertOne(product)
            res.send(result)
        })
        app.put("/updateproducts/:id", async (req, res) => {
            const id = req.params.id
            const updatedProductData = req.body
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true };
            const updateProduct = {
                $set: {
                    name: updatedProductData.name,
                    quantity: updatedProductData.quantity,
                    supplier: updatedProductData.supplier,
                    taste: updatedProductData.taste,
                    photo: updatedProductData.photo,
                    category: updatedProductData.category,
                    details: updatedProductData.details,
                }
            }
            const result = await productDbCollection.updateOne(filter, updateProduct,options,)
            res.send(result)
        })

        app.delete("/deleteProducts/:id", async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await productDbCollection.deleteOne(query)
            res.send(result)
        })



        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})