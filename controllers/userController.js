/**
 * User Authentication Controller
 *
 * This module handles user registration and login functionality.
 * It uses bcrypt for password hashing and jsonwebtoken for token generation.
 *
 * Dependencies:
 * - bcryptjs: For securely hashing and comparing passwords.
 * - jsonwebtoken: For generating JWT tokens for authenticated users.
 * - User Model: Sequelize model for interacting with the users table.
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Register a new user.
 *
 * This function receives user details from the request body, hashes the password,
 * creates a new user record in the database, and returns the created user.
 *
 * @param {Object} req - Express request object.
 * @param {Object} req.body - Contains user registration details.
 * @param {string} req.body.name - The user's name.
 * @param {string} req.body.email - The user's email address.
 * @param {string} req.body.password - The user's plaintext password.
 * @param {string} req.body.role - The user's role (e.g., 'Admin', 'SalesAgent').
 * @param {Object} res - Express response object.
 *
 * @returns {Object} JSON response containing the newly created user.
 */


exports.register = async (req, res) => {
    // Destructure required fields from the request body
    const { name, email, password, role } = req.body;

    // Hash the plaintext password with a salt factor of 10
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user record in the database using the hashed password
    const user = await User.create({ name, email, password: hashedPassword, role });

    // Respond with a 201 status and the created user object
    res.status(201).json(user);
};


/**
 * Login an existing user.
 *
 * This function verifies user credentials by comparing the provided password with
 * the stored hashed password. If valid, it generates a JWT token containing the user's
 * id and role, with an expiration time of 1 hour.
 *
 * @param {Object} req - Express request object.
 * @param {Object} req.body - Contains login credentials.
 * @param {string} req.body.email - The user's email address.
 * @param {string} req.body.password - The user's plaintext password.
 * @param {Object} res - Express response object.
 *
 * @returns {Object} JSON response containing the JWT token, or an error message if credentials are invalid.
 */

exports.login = async (req, res) => {
    // Destructure email and password from the request body
    const { email, password } = req.body;

    // Look up the user in the database by email
    const user = await User.findOne({ where: { email } });

    // If the user is not found or the password does not match, return a 401 error
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ message: 'Invalid credentials' });

    // Generate a JWT token containing the user's id and role
    // The token expires in 1 hour and is signed using the secret from the environment variables
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    // Respond with the generated token
    res.json({ token });
};
