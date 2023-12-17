const User = require('../model/User');
exports.getSingleUserData = async (req, res, next) => {
    try {
        const user = await User.findById(req.id).populate('facebook').select('-password');
        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
};