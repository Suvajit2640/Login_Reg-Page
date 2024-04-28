const exp = require("constants");
const express = require("express")
const app = express();
const jwt = require("jsonwebtoken")
const path = require("path")
const User = require("./schema/schema")
const bcrypt = require("bcryptjs")
const auth = require("./middleware/auth");
const cookieParser = require("cookie-parser");
const { resolve6 } = require("dns");
const { resolve4 } = require("dns/promises");
require("dotenv").config();
require("./conn/conn")// connecting to database

const port = process.env.PORT || 5500;
app.set("views", path.join(__dirname, "views"))
app.use(express.static(path.join(__dirname, "public")))
app.use(express.urlencoded({ extended: false }));
app.use(express.json())
app.use(cookieParser());
app.set("view engine", "ejs");
app.get("/", async (req, res) => {
    if (Object.keys(req.cookies).length === 0) {
        res.render("index", { nam: "" })
        return;
    }
    else {

        const verifyuser = jwt.verify(req.cookies.jwt, process.env.SECRET_KEY);

        const userdata = await User.findOne({ _id: verifyuser._id })



        if (!userdata) {

            console.log("User not found");
            res.render("index", { nam: "" });
        }
        else if (userdata.tokens == "") {
            return res.render("index", { nam: "" });
        }
        else {
            return res.render("index", userdata);
        }

    }

})
app.get("/register", (req, res) => {
    res.render("register")
})
app.get("/login", async (req, res) => {
    try {
        res.render("login")
    }
    catch (err) {
        console.log('error in loading login page', err);

    }
})
app.post("/register", async (req, res) => {
    try {

        const password = req.body.password;
        const cpassword = req.body.confirmpassword;


        if (password === cpassword) {



            const registeruser = new User({
                nam: req.body.nam,
                Email: req.body.Email,
                Number: req.body.Number,
                DOB: req.body.DOB,
                password: password
            })
            const token = await registeruser.generatetoken();

            res.cookie("jwt", token)

            await registeruser.save();

            res.redirect("/");
        }
        else {
            res.send("Password Mismatched")
        }
    }

    catch (error) {
        res.status(400).send({ error: error.message });

    }
})

app.post("/login", async (req, res) => {
    try {
        const Email = req.body.Email;
        const password = req.body.password;
        const userdata = await User.findOne({ Email })

        if (!userdata) {
            return res.status(401).send("Invalid Login Credentials");
        }

        const passwordmatch = await bcrypt.compare(password, userdata.password)

        if (passwordmatch) {
            const token = await userdata.generatetoken();
            res.cookie("jwt", token, { httpOnly: true, secure: false });
            res.redirect("/")
        }

        else res.status(401).send("Invalid Login Credentials");


    } catch (error) {
        res.status(400).send(error)
    }
})
app.get("/profile", auth, async (req, res) => {
    res.render("profile", req.user)
})
app.get("/logout", auth, async (req, res) => {
    try {
        res.clearCookie("jwt")
        // single device
        // req.user.tokens = req.user.tokens.filter((currElem) => {
        //     return currElem.token === req.token;
        // })

        req.user.tokens = [];
        await req.user.save();

        res.redirect("/")


    } catch (error) {
        res.status(402).send(error)
    }

})
app.post("/profile-update", auth, async (req, res) => {
    try {
        
        const updated_data = req.body;
        const userid = await req.user._id;
        const update = { [updated_data.field]: updated_data.value }

        if (!updated_data.value) {
            return res.status(500).json({ error: " cannot be empty" });
        }
        const updateuser = await User.findByIdAndUpdate(userid, update, { new: true, runValidators: true, context: 'query' })

        console.log(updateuser)
        res.status(200).json(updateuser);
    }
    catch (error) {
        console.log('error in updation', error);
        res.status(500).send(error)

    }


})
app.post("/profile-delete", auth, async (req, res) => {
    try {
        const userid = req.user._id;
        const deleteuser = await User.findByIdAndDelete(userid);
        if (deleteuser) {
            // If user is deleted successfully
            res.clearCookie("jwt");

            res.redirect("/")
            // console.log('Deletion Successful');

        } else {
            // If user deletion failed (user not found or other reasons)
            console.log('User not found or deletion failed');
            return res.status(404).send("User not found or deletion failed");
        }
    } catch (error) {
        console.log('server problem in deleting profile', error);
        return res.status(500).send(error);
    }
});

app.listen(port, () => {
    console.log('listening on port', port);

})