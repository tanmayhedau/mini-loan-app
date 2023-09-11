const { default: mongoose } = require('mongoose');
const LoanModel = require('../models/loanModel');
const userModel = require('../models/userModel');
const moment = require('moment');

module.exports.requestLoan = async (req, res) => {
  try {
    const { amount, term, startDate } = req.body;
    const { userId } = req.params; // id is userId

    //validations
    if (!amount || !term || !startDate) {
      return res.status(400).json({ success: false, message: "Please fill all fields" });
    }

    //generate scheduled payments
    let repayments = [];
    let weeklyAmount = amount / term;
    let specificDate = moment(startDate);

    for (let i = 1; i <= term; i++) {

      // update the startDate weekly
      specificDate = specificDate.add(1, 'weeks');

      let increasedDate = moment(specificDate).toDate();

      let repayment = {
        date: increasedDate,
        amount: i === term ? (amount - (i - 1) * weeklyAmount).toFixed(2) : weeklyAmount.toFixed(2),
      };
      repayments.push(repayment);
    }

    const user = await userModel.findById(userId);

    const loan = (await LoanModel.create({ ...req.body, userId: user._id, repayments }));
    return res.status(201).json({ success: true, message: "Loan request sent", data: loan });

  } catch (error) {
    console.log("Error from requestLoan", error.message);
    return res.status(500).json({ message: error.message });
  }
};


module.exports.approveLoan = async (req, res) => {
  try {
    const { loanId } = req.params; // id is loanId
    const userId = req.loginUserId;

    //check if user is an admin
    const user = await userModel.findById(userId);
    if (user.isAdmin === false) {
      return res.status(403).json({ success: false, message: 'Unathorized user' });
    }

    const loan = await LoanModel.findById(loanId);
    if (!loan) {
      return res.status(404).json({ success: false, message: 'Loan not found' });
    }

    //changing status to approved
    loan.status = 'APPROVED';
    loan.isApproved = true;
    await loan.save();

    return res.status(200).json({ success: true, message: "Loan approved successfully", data: loan });

  } catch (error) {
    console.log("Error from approveLoan", error.message);
    return res.status(500).json({ message: error.message });
  }
};


module.exports.viewloan = async (req, res) => {
  try {
    const { userId } = req.params; // id is userId

    const userHasLoan = await LoanModel.find({ userId: new mongoose.Types.ObjectId(userId) });
    if (!userHasLoan) {
      return res.status(404).json({ success: false, message: 'user do not have loan' });
    }

    return res.status(200).json({ success: true, message: "Loan fetched successfully", data: userHasLoan });

  } catch (error) {
    console.log("Error from viewLoan", error.message);
    return res.status(500).json({ message: error.message });
  }
};


module.exports.payLoan = async (req, res) => {
  try {
    const { loanId, paymentId } = req.params;
    const { amount } = req.body;

    const loan = await LoanModel.findById(loanId);
    if (!loan) {
      return res.status(404).json({ success: false, message: 'Loan not found' });
    }

    // console.log(loan)
    if (loan.status === "APPROVED") {

      // logic for paying amount
      const doPayment = await LoanModel.updateOne({ _id: loanId, "repayments._id": paymentId }, { $set: { "repayments.$.amount": amount, "repayments.$.paymentStatus": "PAID" } }, { new: true });


      //check if all repayments are PAID
      const allRepaymentsPaid = loan.repayments.every(repayment => repayment.paymentStatus === "PAID");

      if (allRepaymentsPaid) {
        await LoanModel.updateOne({_id:loanId},{$set:{status:"PAID"}})
      }

      return res.status(200).json({ success: true, message: "Payment done successfully" });

    } else {
      return res.status(200).json({ success: false, message: "Loan is not approved yet, Please wait.." });
    }

  } catch (error) {
    console.log("Error from payLoan", error.message);
    return res.status(500).json({ message: error.message });
  }
};
