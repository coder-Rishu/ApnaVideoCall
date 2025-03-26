import User from '../models/user.js';
import Meeting from '../models/meeting.js';
import httpStatus from 'http-status';
import bcrypt, {hash} from 'bcrypt';
import crypto from 'crypto';

const login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) return res.status(400).json({message: 'Username and password are required'});

    try{
        const user = await User.findOne({ username });
        if(!user) return res.status(httpStatus.NOT_FOUND).json({message: 'User not found'});

        let isPasswordValid = await bcrypt.compare(password, user.password);

        if(isPasswordValid) {
            let token = crypto.randomBytes(20).toString('hex');
            user.token = token;
            await user.save();
            return res.status(httpStatus.OK).json({message: 'User logged in successfully', token: token});
        } else {
            return res.status(httpStatus.UNAUTHORIZED).json({message: 'Invalid credentials'});
        }
    } catch(err){
        return res.status(500).json({message: `Something went wrong ${err}`});
    }
}        

const register = async (req, res) => {
    const { name, username, password } = req.body;
    
    let existingUser = await User.findOne({ username });
    if(existingUser) {
        return res.status(httpStatus.FOUND).json({message: 'User already exists'});
    } else {
        try{
            const hashedPassword = await bcrypt.hash(password, 10);

            const newUser = new User({
                name: name,
                username: username,
                password: hashedPassword
            });

            await newUser.save();
            return res.status(httpStatus.CREATED).json({message: 'User registered successfully'});
        } catch(err){
            return res.json({message: `Something went wrong: ${err}`});
        }
    }
}

const getUserHistory = async (req, res) => {
    const {token} = req.query;
    try {
        const user = await User.findOne({ token });
        const meetings = await Meeting.find({ userId: user.username });
        res.json(meetings);
    }catch(err){
        res.json({message: `Something went wrong: ${err}`});
    }

};

const addToHistory = async (req, res) => {
    const {token, meetingId} = req.query;
    try {
        const user = await User.findOne({ token: token });
        const newMeeting = await Meeting({userId: user.username, meetingId: meetingId});
        await newMeeting.save();
        res.status(httpStatus.CREATED).json({message: 'Meeting added to history'});
    } catch(err){
        res.json({message: `Something went wrong: ${err}`});
    }
};

export {login, register, addToHistory, getUserHistory};