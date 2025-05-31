

//Note
const mongoose = require('mongoose');
// Define a schema for notes
const noteSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    subjectCode: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required:false
    },
    document: {
        data: Buffer,
        contentType: {
            type: String,
            enum: [
                'application/pdf',
                'image/jpeg',
                'image/png',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'video/mp4',
                'video/mkv',
                'video/avi',
                'video/webm'

                // 'application/pdf',
                // 'image/jpeg',
                // 'image/png',
                // 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                // 'video/mp4',
                // 'video/x-msvideo',
                // 'video/quicktime'
                // Add more allowed content types as needed
            ],
            default: 'application/pdf'
        },
        fileName: String // Store the original file name
    },
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: true // Ensure that every note is associated with a class
    },
    downloadCount: {type: Number, default: 0},
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Optional: Indexing for faster searches
noteSchema.index({ subjectCode: 1, class: 1 });

// Create and export the model
module.exports = mongoose.model('Note', noteSchema);








