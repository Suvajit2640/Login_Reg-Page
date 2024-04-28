const jwt = require("jsonwebtoken");
const userdata = require("../schema/schema");
require("dotenv").config();

const auth = async (req, res, next) => {
    try {
        
        if (!req.cookies.jwt) {
             return res.status(401).send("You have not logged in");
        }
        const token = req.cookies.jwt;
       
        const verifyuser = jwt.verify(token, process.env.SECRET_KEY);
        
        const user = await userdata.findOne({ _id: verifyuser._id })
        
        if(!user){
            return res.status(401).send("Can't Access!! You have not logged in")
        }
        
        if (user.tokens == "") {
            return res.status(401).send("Can't Access!! You have not logged in")
        }
        req.user = user;
        req.token = token;

        next();
    } catch (error) {
        console.log('error in authorization', error);
        return res.status(401).json({ error: 'Unauthorized' });
    }
}

module.exports = auth;
