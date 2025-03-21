const {Schema,model} = require('mongoose');

const linkedinOrganizationSchema = new Schema({
  id:{ //organization id
    type: String,
    required: true,
  },
  userId:{ //our database user _id
    type:Schema.Types.ObjectId,
    ref:'User',
    required:true,
  },
  ownerId:{ //linked account id
    type: String,
    required: true,
  },
  organizationName:String,
  website:String,
  foundedOn:Number,
  description:String,
  organizationType:String,
  specialties:{},
  country:String,
  logoURl:String,
  logoUrn:String,
});


module.exports = model('LinkedinOrganization', linkedinOrganizationSchema);