// Validation middleware for different routes

// User register validation
const validateRegister = (req, res, next) => {
  const { email, password } = req.body;
  const errors = {};

  // Email validation
  if (!email) {
    errors.email = 'Email is required';
  } else if (!/\S+@\S+\.\S+/.test(email)) {
    errors.email = 'Email is invalid';
  }

  // Password validation
  if (!password) {
    errors.password = 'Password is required';
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }

  // Return errors if any
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

// User login validation
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = {};

  // Email validation
  if (!email) {
    errors.email = 'Email is required';
  }

  // Password validation
  if (!password) {
    errors.password = 'Password is required';
  }

  // Return errors if any
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

// Todo creation validation
const validateTodoCreate = (req, res, next) => {
  const { title, description } = req.body;
  const errors = {};

  // Title validation
  if (!title) {
    errors.title = 'Title is required';
  } else if (title.length < 3) {
    errors.title = 'Title must be at least 3 characters';
  }

  // Return errors if any
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

// Todo update validation
const validateTodoUpdate = (req, res, next) => {
  const { title, completed } = req.body;
  const errors = {};

  // Title validation (if provided)
  if (title !== undefined && title !== null) {
    if (title === '') {
      errors.title = 'Title cannot be empty';
    } else if (title && title.length < 3) {
      errors.title = 'Title must be at least 3 characters';
    }
  }

  // Completed validation (if provided)
  if (completed !== undefined && typeof completed !== 'boolean') {
    errors.completed = 'Completed must be a boolean value';
  }

  // Return errors if any
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateTodoCreate,
  validateTodoUpdate
}; 