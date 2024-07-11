
const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema({
    user: String,
    items: [String],
});

module.exports = mongoose.model("Todo", todoSchema);
