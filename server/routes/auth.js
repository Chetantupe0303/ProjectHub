const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Project = require('../models/Project');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

const createAuthToken = (user) => jwt.sign(
  { userId: user._id, rollNo: user.rollNo, role: user.role },
  process.env.JWT_SECRET || 'fallback_secret',
  { expiresIn: '24h' }
);

const serializeUser = (user) => ({
  id: user._id,
  rollNo: user.rollNo,
  name: user.name,
  email: user.email,
  role: user.role
});

const registerUser = async (req, res, forcedRole = 'student') => {
  try {
    const { rollNo, password, name, email } = req.body;
    const isFacultyOrAdmin = forcedRole === 'admin' || forcedRole === 'headadmin';
    const computedRollNo = isFacultyOrAdmin ? (rollNo || email) : rollNo;
    const computedName = name || (email ? email.split('@')[0] : 'Administrator');
    const normalizedEmail = email ? email.toLowerCase().trim() : null;

    if (!normalizedEmail || !password || (forcedRole === 'student' && (!rollNo || !name))) {
      return res.status(400).json({ message: 'Missing required registration fields' });
    }

    const queryParts = [];
    if (computedRollNo) queryParts.push({ rollNo: computedRollNo });
    if (normalizedEmail) queryParts.push({ email: normalizedEmail });

    const existingUser = await User.findOne({ $or: queryParts });

    if (existingUser) {
      return res.status(400).json({
        message: 'User with this roll number or email already exists'
      });
    }

    const user = new User({
      rollNo: computedRollNo,
      password,
      name: computedName,
      email: normalizedEmail,
      role: forcedRole
    });

    await user.save();

    const token = createAuthToken(user);

    res.status(201).json({
      token,
      user: serializeUser(user)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res, expectedRole = null) => {
  try {
    const { rollNo, email, password } = req.body;
    
    // Normalize email to lowercase for admin logins
    const normalizedEmail = email ? email.toLowerCase().trim() : null;
    const normalizedRollNo = rollNo ? rollNo.trim() : null;
    
    const query = (expectedRole === 'admin' || expectedRole === 'headadmin') 
      ? { email: { $regex: new RegExp(`^${normalizedEmail}$`, 'i') } } 
      : { rollNo: normalizedRollNo };
    const identifier = (expectedRole === 'admin' || expectedRole === 'headadmin') ? normalizedEmail : normalizedRollNo;

    if (!identifier || !password) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const user = await User.findOne(query);
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (expectedRole === 'admin') {
      if (user.role !== 'admin' && user.role !== 'headadmin') {
        return res.status(403).json({ message: 'This account is not authorized for the faculty portal' });
      }
    } else if (expectedRole === 'headadmin') {
      if (user.role !== 'headadmin') {
        return res.status(403).json({ message: 'This account is not authorized for the admin portal' });
      }
    }

    const token = createAuthToken(user);

    res.json({
      token,
      user: serializeUser(user)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Student auth
router.post('/register', async (req, res) => registerUser(req, res, 'student'));
router.post('/login', async (req, res) => loginUser(req, res, 'student'));

// Admin auth
router.post('/admin/register', async (req, res) => registerUser(req, res, 'admin'));
router.post('/admin/login', async (req, res) => loginUser(req, res, 'admin'));

// Headadmin auth
router.post('/headadmin/register', async (req, res) => registerUser(req, res, 'headadmin'));
router.post('/headadmin/login', async (req, res) => loginUser(req, res, 'headadmin'));

// Get current user
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Faculty list for project assignment
router.get('/faculties', authMiddleware, async (req, res) => {
  try {
    const faculties = await User.find({ role: 'admin' })
      .select('_id name email')
      .sort({ name: 1 });

    res.json(faculties.map((faculty) => ({
      _id: faculty._id,
      id: faculty._id,
      name: faculty.name,
      email: faculty.email,
    })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all students (headadmin only)
router.get('/students', authMiddleware, async (req, res) => {
  try {
    const students = await User.find({ role: 'student' })
      .select('_id name email rollNo')
      .sort({ name: 1 });

    res.json(students.map((student) => ({
      _id: student._id,
      id: student._id,
      name: student.name,
      email: student.email,
      rollNo: student.rollNo,
    })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all users (students + faculties) (headadmin only)
router.get('/all-users', authMiddleware, async (req, res) => {
  try {
    const users = await User.find({ role: { $in: ['student', 'admin'] } })
      .select('_id name email rollNo role')
      .sort({ role: 1, name: 1 });

res.json(users.map((user) => ({
      _id: user._id,
      id: user._id,
      name: user.name,
      email: user.email,
      rollNo: user.rollNo,
      role: user.role,
    })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a faculty account, optionally transferring assigned projects to a replacement
router.delete('/faculties/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { replacementFacultyId } = req.body;

    const faculty = await User.findOne({ _id: id, role: 'admin' });
    if (!faculty) {
      return res.status(404).json({ message: 'Faculty account not found' });
    }

    const assignedProjectCount = await Project.countDocuments({ facultyRecipients: id });

    if (assignedProjectCount > 0 && !replacementFacultyId) {
      return res.status(409).json({
        message: 'Select a replacement faculty member before deleting an account with assigned projects'
      });
    }

    if (replacementFacultyId) {
      const replacementFaculty = await User.findOne({ _id: replacementFacultyId, role: 'admin' });

      if (!replacementFaculty) {
        return res.status(404).json({ message: 'Replacement faculty account not found' });
      }

      if (String(replacementFaculty._id) === String(faculty._id)) {
        return res.status(400).json({ message: 'Replacement faculty must be different from the deleted faculty' });
      }

      await Project.updateMany(
        { facultyRecipients: faculty._id },
        {
          $pull: { facultyRecipients: faculty._id },
          $addToSet: { facultyRecipients: replacementFaculty._id }
        }
      );

      await Project.updateMany(
        { reviewedBy: faculty._id },
        { $set: { reviewedBy: replacementFaculty._id } }
      );
    }

    await User.findByIdAndDelete(faculty._id);

    res.json({
      message: replacementFacultyId
        ? 'Faculty account deleted and assigned projects transferred'
        : 'Faculty account deleted successfully',
      assignedProjectCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
