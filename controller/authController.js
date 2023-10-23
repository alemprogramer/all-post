exports.userSignupController = async (req,res,next)=>{
    try {
        res.status(200).json({
            success:200,
            message:'User successfully signed up'
        })
    } catch (error) {
        next(error);
    }
}

exports.userLoginController = async (req,res,next)=>{
    try {
        
    } catch (error) {
        next(error);
    }
}

exports.refreshTokenController = async (req,res,next)=>{
    try {
        
    } catch (error) {
        next(error);
    }
};

exports.logOutController = async (req,res,next)=>{
    try {
        
    } catch (error) {
        next(error);
    }
};

