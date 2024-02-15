const Cart = require("../models/Cart");
const Product = require("../models/Product");

const formatCurrency = (amount) => amount ? `₱${amount.toFixed(2)}` : '₱0.00';

// [GET USERS CART - FROILAN OLIQUIANO]
module.exports.getCart = async (req, res) => {
    try {
        const cartId = req.user.id;

        // Get the cart for authenticated users
        const userCart = await Cart.findOne({ cartId });

        if (!userCart || userCart.cartItems.length === 0) {
            return res.status(400).json({ error: "You do not have items in your cart. Please add first to see your items." });
        }

        const formattedCartItems = userCart.cartItems.map(cartItem => ({
            ...cartItem.toObject(),
            price: formatCurrency(cartItem.price),
            subtotal: formatCurrency(cartItem.subtotal) // added subtotal format - hui angeles
        }));

        const formattedTotalPrice = formatCurrency(userCart.totalPrice);

        res.status(200).json({
            message: "Successfully retrieved products.",
            yourCart: formattedCartItems,
            totalPrice: formattedTotalPrice
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to retrieve the items in your cart. Please try again later." });
    }
};

// [ADD TO CART - HUI ANGELES]
module.exports.addToCart = async (req, res) => {
    try {
        const cartItems = req.body;
        const cartId = req.user && req.user.id;

        let userCart = await Cart.findOne({ cartId });

        if (!userCart) {
            userCart = new Cart({
                cartId,
                cartItems: [],
                totalPrice: 0,
            });
        }

        // Input fields for the body
        for (const item of cartItems) {
            const { productId, quantity } = item;

            if (!productId || typeof quantity !== 'number' || quantity <= 0) {
                return res.status(400).json({ error: "Request invalid. Please provide valid productId and positive quantity for each item." });
            }

            const product = await Product.findById(productId);

            if (!product || !product.isActive) {
                return res.status(404).json({ error: `Product with ID ${productId} not found or is out of stock.` });
            } else if (product.stock < quantity) {
                return res.status(400).json({ error: `Insufficient stock for the requested quantity of product with ID ${productId}.` });
            }

            // This is to check if the product already exists in the cart or not. If yes, quantity, subtotal, and total price will be updated. If no, then it will just be added to your cart. Note: 1 user 1 cart only.
            const existingProduct = userCart.cartItems.find(cartItem => cartItem.name === product.name);

            if (existingProduct) {
                // Update existing item if the product is already in the cart
                existingProduct.quantity += quantity;
                existingProduct.subtotal = existingProduct.quantity * existingProduct.price;
            } else {
                // Add a new object when the product does not exist
                const subtotal = product.price * quantity;

                userCart.cartItems.push({
                    productId,
                    quantity,
                    price: product.price,
                    subtotal,
                    name: product.name,
                    description: product.description,
                });
            }
        }

        // Total price will be recalculated here once the product quantity is updated.
        userCart.totalPrice = userCart.cartItems.reduce((total, item) => total + item.subtotal, 0);

        await userCart.save();

        // The total and subtotal formatted for peso sign symbol
        const responseCart = userCart.cartItems.map(item => ({
            productId: item.productId,
            name: item.name,
            description: item.description,
            quantity: item.quantity,
            status: item.status,
            price: formatCurrency(item.price), 
            subtotal: formatCurrency(item.subtotal),
        }));

        const formattedTotalPrice = formatCurrency(userCart.totalPrice);

        res.status(200).json({
            message: "Products added to the cart successfully.",
            cart: responseCart,
            totalPrice: formattedTotalPrice,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to add items to your cart. Please try again later." });
    }
};

// [UPDATE QUANTITY - HUI ANGELES]
module.exports.updateCartQuantity = async (req, res) => {
    try {
        const { itemId, quantity } = req.body;

        if (!itemId || !quantity) {
            return res.status(400).json({ error: "Please provide item identification and quantity to update your cart count." });
        }

        // Find the cart containing the item
        let cart = await Cart.findOne({ "cartItems._id": itemId });

        if (!cart) {
            return res.status(404).json({ message: "Item not found in any cart or item identification is incorrect." });
        }

        // Find the item in the cartItems array based on itemId
        const itemToUpdate = cart.cartItems.find(item => item._id.toString() === itemId);

        if (!itemToUpdate) {
            return res.status(404).json({ message: "Item not found in any cart or item identification is incorrect." });
        }

        // If the item has a previous quantity already, this will just add the previous and current quantity that you specified.
        itemToUpdate.quantity = (itemToUpdate.quantity || 0) + quantity;

        // Recalculate the subtotal based on the updated quantity
        itemToUpdate.subtotal = itemToUpdate.quantity * itemToUpdate.price;

        // Recalculate the total price based on the updated quantities
        cart.totalPrice = cart.cartItems.reduce((total, item) => total + item.subtotal, 0);

        await cart.save();

        // Respond with the updated item information and a success message
        const updatedItem = {
            itemId: itemToUpdate._id,
            name: itemToUpdate.name,
            description: itemToUpdate.description,
            quantity: itemToUpdate.quantity,
            price: itemToUpdate.price,
            subtotal: formatCurrency(itemToUpdate.subtotal), // Formatting subtotal with peso sign
        };

        res.status(200).json({ message: "Quantity of your item is successfully updated. With this, your subtotal for the item is changed.", updatedItem });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error. Failed to update quantity. Please try again later." });
    }
};


// [REMOVE PRODUCTS FROM CART - HUI ANGELES]
module.exports.removeItem = async (req, res) => {
    try {
        const { productId } = req.params;

        const cart = await Cart.findOneAndUpdate(
            { 'cartItems._id': productId },
            { $pull: { 'cartItems': { _id: productId } } },
            { new: true }
        );

        if (!cart) {
            return res.status(404).json({ error: "Item not found in the cart. Please correct input." });
        }

        // When Item is removed, total price will be updated
        const totalPrice = cart.cartItems.reduce((acc, item) => acc + item.subtotal, 0);

        await cart.updateOne({ totalPrice });

        const formattedOutput = {
            message: "Item successfully removed from your cart. Please see updated cart details:",
            updatedItem: {
                cartItems: cart.cartItems.map(item => ({
                    itemId: item._id,
                    name: item.name,
                    description: item.description,
                    quantity: item.quantity,
                    price: formatCurrency(item.price), 
                    subtotal: formatCurrency(item.subtotal), 
                })),
                totalPrice: formatCurrency(totalPrice), 
            }
        };

        res.status(200).json(formattedOutput);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error. Failed to remove item. Please try again later." });
    }
};

// [CLEAR CART - HUI ANGELES]
module.exports.clearCart = async (req, res) => {
    try {
        const cartId = req.user && req.user.id;
        if (!cartId) {
            return res.status(401).json({ message: "Unable to proceed in clearing your cart. Please provide a valid authentication token." });
        }

        const userCart = await Cart.findOne({ cartId });
        if (!userCart) {
            return res.status(404).json({ message: "User has no carts identified. Please add items to the cart to use this function." });
        }

        // Validating if the user is really sure on clearing his/her cart. This is added as an additional feature.
        const confirmation = req.body.confirmation;
        console.log('Confirmation value:', confirmation);

        if (!confirmation) {
            return res.status(400).json({ message: "Please confirm in the request body if you want to delete your cart. Type 'yes' to confirm." });
        }

        // user confirmation if we can proceed with the cart clearing
        if (confirmation.toLowerCase() === 'yes') {
            
            if (userCart.cartItems.length > 0) {
                
                userCart.cartItems = [];
                userCart.totalPrice = 0;

                await userCart.save();

                return res.status(200).json({
                    message: "Your cart is successfully cleared!",
                    clearedCart: {
                        cartItems: [],
                        totalPrice: 0,
                    },
                });
            } else {
                // If the cart is already cleared and tried to re-cleared
                return res.status(200).json({
                    message: "Your cart is already empty.",
                });
            }
        } else {
            // If the user decided not to clear the cart it will just return the items on his/her cart
            return res.status(200).json({
                message: "Cart is not cleared as per your request.",
                currentCart: {
                    cartItems: userCart.cartItems,
                    totalPrice: formatCurrency(userCart.totalPrice,)
                },
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error. Unable to clear your cart. Please try again later." });
    }
};










