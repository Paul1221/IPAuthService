mongoose = require('mongoose');

const UserSchema= new mongoose.Schema({
    email: {type:String, required:true , unique:true},
    username:{type:String, required:true,unique:true},
    password:{type:String, required:true},
    name:{type:String, required:true,default:'Paul'},
    surname:{type:String, required:true,default:'Andrei'},
    age:{type:Number, required:true,default:99},
    sex:{type:String, required:true,default:'baiat'},
    environment:{type:String,required:false},
    homeStreet:{type:String,required:true,default:'off'},
    homeCity:{type:String,required:true,default:'off'},
    homeCountry:{type:String,required:true,default:'off'},
    homeStreetNr:{type:Number,required:true,default:69},
    homeNumber:{type:String,required:true,default:'07n-amCartela:))'},
    job:{type:String,required:true,default:'off'},
    activity:{type:String,required:true,default:'off'},
    familyMembers:{type:[String],required:false},
    proximityGroup:{type:[String],required:false},
    medicalHistory:{type:[String],required:false},
    active:{type:Boolean , required:true , default:false},
    temporaryToken:{type:String,required:false},
    specializations:{type:[String],required:false},
    cabinetStreet:{type:String,required:true,default:'off'},
    cabinetCity:{type:String,required:true,default:'off'},
    cabinetRegion:{type:String,required:true,default:'off'},
    cabinetStreetNr:{type:Number,required:true,default:420},
    workNumber:{type:String,required:true,default:'00'},
    type:{type:String,required:true,default:'doctor'},
    disponibility:{type:[String],required:false},
    hospitalName:{type:String,required:true,default:'Spital'},
    latitude:{type:Number,required:false},
    longitude:{type:Number,required:false}
});

const User = mongoose.model('users',UserSchema,'users');

module.exports=User;