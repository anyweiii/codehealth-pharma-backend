const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
	cartId: {
		type: mongoose.Schema.Types.ObjectId,
		required: [true, "User ID is required"]
	},
	cartItems: [
		{
			name: {
                type: String,
                required: [true, "Product name is required"]
            },
            description: {
                type: String,
                required: [true, "Product description is required"]
            },
			quantity: {
				type: Number,
				required: [true, "Specify quantity"]
			},
			price: {
				type: Number,
				required: [true, "Specify quantity"]
			},
			subtotal: {
				type: Number,
				required: [true, "Subtotal is required"]
			}
		}
	],
	totalPrice: {
		type: Number,
		required: [true, "Total price is required"]
	},
	orderedOn: {
		type: Date,
		default: Date.now
	}
});

module.exports = mongoose.model ("Cart", cartSchema);

