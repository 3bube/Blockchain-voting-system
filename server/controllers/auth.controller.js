import User from "../models/user.models.js";
import jwt from "jsonwebtoken";

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, email, password, nin } = req.body;

    // Validate input fields
    if (!name || !email || !password || !nin) {
      return res.status(400).json({
        success: false,
        message: "All fields are required (name, email, password, nin)",
        missingFields: {
          name: !name,
          email: !email,
          password: !password,
          nin: !nin
        }
      });
    }

    // Check if user exists by email
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Check if NIN is already used
    const ninExists = await User.findOne({ nin });
    if (ninExists) {
      return res.status(400).json({
        success: false,
        message: "NIN already registered",
      });
    }

    console.log("Creating user with data:", { name, email, nin, passwordLength: password?.length || 0 });

    // Create user with a generated username based on email
    // This prevents the duplicate key error for username
    const user = await User.create({
      name,
      email,
      password,
      nin,
      username: email.split('@')[0] + '_' + Date.now().toString().slice(-4), // Generate a unique username
    });

    console.log("User created:", user);

    if (user) {
      res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          nin: user.nin,
          role: user.role,
          token: generateToken(user._id),
        },
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Invalid user data",
      });
    }
  } catch (error) {
    console.error("Registration error:", error);
    
    // Handle specific MongoDB errors
    if (error.name === 'ValidationError') {
      // Mongoose validation error
      const validationErrors = {};
      for (const field in error.errors) {
        validationErrors[field] = error.errors[field].message;
      }
      
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: validationErrors
      });
    } else if (error.code === 11000) {
      // Duplicate key error
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`,
        field: field
      });
    }
    
    // Generic server error
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  console.log("Login request received");
  try {
    const { email, password } = req.body;

    console.log(email, password);

    // Check for user email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        nin: user.nin,
        role: user.role,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        id: user._id, // Adding id for consistency with frontend
        name: user.name,
        email: user.email,
        nin: user.nin,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch user data",
      details: error.message,
    });
  }
};
