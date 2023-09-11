const express = require('express');
const { registerUser,loginUser } = require('../controllers/userController');
const { requestLoan, approveLoan, viewloan, payLoan } = require('../controllers/loanController');
const { authenticate } = require('../middlewares/authMiddleware');

const router = express.Router();

// auth routes
router.post('/register',registerUser)
router.post('/login', loginUser)


//loan routes
router.post('/request-loan/:userId', authenticate, requestLoan);
router.post('/loans/:loanId/approve', authenticate, approveLoan);
router.get('/loans/:userId', authenticate, viewloan);
router.post('/loans/:loanId/payments/:paymentId', authenticate, payLoan);


module.exports = router;