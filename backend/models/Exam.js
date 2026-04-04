const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
    examName: { 
        type: String,
        required: true,
        trim: true
    },

    examType: {
        type: String,
        required: true,
        enum: ['Unit Test', 'Mid-term', 'Final', 'Internal', 'periodicTest', 'noteBooks', 'subEnrichment', 'finalExam'] 
    },

    // CBSE term this component belongs to
    term: {
        type: String,
        enum: ['Term-1', 'Term-2'],
        default: null
    },

    // Explicit component key for result generation
    component: {
        type: String,
        enum: ['periodicTest', 'noteBooks', 'subEnrichment', 'finalExam', null],
        default: null
    },

    academicYear: {
        type: String,
        required: true
    },

    startDate: {
        type: Date,
        required: true
    },

    endDate: {
        type: Date,
        required: true
    },
    
    maxMarks: { 
        type: Number,
        required: true,
        default: 100 
    },

    status: { 
        type: String,
        enum: ['Scheduled', 'Ongoing', 'Completed', 'Cancelled'],
        default: 'Scheduled' 
    },

    createdBy: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    }
    
}, { timestamps: true });

// Index for fast searching by year and type
examSchema.index({ academicYear: 1, examType: 1 });

module.exports = mongoose.model('Exam', examSchema);