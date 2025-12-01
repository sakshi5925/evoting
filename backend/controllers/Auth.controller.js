import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const registerUser = async (req, res) => {
    try {
        const { name, walletAddress, AdhaarNumber, DOB} = req.body;


        const existingUser = await User.findOne({
            $or: [
                { walletAddress },
                { AdhaarNumber }
            ]
        });

        if (existingUser) {
            return res.status(400).json({ message: "User with this wallet address or AdhaarNumber already exists" });
        }


        const saltRounds = 10;
        const Adharhash = await bcrypt.hash(AdhaarNumber, saltRounds);

        const newUser = new User({
            name,
            walletAddress,
            AdhaarNumber: Adharhash,
            DOB,
        });

        await newUser.save();

        return res.status(201).json({ message: "User registered successfully" });
    }
    catch (error) {
        console.error("Error registering user:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}



export const loginUser = async (req, res) => {
    try {
        const { walletAddress, AdhaarNumber } = req.body;
        const user = await User.findOne({ walletAddress });
        if (!user) return res.status(404).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(AdhaarNumber, user.AdhaarNumber);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign(
            {
                id: user._id,
                walletAddress: user.walletAddress,
            },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        return res.status(200).json({ token: token, name: user.name, role: user.role, walletAddress: walletAddress,DOB: user.DOB });

    }
    catch (error) {
        console.error("Error logging in user:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

