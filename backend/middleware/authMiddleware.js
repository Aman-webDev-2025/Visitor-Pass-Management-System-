const jwt = require("jsonwebtoken");


//authorization
const auth =(req, res, next) =>{

  const authHeader = req.headers.authorization || req.headers.Authorization;
  if(!authHeader || !authHeader.startsWith("Bearer ")){
    console.warn("token not found");
    return res.status(401).json({message: "token not found"});
  }
  const token = authHeader.split(" ")[1];

  try{
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
    next();
  } 
  catch(err){
    console.warn("Token was not valid", err.message);
    res.status(401).json({message: "Token is not valid" });
  }
}

//acccess by role base
const allowRoles = (...roles) =>{
  return (req, res, next) =>{
    if(!req.user || !roles.includes(req.user.role)) {
      console.warn("User tried to open a page without right role");
      return res.status(403).json({message: "Access denied" });
    }
    next();
  };
};

module.exports = {auth, allowRoles};
