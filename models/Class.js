
const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true // Class name is required
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId, // Assuming teacher is an ObjectId
        ref: 'User', // Referencing the User model
        required: false // Ensure teacher is required
    },
    notes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Note' }]
});

module.exports = mongoose.model('Class', classSchema);

