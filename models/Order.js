const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    user: {
           userId: {
               type: mongoose.Schema.Types.ObjectId,
               required: [true, "User ID is required"]
           },
           name: {
               type: String,
               required: [true, "User name is required"]
           },
           email: {
               type: String,
               required: [true, "User email is required"]
           },
           address: {
                type: String,
                required: [true, "Address required"]
           }, // address field added by hui angeles
   	},
    productsOrdered: [
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
    },
    status: {
        type: String,
        default: "Pending"
    },
    paymentMethod: {
        type: String
    },
    paymentStatus: {
    	type: String,
   	 	default: "Pending"
    }
});

module.exports = mongoose.model("Order", orderSchema);
