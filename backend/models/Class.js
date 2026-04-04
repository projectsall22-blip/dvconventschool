const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
    className: { 
        type: String, 
        required: true, 
        unique: true, // ✅ ONLY className is unique
        enum: ['Nursery', 'LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', '8']
    },
    capacity: { type: Number, default: 500 },
    classTeacher: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Teacher' 
    }
}, { timestamps: true });

module.exports = mongoose.model('Class', classSchema);
