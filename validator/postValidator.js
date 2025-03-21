const { body, validationResult } = require('express-validator');

const postValidator = [
  // Validate 'text' field (required)
  body('text')
  .not()
  .notEmpty().withMessage('text is required'),

  body('facebook')
  .custom((facebook,{req}) =>{
    const { instagram, linkedin, twitter } = req.body;
    
    if (![facebook, instagram, linkedin, twitter].some(Boolean)) {
      // None of the social media fields is true
      throw new Error('Please select one social media field where you want to post. ')
    }
    return true
  }),
  body('options').isArray().optional().withMessage('options must be array'),
  body('duration_minutes')
  .custom((duration_minutes,{req})=>{
        if(!duration_minutes && req.body.options){
            throw new Error('For poll post on witter need to duration_minutes')
        }
        return true;
  }),
  

  (req, res, next) => {
    const errors = validationResult(req).formatWith(error => error.msg);
    
    if (!errors.isEmpty()) {
        errorArr = errors.mapped();
        if(errorArr['facebook']) {
            errorArr.socialMedia = errorArr['facebook'];
            delete errorArr['facebook']
        }
        return res.status(400).json({ errors: errorArr });
    }
    
    // If validation passes, move to the next middleware
    next();
  },
];

module.exports = {
  postValidator,
};
