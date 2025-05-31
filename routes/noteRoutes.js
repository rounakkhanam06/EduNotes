const express = require('express');
const router = express.Router();
const Class = require('../models/Class');
const Note = require('../models/Note');
const multer = require('multer');
const mammoth = require('mammoth');
const path = require('path');
const { isTeacher } = require('../middlewares/checkRole.js');
const { authenticateUser } = require('../middlewares/auth.js');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 100 * 1024 * 1024 }, fileFilter });

// File filter to accept specific file types
function fileFilter(req, file, cb) {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document','video/mp4','video/mkv', 'video/avi','video/webm'];
    if (!allowedTypes.includes(file.mimetype)) {
        return cb(new Error('Invalid file type')); // Reject file if type is not allowed
    }
    cb(null, true); // Accept the file
}

// Route to render the form for adding a note to a specific class
router.get('/class/:id/add-note', async (req, res) => {
    try {
        const classId = req.params.id;
        
        // Fetch notes related to the specified class ID
        const notes = await Note.find({ class: classId });
        
        // You may fetch class details if needed (commented out for now)
        const classDetails = await Class.findById(classId);

        // Render the form for adding a note
        res.render('classes/add-note', {
            classId: classId,
            className: classDetails.name, // Replace with actual class name if available
            notes: notes
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error'); // Handle server errors
    }
});

// // Route to handle form submission for adding a note
router.post('/class/:id/add-note', isTeacher, upload.single('document'), async (req, res) => {
    try {
        const { title, subjectCode, message } = req.body;
        const document = req.file
        ? {
            data: req.file.buffer,
            contentType: req.file.mimetype
            // fileName: req.file.originalname,
        }
        : null;


        // Create a new note with the provided details
        const note = await Note.create({
            title,
            subjectCode,
            message,
            document,
            class: req.params.id
          
        });

        // Update the class to include the new note
        await Class.findByIdAndUpdate(req.params.id, { $push: { notes: note._id } });

        req.session.message = { type: 'success', message: 'Note added successfully!' }; // Set success message
        res.redirect(`/class/${req.params.id}`); // Redirect to class page
    } catch (err) {
        req.session.message = { type: 'error', message: 'Error adding note.' }; // Set error message
        res.redirect(`/class/${req.params.id}/add-note`); // Redirect back to form
    }
});


// Route to show details of a specific note
router.get('/class/:classId/showNote/:noteId', async (req, res) => {
    try {
        const { classId, noteId } = req.params;
        const user = req.user;

        // Find the note by ID
        const note = await Note.findById(noteId).populate('class');
        if (!note) {
            return res.status(404).send('Note not found'); // Handle case where note is not found
        }

        // Log the current views count before incrementing
        console.log('Current views:', note.views);

        // Increment the views field
        note.views = (note.views || 0) + 1;

        // Log the new views count after incrementing
        console.log('Updated views:', note.views);

        // Save the updated note
        await note.save();

        // Render the view for showing the note
        res.render('classes/showNote', { note, classId, user });
    } catch (err) {
        console.error('Error updating views:', err);
        res.status(500).send('Server error'); // Handle errors
    }
});


// Route to display the edit form for a specific note
router.get('/class/:noteId/edit', async (req, res) => {
    try {
        const { noteId } = req.params;

        // Find the note by ID
        const note = await Note.findById(noteId);
        if (!note) {
            return res.status(404).send('Note not found'); // Handle case where note is not found
        }

        // Render the edit form for the note
        res.render('classes/editNote', { note });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send('Server error'); // Handle errors
    }
});

// // Route to handle note updates, including file uploads
router.put('/class/:noteId/edit', upload.single('newDocument'), async (req, res) => {
    try {
        const { noteId } = req.params;
        const { title, message } = req.body;
        const newDocument = req.file; // New file info

        // Find and update the note by ID
        const note = await Note.findById(noteId);
        if (!note) {
            return res.status(404).send('Note not found');
        }

        // Update note fields
        if (title) note.title = title;
        if (message) note.message = message;
        note.updatedAt = Date.now();

        // Update document if a new file is provided
        if (newDocument) {
            note.document = {
                data: newDocument.buffer,
                contentType: newDocument.mimetype
            };
        }

        // Save the updated note
        await note.save();
        req.session.message = { type: 'success', message: 'Note updated successfully!' }; // Set success message
        res.redirect(`/class/${note.class}/showNote/${note._id}`);
    } catch (err) {
        req.session.message = { type: 'error', message: 'Error updating note.' }; // Set error message
        res.redirect(`/class/${req.params.noteId}/edit`); // Redirect back to form
    }
});

// Route to delete a specific note
router.delete('/class/:noteId/delete', isTeacher, async (req, res) => {
    try {
        const { noteId } = req.params;

        // Find and delete the note by ID
        const note = await Note.findById(noteId);
        if (!note) {
            return res.status(404).send('Note not found');
        }

        // Delete the note
        await Note.findByIdAndDelete(noteId);
        req.session.message = { type: 'success', message: 'Note deleted successfully!' }; // Set success message
        res.redirect(`/class/${note.class}`);
    } catch (err) {
        req.session.message = { type: 'error', message: 'Error deleting note.' }; // Set error message
        res.redirect(`/class/${note.class}`); // Redirect to class page
    }
});


// Route to preview a note's document
router.get('/preview/:noteId', async (req, res) => {
    try {
        const note = await Note.findById(req.params.noteId);
        if (!note || !note.document) {
            return res.status(404).send('Document not found');
        }

        const documentData = note.document.data;
        const documentType = note.document.contentType;

        if (documentType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            // Convert DOCX to HTML
            mammoth.convertToHtml({ buffer: documentData })
                .then(result => {
                    // Send HTML content for preview
                    res.send(`
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <title>Document Preview</title>
                            <style>
                                body { font-family: Arial, sans-serif; }
                                .container { padding: 20px; }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                ${result.value}
                            </div>
                        </body>
                        </html>
                    `);
                })
                .catch(err => {
                    console.error('Error converting document to HTML:', err);
                    res.status(500).send('Error previewing document');
                });
        } else {
            // Handle other file types
            res.writeHead(200, {
                'Content-Type': documentType,
                'Content-Disposition': `inline; filename="preview.${documentType.split('/')[1]}"`
            });
            res.end(documentData);
        }
    } catch (err) {
        console.error('Error previewing document:', err);
        res.status(500).send('Error previewing document');
    }
});


// Route to download a note's document
router.get('/download/:noteId', async (req, res) => {
    try {
        const note = await Note.findById(req.params.noteId);
        if (!note || !note.document) {
            return res.status(404).send('Document not found'); // Handle case where document is not found
        }

        const documentData = note.document.data;
        const documentType = note.document.contentType;
        const fileName = `note-${req.params.noteId}.${documentType.split('/')[1]}`; // Generate file name with extension

        // Set response headers for file download
        res.writeHead(200, {
            'Content-Type': documentType,
            'Content-Disposition': `attachment; filename="${fileName}"`,
        });

        res.end(documentData);
    } catch (err) {
        console.error('Error downloading document:', err);
        res.status(500).send('Error downloading document'); // Handle errors
    }
});

module.exports = router;
