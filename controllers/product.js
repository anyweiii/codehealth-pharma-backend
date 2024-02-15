const Product = require("../models/Product");
const mongoose = require("mongoose");

// [PRODUCT CREATION - HUI ANGELES]
module.exports.createProduct = async (req, res) => {
    try {
        const { name, description, price, category, stock } = req.body;

        if (!name || !description || !price || !category || !stock) {
            const missingFields = [];
            if (!name) missingFields.push('name');
            if (!description) missingFields.push('description');
            if (!price) missingFields.push('price');
            if (!category) missingFields.push('category');
            if (!stock) missingFields.push('stock');

            return res.status(400).json({
                error: `Please fill in all product details. Missing fields: ${missingFields.join(', ')}.`
            });
        }

        const existingProduct = await Product.findOne({ name });
        if (existingProduct) {
            return res.status(400).json({ error: "Product already exists. Please add another product." });
        }

        const newProduct = await Product.create({
            name,
            description,
            price,
            category,
            stock
        });

        const productResponse = {
            message: "Product successfully created!",
            items: {
                ...newProduct.toObject(),
                price: `₱${newProduct.price.toFixed(2)}` 
            }
        };

        res.status(201).json(productResponse);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to save product. Please try again after a few seconds." });
    }
};

// [RETRIEVING ALL PRODUCTS - HUI ANGELES]
module.exports.retrieveProduct = async (req, res) => {
    try {
        const allProducts = await Product.find();

        if (allProducts.length === 0) {
            return res.status(404).json({ error: "No products found. Please create a product first." });
        }

        const formattedProducts = allProducts.map(product => ({
            ...product.toObject(),
            price: `₱${product.price.toFixed(2)}`
        }));

        res.status(200).json({
            message: "Successfully retrieved products.",
            products: formattedProducts
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to retrieve products. Please try again later." });
    }
};

// [RETRIEVING ACTIVE PRODUCTS - HUI ANGELES]
module.exports.getActiveProduct = async (req, res) => {
    try {
        const activeProducts = await Product.find({ isActive: true });

        if (activeProducts.length === 0) {
            return res.status(404).json({ message: "We apologize, but there are no active products available at this time." });
        }

        const productsWithPesoSign = activeProducts.map(product => ({
            ...product.toObject(),
            price: `₱${product.price.toFixed(2)}`,
            isActive: product.isActive
        }));

        res.status(200).json({
            message: "Successfully retrieved active products.",
            products: productsWithPesoSign
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to retrieve active products. Please try again later." });
    }
};

// [RETRIEVING SINGLE PRODUCT - FROILAN OLIQUIANO]
module.exports.getProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const product = await Product.findById(productId);
        const productWithPesoSign = {
            ...product.toObject(),
            price: `₱${product.price.toFixed(2)}`
        };

        res.status(200).json({
            message: "This is the product that you are looking for",
            item: productWithPesoSign
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to retrieve specified product. Please try again later." });
    }
};

// [UPDATE PRODUCT INFORMATION - FROILAN OLIQUIANO]
module.exports.updateProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const { name, description, price, stock, category } = req.body;

        if (!name && !description && !price && !stock && !category) {
            return res.status(400).json({ error: "Unable to update, fields are not specified." });
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            {
                name,
                description,
                price,
                stock,
                category
            },
            { new: true }
        );

        const productResponse = {
            message: "Product successfully updated!",
            updatedProduct: {
                ...updatedProduct.toObject(),
                price: `₱${updatedProduct.price.toFixed(2)}`
            }
        };

        res.status(200).json(productResponse);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to update product. Please try again after a few seconds." });
    }
};

// [ARCHIVE PRODUCT - HUI ANGELES]
module.exports.archiveProduct = async (req, res) => {
    try {
        const { productId } = req.params;

        const existingProduct = await Product.findById(productId);
        if (!existingProduct.isActive) {
            return res.status(400).json({ error: "Product is already archived. Please choose another item." });
        }

        const archiveProduct = await Product.findByIdAndUpdate(productId, { isActive: false }, { new: true });
        const archivedProductResponse = {
            message: "Product is successfully archived",
            archivedProduct: {
                ...archiveProduct.toObject(),
                price: `₱${archiveProduct.price.toFixed(2)}`
            }
        };

        res.status(200).json(archivedProductResponse);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to archive product. Please try again after a few seconds." });
    }
};

// [ACTIVATE PRODUCT - FROILAN OLIQUIANO] 
module.exports.activateProduct = async (req, res) => {
    try {
        const { productId } = req.params;

        const existingProduct = await Product.findById(productId);
        if (existingProduct.isActive) {
            return res.status(400).json({ error: "Product is already active. Please choose another item." });
        }

        const activateProduct = await Product.findByIdAndUpdate(productId, { isActive: true }, { new: true });
        const activatedProductResponse = {
            message: "Product is successfully activated",
            activateProduct: {
                ...activateProduct.toObject(),
                price: `₱${activateProduct.price.toFixed(2)}`
            }
        };

        res.status(200).json(activatedProductResponse);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to activate product. Please try again after a few seconds." });
    }
}; 

// [SEARCH PRODUCT BY NAME - FROILAN OLIQUIANO]
module.exports.searchProductByName = async (req, res) => {
    try {
        const {productName} = req.body;

        // Added checking - Hui Angeles
        if (!productName) {
            return res.status(400).json({ error: "Please input a search keyword." });
        }

        const products = await Product.find({
            name: {$regex: productName, $options: 'i'}
        })

        // Added formatted response for clearer output
        const formattedProducts = products.map(product => ({
            ...product.toObject(),
            price: `₱${product.price.toFixed(2)}`
        }));

        res.status(200).json({ message: "Products retrieved successfully. See the lists provided: ", products: formattedProducts });
    } catch(error) {
        res.status(500).json({ error: "Internal Server Error. Failed to retrieve product details." });
    }
}

// [SEARCH PRODUCT BY PRICE -  FROILAN OLIQUIANO]
module.exports.searchProductByPrice = async (req, res) => {
    try {
        const { minPrice, maxPrice } = req.body;

        // added validation for user inputs - Hui Angeles
        if (!minPrice) {
            return res.status(400).json({ error: "Please provide valid minimum and maximum prices." });
        }

        if (minPrice > maxPrice) {
            return res.status(400).json({ error: "Minimum price should be less than or equal to maximum price." });
        }


        const products = await Product.find({
            price: { $gte: parseFloat(minPrice), $lte: parseFloat(maxPrice) }
        });

        // Added formatted response for clearer output - Hui Angeles
        res.status(200).json({
            success: true,
            message: "Products retrieved successfully. See products according to their price range",
            list: products.map(product => ({
                ...product.toObject(),
                price: `₱${product.price.toFixed(2)}`
            }))
        });

    } catch(error) {
        res.status(500).json({ error: "Internal Server Error. Unable to retrieve products by price." });
    }
}

// [SEARCH PRODUCT BY CATEGORY - HUI ANGELES]
module.exports.searchProductByCategory = async (req, res) => {
    try {
        const { category } = req.body;

        if (!category) {
            return res.status(400).json({ error: "Please input a valid category." });
        } 

        // Search for products by category in a case-insensitive manner
        const products = await Product.find({ 
            category: { $regex: category, $options: 'i' } 
        });

        if (products.length === 0) {
            return res.status(404).json({ error: 'No products found for the specified category.' });
        }

        res.json({
            success: true,
            message: 'Products retrieved successfully.',
            data: products.map(product => ({
                ...product.toObject(),
                price: `₱${product.price.toFixed(2)}`
            }))
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error. Unable to retrieve products by category.' });
    }
};







