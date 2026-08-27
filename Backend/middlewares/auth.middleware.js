import jwt from 'jsonwebtoken'
import User from '../models/customer.model.js'

const isAuthenticated = async(req, res, next) => {
    try{
        const token = req.cookies.token

        if(!token){
            res.status(404).json({message: 'No token found'})
        }
        const decoded = jwt.verify(token,process.env.jwt_secret)
        const user = await User.findById(decoded.userId)

        if(!user){
            res.status(404).json({message: 'User not found'})
        }
        req.user = user
        next()
    }catch(err){
        return res.status(500).json({message: 'Internal Server Error'})
    }
}

export default isAuthenticated