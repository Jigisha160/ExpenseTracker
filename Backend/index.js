require("dotenv").config(); 

const express = require("express");
//const dotenv = require("dotenv")

const cors = require("cors");
const mongoose= require("mongoose");
//const uri = "mongodb+srv://mongo2025:mongo2025@cluster0.jr5hm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const expenseRoute = require("./routes/expense")
const app = express();


//middleware
app.use(cors());
app.use(express.json())

// routes
app.use("/expenses",expenseRoute)




//DB CONNECTION

mongoose.connect(process.env.DB_CONNECTION).then(() =>{
    console.log("DB connection is successfull")
}).catch((e) =>{
    console.log(e)
})

// start server
const PORT=process.env.PORT;
app.listen(PORT, () =>{
    console.log(`Server is running on port ${PORT}`)
})