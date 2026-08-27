import User from "../models/customer.model.js"
import bcrypt from 'bcrypt'
import genToken from '../utils/generateToken.js'

const cookieOptions = {
    httpOnly: true
}

export const registerUser = async(req, res) => {
    const {name, username, email, password} = req.body

    try{
        if(!username || !name || !password || !email){
            return res.status(422).json({message: 'All fields required'})
        }
        const user = await User.findOne({username})
        if(user){
            return res.status(400).json({message: 'username already exists'})
        }
        const emailExists = await User.findOne({email});
        if(emailExists){
            return res.status(400).json({message: 'email already exists'})
        }
        if(password.length < 6){
            return res.status(400).json({message: 'password length should be greater than or Equal to 6'})
        }
        const salt = await bcrypt.genSalt(10);

        const hashedPassword = bcrypt.hashSync(password, 10);
        const newUser = await User.create({username, name, password: hashedPassword, email})

        // JWT
        const token = genToken(newUser._id)
        res.cookie('token', token, cookieOptions)

        res.status(201).json(newUser)
    }catch{
        res.status(500).json({message: 'Internal Server Error'})
    }
}

export const loginUser = async(req, res) => {
    try{
        const {email, password} = req.body
        if(!email || !password){
            return res.status(422).json({message: 'All fields required'})
        }

        const userExists = await User.findOne({email})
        if(!userExists){
            return res.status(404).json({message: 'User not found'})
        }

        const correctPassword = bcrypt.compareSync(password, userExists.password);
        if(!correctPassword){
            return res.status(401).json({message: 'User not found'})
        }

        const tokenn = genToken(userExists._id)
        res.cookie('token', token, cookieOptions)

        res.status(200).json({message: 'Login Successful', user: userExists})
    }catch(err){
        return res.status(500).json({message: 'Internal Server Error'})
    }
}

export const getUser = (req, res) =>{
    res.status(200).json(req.user)
}