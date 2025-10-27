// Task1: initiate app and run server at 3000
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist', 'Frontend')));

// Task2: create mongoDB connection
// Read the connection string from environment to avoid committing credentials.
const MONGODB_URI = process.env.MONGODB_URI || null;

async function connectMongo() {
    if (!MONGODB_URI) {
        console.warn('MONGODB_URI not set. Skipping MongoDB connection. Create a .env file with MONGODB_URI to enable DB.');
        return;
    }

    // Basic guard against placeholder values that contain angle brackets
    if (MONGODB_URI.includes('<') || MONGODB_URI.includes('>')) {
        console.warn('MONGODB_URI appears to contain placeholders. Skipping MongoDB connection. Replace placeholders in .env with real credentials.');
        return;
    }

    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB Atlas');
    } catch (err) {
        console.error('Could not connect to MongoDB:', err);
    }
}

connectMongo();

// Employee Schema
const employeeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String, required: true },
    position: { type: String, required: true },
    salary: { type: Number, required: true }
});

const Employee = mongoose.model('Employee', employeeSchema);

//TODO: get data from db using api '/api/employeelist'
app.get('/api/employeelist', async (req, res) => {
    try {
        const employees = await Employee.find();
        res.json(employees);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

//TODO: get single data from db using api '/api/employeelist/:id'
app.get('/api/employeelist/:id', async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (employee) {
            res.json(employee);
        } else {
            res.status(404).json({ message: 'Employee not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

//TODO: send data from db using api '/api/employeelist'
//Request body format:{name:'',location:'',position:'',salary:''}
app.post('/api/employeelist', async (req, res) => {
    const employee = new Employee({
        name: req.body.name,
        location: req.body.location,
        position: req.body.position,
        salary: req.body.salary
    });

    try {
        const newEmployee = await employee.save();
        res.status(201).json(newEmployee);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

//TODO: delete a employee data from db by using api '/api/employeelist/:id'
app.delete('/api/employeelist/:id', async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (employee) {
            await employee.deleteOne();
            res.json({ message: 'Employee deleted successfully' });
        } else {
            res.status(404).json({ message: 'Employee not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

//TODO: Update a employee data from db by using api '/api/employeelist'
//Request body format:{name:'',location:'',position:'',salary:''}
app.put('/api/employeelist', async (req, res) => {
    try {
        const employee = await Employee.findById(req.body._id);
        if (employee) {
            employee.name = req.body.name;
            employee.location = req.body.location;
            employee.position = req.body.position;
            employee.salary = req.body.salary;
            
            const updatedEmployee = await employee.save();
            res.json(updatedEmployee);
        } else {
            res.status(404).json({ message: 'Employee not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

//! dont delete this code. it connects the front end file.
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'dist', 'Frontend', 'index.html'));
});

// Simple health endpoint
app.get('/health', (req, res) => {
    const dbState = mongoose.connection.readyState; // 0 = disconnected, 1 = connected
    res.json({ status: 'ok', dbState });
});

// Server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


