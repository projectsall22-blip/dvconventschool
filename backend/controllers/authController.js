const Admin = require('../models/Admin');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken');

// @desc    Admin Login
// @route   POST /api/auth/admin-login
const adminLogin = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const admin = await Admin.findOne({ email: email.toLowerCase().trim() });
        if (!admin || !(await bcrypt.compare(password, admin.password))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        res.json({
            _id: admin._id,
            name: admin.name,
            role: 'admin',
            profileImage: admin.profileImage,
            email: admin.email,
            phone: admin.phone,
            token: generateToken(admin._id, 'admin'),
        });
    } catch (error) {
        console.error('Admin login error:', error.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Student Login
// @route   POST /api/auth/student-login
const studentLogin = async (req, res) => {
    const { UID, password } = req.body;

    if (!UID || !password) {
        return res.status(400).json({ message: 'UID and password are required' });
    }

    try {
        const student = await Student.findOne({ UID: UID.trim() });

        if (!student) {
            return res.status(401).json({ message: 'Invalid UID or password' });
        }

        if (student.accountStatus !== 'active') {
            return res.status(401).json({ message: 'Account is not active. Please contact Admin.' });
        }

        const isMatch = await bcrypt.compare(password, student.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid UID or password' });
        }

        res.json({
            _id: student._id,
            name: student.name,
            role: 'student',
            class: student.class,
            dateOfBirth: student.dateOfBirth,
            gender: student.gender,
            address: student.address,
            pincode: student.pincode,
            category: student.category,
            guardianName: student.guardianName,
            guardianMobile: student.guardianMobile,
            fatherName: student.fatherName,
            fatherMobile: student.fatherMobile,
            motherName: student.motherName,
            motherMobile: student.motherMobile,
            parentEmail: student.parentEmail,
            UID: student.UID,
            admissionDate: student.admissionDate,
            academicHistory: student.academicHistory,
            profileImage: student.profileImage,
            aadharNumber: student.aadharNumber,
            penNumber: student.penNumber,
            token: generateToken(student._id, 'student'),
        });
    } catch (error) {
        console.error('Student login error:', error.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Teacher Login
// @route   POST /api/auth/teacher-login
const teacherLogin = async (req, res) => {
    const { employeeCode, password } = req.body;

    if (!employeeCode || !password) {
        return res.status(400).json({ message: 'Employee code and password are required' });
    }

    try {
        const teacher = await Teacher.findOne({ employeeCode: employeeCode.trim() });

        if (!teacher) {
            return res.status(401).json({ message: 'Invalid employee code or password' });
        }

        if (!teacher.isActive) {
            return res.status(401).json({ message: 'Account is inactive. Please contact Admin.' });
        }

        const isMatch = await bcrypt.compare(password, teacher.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid employee code or password' });
        }

        res.json({
            _id: teacher._id,
            name: teacher.name,
            role: 'teacher',
            employeeCode: teacher.employeeCode,
            email: teacher.email,
            phone: teacher.phone,
            gender: teacher.gender,
            dateOfBirth: teacher.dateOfBirth,
            joiningDate: teacher.joiningDate,
            experience: teacher.experience,
            address: teacher.address,
            aadharNumber: teacher.aadharNumber,
            qualifications: teacher.qualifications,
            profileImage: teacher.profileImage,
            token: generateToken(teacher._id, 'teacher'),
        });
    } catch (error) {
        console.error('Teacher login error:', error.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

// TEMPORARY: Create first admin — remove this route after initial setup
const createFirstAdmin = async (req, res) => {
    try {
        const existing = await Admin.findOne({});
        if (existing) {
            return res.status(400).json({ message: 'Admin already exists. Remove this route.' });
        }

        const admin = await Admin.create({
            name: 'School Owner',
            email: 'admin@test.com',
            username: 'admin',
            password: 'Admin@@2026##',
            role: 'admin',
        });

        res.status(201).json({
            message: 'Admin created successfully',
            email: admin.email,
            password_status: 'Secured',
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { adminLogin, studentLogin, teacherLogin, createFirstAdmin };
