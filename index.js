// [SECTION] Dependencies and Modules
const express = require("express");
const mongoose = require("mongoose");

// Allows our backend application to be available to our frontend application
// Allows us to control the apps Cross Origin Resource Sharing settings
const cors = require("cors");
// Allows access to routes defined within our application.
const userRoutes = require("./routes/user");
const productRoutes = require("./routes/product");
const cartRoutes = require("./routes/cart");
const orderRoutes = require("./routes/order");


// [SECTION] Environment Setup
const port = 4005;

// [SECTION] Server Setup
// Creates an app variable that stores the results of the "express function" that initializes our express application and allows us to access different methods that will make backend creation easy. 
const app = express();
const mongoDBPassword = "admin1234";

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cors());

// [SECTION] Database Connection
// Connect to our MongoDB databa
mongoose.connect(`mongodb+srv://admin:${mongoDBPassword}@angelesdb.fagjznf.mongodb.net/Capstone2?retryWrites=true&w=majority`, {
	useNewUrlParser: true,
	useUnifiedTopology: true
});

// Prompts a message in the terminal once the connection is "open" and we are able to successfully connect to our database.
mongoose.connection.once('open', () => console.log('Now connected to MongoDB Atlas'));

// [SECTION] Backend Routes
// http: //localhost:4000/users
// Defines the "/users" string to be included for all user routes defined in the "user" route file.
app.use("/b5/users", userRoutes);
app.use("/b5/products", productRoutes);
app.use("/b5/carts", cartRoutes);
app.use("/b5/orders", orderRoutes);

if (require.main === module) {
	// "process.env.PORT || port" will use the environment variable if it is available or will use port 4000 if none is defined.
	app.listen(process.env.PORT || port, () => {
		console.log(`API is now online on port ${process.env.PORT ||  port}`)
	});
};

// In creating APIs, exporting modules in the "index.js" file is ommited.
module.exports = { app, mongoose };