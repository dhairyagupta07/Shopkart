import User from "../models/customer.model.js"
import bcrypt from 'bcrypt'
import genToken from '../utils/generateToken.js'

const cookieOptions = {
    httpOnly: true
}

export const registerUser = async(req, res) => {
    const {fullName, email, password, phone} = req.body

    try{
        if(!fullName || !password || !email || !phone){
            return res.status(400).json({message: 'All fields required'})
        }
        const emailExists = await User.findOne({email});
        if(emailExists){
            return res.status(409).json({success: false, message: 'Email already exists'})
        }
        if(password.length < 6){
            return res.status(400).json({success: false, message: 'password length should be greater than or Equal to 6'})
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({fullName, email, password: hashedPassword, phone})

        return res.status(201).json({
            success: true,
            message: "Customer registered successfully",
            customer:{
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                phone: newUser.phone
            }
        })
    }catch(err){
        console.log(err)
        res.status(500).json({success: false, message: 'Internal Server Error'})
    }
}

export const loginUser = async(req, res) => {
    try{
        const {email, password} = req.body
        if(!email || !password){
            return res.status(400).json({success: false, message: 'All fields required'})
        }

        const userExists = await User.findOne({email})
        if (!userExists) {
            return res.status(401).json({success: false,message: "Invalid email or password"})
        }
        const correctPassword = await bcrypt.compare(password, userExists.password);
        if(!correctPassword){
            return res.status(401).json({success: false, message: 'Invalid email or password'})
        }

        const token = genToken(userExists._id)
        res.cookie('token', token, cookieOptions)

        res.status(200).json({
            success: true,
            message: 'Login Successful',
            customer: {
                _id: userExists._id,
                fullName: userExists.fullName,
                email: userExists.email,
                phone: userExists.phone
            }
        })
    }catch(err){
        console.log(err);
        return res.status(500).json({success: false, message: 'Internal Server Error'})
    }
}

export const getUser = (req, res) =>{
    return res.status(200).json({
        _id: req.user._id,
        fullName: req.user.fullName,
        email: req.user.email,
        phone: req.user.phone
    })
}

export const logoutUser = (req, res) => {
    res.clearCookie('token', cookieOptions);
    return res.status(200).json({success: true, message: 'Logged Out successfully'})
}

export const changePassword = async (req, res) => {
    try {
        const {oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Old password and new password are required"
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "New password must contain at least 6 characters"
            });
        }

        const correctPassword = await bcrypt.compare(
            oldPassword,
            req.user.password
        );

        if (!correctPassword) {
            return res.status(401).json({
                success: false,
                message: "Incorrect old password"
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        req.user.password = hashedPassword;
        await req.user.save();

        return res.status(200).json({
            success: true,
            message: "Password changed successfully"
        });

    } catch (err) {
        console.log(err);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};