const Order = require("../models/Order");
const Cart = require("../models/Cart");
const User = require("../models/User");
const Product = require("../models/Product");
const mongoose = require("mongoose");
// [PAYMENT METHOD LIST ADDITIONAL FUNCTION - HUI ANGELES ]
const acceptedPaymentMethods = ["Credit Card / Debit Card", "Gcash", "CodeHealth Wallet", "Cash on Delivery"];

// [PAYMENT METHOD LIST ADDITIONAL FUNCTION - HUI ANGELES ]
module.exports.paymentMethod = (res, req) => {
    // Define a list of accepted payment methods
    return res.status(200).json({ acceptedPaymentMethods });
};

// [ORDER CREATION - HUI ANGELES]
module.exports.checkOutOrder = async (req, res) => {
    try {
        const isAdmin = req.user && req.user.isAdmin;
        if (isAdmin) {
            return res.status(403).json({ message: "Administrators are not allowed to checkout orders. Please use your ordinary account." });
        }

        const userId = req.user && req.user.id;
        if (!userId) {
            return res.status(401).json({ message: "Unable to proceed with the checkout. Please provide a valid authentication token." });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(401).json({ message: "User not found." });
        }

        // This will check if the users cart has items
        const userCart = await Cart.findOne({ cartId: userId });
        if (!userCart || userCart.cartItems.length === 0) {
            return res.status(400).json({ message: "Order checkout is unavailable. Your cart is empty." });
        }

        // Payment method must be indicated.
        const paymentMethod = req.body.paymentMethod;

        if (!paymentMethod || !acceptedPaymentMethods.map(method => method.toLowerCase()).includes(paymentMethod.toLowerCase())) {
            return res.status(400).json({ message: "Invalid or unsupported payment method. Please choose from the accepted payment methods." });
        }

        const orderItems = userCart.cartItems.map(item => ({
            productId: item._id, 
            name: item.name,
            description: item.description,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.subtotal,
        }));

        const orderTotalPrice = userCart.totalPrice;

        const order = new Order({
            user: {
                userId: userId,
                name: `${user.firstName} ${user.lastName}`, 
                email: user.email,
                address: user.address, // address field added by hui angeles 01/29
            },
            productsOrdered: orderItems,
            totalPrice: orderTotalPrice,
            orderedOn: new Date(),
            paymentMethod: paymentMethod,
            paymentStatus: determinePaymentStatus(paymentMethod),
        });

        await order.save();

        // Update product stock
        for (const item of orderItems) {
            const productName = item.name;
            const quantity = item.quantity;
            const product = await Product.findOne({ name: productName });

            if (!product) {
                console.error(`Product not found for name: ${productName}`);
                continue;
            }

            product.stock -= quantity;
            await product.save();
        }

        function determinePaymentStatus(method) {
            const digitalPaymentMethods = ["credit card / debit card", "gcash", "codehealth wallet"];
            return digitalPaymentMethods.includes(method.toLowerCase()) ? "complete" : "pending";
        }

        userCart.cartItems = [];
        userCart.totalPrice = 0;
        await userCart.save();

        return res.status(200).json({
            message: "Order placed successfully!",
            orderDetails: {
            	user: {
    	            customerName: `${user.firstName} ${user.lastName}`,
    	            email: order.user.email,
                    address: order.user.address, // address field added by hui angeles 01/29
    	        },
                orderId: order._id,
                items: orderItems.map(item => ({
                    name: item.name,
                    description: item.description,
                    quantity: item.quantity,
                    price: `₱${item.price.toFixed(2)}`,
                    subtotal: `₱${item.subtotal.toFixed(2)}`,
                })),
                totalPrice: `₱${order.totalPrice.toFixed(2)}`,
                orderedOn: order.orderedOn,
                paymentMethod: order.paymentMethod,
                paymentStatus: order.paymentStatus,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error. Unable to complete the checkout. Please try again later." });
    }
};

//WORKING CODE FOR STOCKS
// module.exports.checkOutOrder = async (req, res) => {
//     try {
//         const isAdmin = req.user && req.user.isAdmin;
//         if (isAdmin) {
//             return res.status(403).json({ message: "Administrators are not allowed to checkout orders. Please use your ordinary account." });
//         }

//         const userId = req.user && req.user.id;
//         if (!userId) {
//             return res.status(401).json({ message: "Unable to proceed with the checkout. Please provide a valid authentication token." });
//         }

//         const user = await User.findById(userId);
//         if (!user) {
//             return res.status(401).json({ message: "User not found." });
//         }

//         // This will check if the users cart has items
//         const userCart = await Cart.findOne({ cartId: userId });
//         if (!userCart || userCart.cartItems.length === 0) {
//             return res.status(400).json({ message: "Order checkout is unavailable. Your cart is empty." });
//         }

//         // Payment method must be indicated
//         const paymentMethod = req.body.paymentMethod;
//         const acceptedPaymentMethods = ["credit card / debit card", "gcash", "codehealth wallet"];
//         if (!paymentMethod || !acceptedPaymentMethods.map(method => method.toLowerCase()).includes(paymentMethod.toLowerCase())) {
//             return res.status(400).json({ message: "Invalid or unsupported payment method. Please choose from the accepted payment methods." });
//         }

//         const orderItems = userCart.cartItems.map(item => ({
//             productId: item._id, 
//             name: item.name,
//             description: item.description,
//             quantity: item.quantity,
//             price: item.price,
//             subtotal: item.subtotal,
//         }));

//         const orderTotalPrice = userCart.totalPrice;

//         const order = new Order({
//             user: {
//                 userId: userId,
//                 name: `${user.firstName} ${user.lastName}`, 
//                 email: user.email,
//                 address: user.address, // address field added by Hui Angeles 01/29
//             },
//             productsOrdered: orderItems,
//             totalPrice: orderTotalPrice,
//             orderedOn: new Date(),
//             paymentMethod: paymentMethod,
//             paymentStatus: determinePaymentStatus(paymentMethod),
//         });

//         await order.save();

//         // Update product stock and isActive field
//         for (const item of orderItems) {
//             const productName = item.name;
//             const quantity = item.quantity;
//             const product = await Product.findOne({ name: productName });

//             if (!product) {
//                 console.error(`Product not found for name: ${productName}`);
//                 continue;
//             }

//             if (quantity > product.stock) {
//                 return res.status(400).json({ message: `Quantity for ${productName} exceeds available stock.` });
//             }

//             product.stock -= quantity;
//             if (product.stock === 0) {
//                 product.isActive = false;
//             }
//             await product.save();
//         }

//         function determinePaymentStatus(method) {
//             const digitalPaymentMethods = ["credit card / debit card", "gcash", "codehealth wallet"];
//             return digitalPaymentMethods.includes(method.toLowerCase()) ? "complete" : "pending";
//         }

//         userCart.cartItems = [];
//         userCart.totalPrice = 0;
//         await userCart.save();

//         return res.status(200).json({
//             message: "Order placed successfully!",
//             orderDetails: {
//                 user: {
//                     customerName: `${user.firstName} ${user.lastName}`,
//                     email: order.user.email,
//                     address: order.user.address, // address field added by Hui Angeles 01/29
//                 },
//                 orderId: order._id,
//                 items: orderItems.map(item => ({
//                     name: item.name,
//                     description: item.description,
//                     quantity: item.quantity,
//                     price: `₱${item.price.toFixed(2)}`,
//                     subtotal: `₱${item.subtotal.toFixed(2)}`,
//                 })),
//                 totalPrice: `₱${order.totalPrice.toFixed(2)}`,
//                 orderedOn: order.orderedOn,
//                 paymentMethod: order.paymentMethod,
//                 paymentStatus: order.paymentStatus,
//             },
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: "Internal Server Error. Unable to complete the checkout. Please try again later." });
//     }
// };

// [RETRIEVE USER PERSONAL ORDER - HUI ANGELES]
module.exports.myOrders = async (req, res) => {
    try {
        const userId = req.user && req.user.id;

        if (!userId) {
            return res.status(401).json({ message: "Unable to retrieve orders. Please provide a valid authentication token." });
        }

        // Retrieve orders for the logged-in user
        const orders = await Order.find({ 'user.userId': userId }).sort({ orderedOn: -1 });

        // If there are no orders, you can customize the response message
        if (orders.length === 0) {
            return res.status(404).json({ message: "You have no complete or pending orders." });
        }

        // Formatted output for readability purposes
        const formattedOrders = orders.map(order => ({
            orderId: order._id,
            items: order.productsOrdered.map(item => ({
                name: item.name,
                description: item.description,
                quantity: item.quantity,
                price: `₱${item.price.toFixed(2)}`,
                subtotal: `₱${item.subtotal.toFixed(2)}`,
            })),
            totalPrice: `₱${order.totalPrice.toFixed(2)}`,
            orderedOn: order.orderedOn,
            paymentMethod: order.paymentMethod,
            paymentStatus: order.paymentStatus,
        }));

        return res.status(200).json({
            message: "Orders retrieved successfully!",
            orders: formattedOrders,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error. Unable to retrieve user orders. Please try again later." });
    }
};

// [RETRIEVE ALL USERS ORDER - HUI ANGELES]
module.exports.allOrders = async (req, res) => {
    try {
        const allOrders = await Order.find();

        if (allOrders.length === 0) {
            return res.status(404).json({ error: "No customer order found. Please come back later if customers already checked out their order." });
        }

        const formattedOrders = allOrders.map(order => ({
            ...order.toObject(),
            productsOrdered: order.productsOrdered.map(item => ({
                ...item.toObject(),
                price: `₱${item.price.toFixed(2)}`,
                subtotal: `₱${item.subtotal.toFixed(2)}`,
            })),
            totalPrice: `₱${order.totalPrice.toFixed(2)}`,
        }));

        res.status(200).json({
            message: "Successfully retrieved orders. See your customers order: ",
            orders: formattedOrders
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to retrieve orders. Please try again later." });
    }
};


