const Exam = require('../models/Exam');
const Mark = require('../models/Mark');

// @desc    Create a Global Exam Event
// @route   POST /api/admin/exams
// @access  Private (Admin)
const createExam = async (req, res) => {
    try {
        const { examName, examType, academicYear, startDate, endDate, maxMarks, term, component } = req.body;

        if (!examName || !examType || !academicYear || !startDate || !endDate || !maxMarks) {
            return res.status(400).json({ message: "Please provide all required fields including Max Marks" });
        }

        const examExists = await Exam.findOne({ examName, academicYear });
        if (examExists) {
            return res.status(400).json({ message: "An exam with this name already exists." });
        }

        const exam = await Exam.create({
            examName,
            examType,
            term:      term      || null,
            component: component || null,
            academicYear,
            startDate,
            endDate,
            maxMarks: Number(maxMarks),
            createdBy: req.user._id
        });

        res.status(201).json({ message: "Global Exam created successfully", exam });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};



// @desc    Get all exams (Admin View)
// @route   GET /api/admin/exams
const getAllExams = async (req, res) => {
    try {
        const { year, status } = req.query; 
        let query = {};
        
        if (year) query.academicYear = year;

        if (req.user?.role === 'admin') {
            // Admin sees all, but can filter by status if explicitly requested
            if (status) query.status = status;
        } else if (req.user?.role === 'teacher') {
            // Teachers see Ongoing exams (for marks entry)
            query.status = status || 'Ongoing';
        } else {
            // Students only see Completed (published) exams
            query.status = 'Completed';
        }

        const exams = await Exam.find(query).sort({ startDate: -1 });
        res.status(200).json(exams);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// @desc    Update Exam Status (e.g., Publish it or Mark as Completed)
// @route   PUT /api/admin/exams/:id/status
const updateExamStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['Scheduled', 'Ongoing', 'Completed', 'Cancelled'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const exam = await Exam.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        // When admin publishes results, notify every student who has marks in this exam
        if (status === 'Completed' && exam) {
            const Notification = require('../models/Notification');
            const marks = await Mark.find({ examId: exam._id }).distinct('studentId');

            if (marks.length > 0) {
                const notifications = marks.map(studentId => ({
                    recipient:     studentId,
                    recipientRole: 'student',
                    title:         'Result Published',
                    message:       `Your result for "${exam.examName}" has been published. Check your marks now.`,
                    link:          '/student/marks',
                }));
                await Notification.insertMany(notifications);
            }
        }

        res.status(200).json({ message: `Exam status updated to ${status}`, exam });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

const deleteExam = async (req, res) => {
    try {
        const examId = req.params.id;

        const exam = await Exam.findById(examId);
        if (!exam) {
            return res.status(404).json({ message: "Exam event not found" });
        }

        // 1. Delete all Marks associated with this Exam
        const Mark = require('../models/Mark'); // Ensure model is available
        await Mark.deleteMany({ examId: examId });

        // 2. Delete the Exam itself
        await Exam.findByIdAndDelete(examId);

        res.status(200).json({ 
            message: "Exam and all associated marks deleted successfully." 
        });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

const getAcademicSessions = async (req, res) => {
    try {
        const examYears = await Exam.distinct('academicYear');
        const settings = await require('../models/Settings').findOne();
        const currentYear = settings?.currentAcademicYear;

        const sessionSet = new Set(examYears);
        if (currentYear) sessionSet.add(currentYear);

        const sortedSessions = Array.from(sessionSet).sort((a, b) => b.localeCompare(a));
        res.status(200).json(sortedSessions);
    } catch (error) {
        res.status(500).json({ message: "Discovery Failed" });
    }
};


// Add deleteExam to your exports
module.exports = { createExam, getAllExams, updateExamStatus, deleteExam, getAcademicSessions };