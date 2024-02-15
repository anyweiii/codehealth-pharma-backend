const mongoose = require("mongoose");

const productSchema = new mongoose.Schema ({
	name: {
		type: String,
		required: [true, "Product name is required"]
	},
	description: {
		type: String,
		required: [true, "Product description is required"]
	},
	price: {
		type: Number,
		required: [true, "Price for the product is required"]
	},
	stock: {
		type: Number,
		required: [true, "Number of stock must be indicated"]
	},
	isActive: {
		type: Boolean,
		default: true
	},
	category: {
		type: String,
		required: [true, "Categories are required for the products"]
	},
	createdOn: {
		type: Date,
		default: Date.now
	}
});

module.exports = mongoose.model ("Product", productSchema);

