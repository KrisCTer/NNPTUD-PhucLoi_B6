var express = require('express');
var router = express.Router();
let inventoryModel = require('../schemas/inventory');

// GET all inventories
router.get('/', async function (req, res, next) {
    try {
        let result = await inventoryModel.find({}).populate('product');
        res.send(result);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// GET inventory by id
router.get('/:id', async function (req, res, next) {
    try {
        let id = req.params.id;
        let result = await inventoryModel.findById(id).populate('product');
        if (result) {
            res.send(result);
        } else {
            res.status(404).send({ message: "ID NOT FOUND" });
        }
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// POST add stock
router.post('/add-stock', async function (req, res, next) {
    try {
        let { product, quantity } = req.body;
        if (!product || quantity == null) {
            return res.status(400).send({ message: "product and quantity are required" });
        }
        if (typeof quantity !== 'number' || quantity <= 0) {
            return res.status(400).send({ message: "quantity must be a positive number" });
        }

        let result = await inventoryModel.findOneAndUpdate(
            { product: product },
            { $inc: { stock: quantity } },
            { new: true }
        ).populate('product');

        if (result) {
            res.send(result);
        } else {
            res.status(404).send({ message: "Inventory for this product not found" });
        }
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// POST remove stock
router.post('/remove-stock', async function (req, res, next) {
    try {
        let { product, quantity } = req.body;
        if (!product || quantity == null) {
            return res.status(400).send({ message: "product and quantity are required" });
        }
        if (typeof quantity !== 'number' || quantity <= 0) {
            return res.status(400).send({ message: "quantity must be a positive number" });
        }

        let result = await inventoryModel.findOneAndUpdate(
            { product: product, stock: { $gte: quantity } },
            { $inc: { stock: -quantity } },
            { new: true }
        ).populate('product');

        if (result) {
            res.send(result);
        } else {
            let checkExists = await inventoryModel.findOne({ product: product });
            if (!checkExists) {
                return res.status(404).send({ message: "Inventory for this product not found" });
            } else {
                return res.status(400).send({ message: "Not enough stock available" });
            }
        }
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// POST reservation
router.post('/reservation', async function (req, res, next) {
    try {
        let { product, quantity } = req.body;
        if (!product || quantity == null) {
            return res.status(400).send({ message: "product and quantity are required" });
        }
        if (typeof quantity !== 'number' || quantity <= 0) {
            return res.status(400).send({ message: "quantity must be a positive number" });
        }

        let result = await inventoryModel.findOneAndUpdate(
            { product: product, stock: { $gte: quantity } },
            { $inc: { stock: -quantity, reserved: quantity } },
            { new: true }
        ).populate('product');

        if (result) {
            res.send(result);
        } else {
            let checkExists = await inventoryModel.findOne({ product: product });
            if (!checkExists) {
                return res.status(404).send({ message: "Inventory for this product not found" });
            } else {
                return res.status(400).send({ message: "Not enough stock available for reservation" });
            }
        }
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// POST sold
router.post('/sold', async function (req, res, next) {
    try {
        let { product, quantity } = req.body;
        if (!product || quantity == null) {
            return res.status(400).send({ message: "product and quantity are required" });
        }
        if (typeof quantity !== 'number' || quantity <= 0) {
            return res.status(400).send({ message: "quantity must be a positive number" });
        }

        let result = await inventoryModel.findOneAndUpdate(
            { product: product, reserved: { $gte: quantity } },
            { $inc: { reserved: -quantity, soldCount: quantity } },
            { new: true }
        ).populate('product');

        if (result) {
            res.send(result);
        } else {
            let checkExists = await inventoryModel.findOne({ product: product });
            if (!checkExists) {
                return res.status(404).send({ message: "Inventory for this product not found" });
            } else {
                return res.status(400).send({ message: "Not enough reserved stock available to sell" });
            }
        }
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

module.exports = router;
