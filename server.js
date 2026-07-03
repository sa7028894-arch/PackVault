const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();

app.use(cors());
app.use(express.json());

// Corrected URI line
const uri = "mongodb+srv://sa7028894_db_user:V9xEXfFkBML4J6YL@cluster0.oqb3bgh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(uri)
    .then(() => console.log("Connected to MongoDB Atlas"))
    .catch(err => console.error("Could not connect to MongoDB", err));

// Define the Package Schema
const packageSchema = new mongoose.Schema({
    name: String,
    version: String,
    path: String
});

const Package = mongoose.model('Package', packageSchema);

// GET all packages
app.get('/api/packages', async (req, res) => {
    const packages = await Package.find();
    res.json(packages);
});

// POST a new package
app.post('/api/packages', async (req, res) => {
    const newPackage = new Package(req.body);
    await newPackage.save();
    res.status(201).json(newPackage);
});

// DELETE a package
app.delete('/api/packages/:name', async (req, res) => {
    await Package.findOneAndDelete({ name: req.params.name });
    res.status(200).json({ message: 'Package deleted' });
});

app.listen(5000, () => {
    console.log('Server is running on port 5000 with MongoDB');
});