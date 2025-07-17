let express = require("express")
let cors = require("cors")

let app = express();
app.use(cors())
app.use(express.json())
let port = process.env.PORT || 5000;
let { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { default: axios } = require("axios");
let uri = "mongodb+srv://raihanmiraj:Bangladesh123@cluster0.dhnvk0f.mongodb.net/?retryWrites=true&w=majority";
let users = [];
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
let client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {

        let database = client.db("face-recognition-url-batch");
        let images = database.collection("images")

        app.post("/add-image", async (req, res) => {
            let image = req.body;
            let result = await images.insertOne(image);
            res.send(result);
        }
        )
        app.get("/images-list", async (req, res) => {
            let result = await images.find({}).toArray();
            res.send(result);
        })

        app.delete('/images/:id', async (req, res) => {
            const id = req.params.id;
            const result = await images.deleteOne({ _id: new ObjectId(id) });
            res.send(result);
        });
        app.put('/images/:id', async (req, res) => {
            const id = req.params.id;
            const { name } = req.body;
            const result = await images.updateOne(
                { _id: new ObjectId(id) },
                { $set: { name } }
            );
            res.send(result);
        });


    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);









app.get("/", (req, res) => {
    res.send("user server running")
})


app.listen(port, () => {
    console.log(`server is running on port ${port}`)
})