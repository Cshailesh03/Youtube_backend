import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"


const generateAccessandRefreshToken = async(userId) =>{

    const AccessToken = user.generateAccessToken()
    const RefreshToken = user.generateRefreshToken()

    user.refreshToken = RefreshToken
    await user.save({ validateBeforeSave : false})
    
    return {AccessToken ,RefreshToken} 
}

const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend
    // validate --not empty
    // check if user already present ,, email ,, username
    // check for images , avatar
    // chck upload on cloudinary , avatar
    // create user object -- create entry in db
    // remove password , refresh token during response
    // check user is created or not
    // return res

    const { username, email, fullname, password } = req.body
    // console.log("email :", email);

    if (
        [username, email, fullname, password].some((field) =>
            field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverimageLocalPath = await req.files?.coverimage[0]?.path;

    let coverimageLocalPath;
    if (req.files && Array.isArray(req.files.coverimage) && req.files.coverimage.length > 0) {
        coverimageLocalPath = req.files.coverimage[0].path
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar files is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverimage = await uploadOnCloudinary(coverimageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }

    User.create({
        fullname,
        email,
        password,
        username: username.toLowerCase(),
        avatar: avatar.url,
        coverimage: coverimage?.url || " "
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if (!createdUser) {
        throw new ApiError(500, "something went wrong while registering user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "user registered successfully")
    )
})

const loginUser = asyncHandler (async (req,res)=>{
    
    const {email,username , password } = req.body 
    if (!username || !email) {
        throw new ApiError (400,"username and password required")
    }
   const user =   User.findOne({
        $or : [{username},{email}]
    })

    if(!user){
        throw new ApiError(404,"User does not exist")
    }

   const isPasswordvalid = await user.isPasswordCorrect(password)

   if(!isPasswordvalid){
    throw new ApiError(404,"Password is wrong")
}

const {AccessToken , RefreshToken} = await generateAccessandRefreshToken(user._id)

const loggedInUser = await User.findById(user._id).select(" -password -refreshToken")

const Options = {
    httpOnly : true,
    secure : true
}

return res
.status(200)
.cookie("accessToken",AccessToken , Options)
.cookie("refreshToken",RefreshToken , Options)
.json(
    new ApiResponse(
        200,
        {
            user: loggedInUser, AccessToken,RefreshToken
        },
        "user is logged in successfully"
    )
)
})

const logoutUser = asyncHandler ( async (req,res) =>{
    
})

export {
    registerUser,
    loginUser,
}