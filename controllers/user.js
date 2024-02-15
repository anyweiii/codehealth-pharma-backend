// [SECTION] Dependencies and Modules
// The "User" variable is defined using a capitalized letter to indicate that we are using its user model for code readability.
const User = require("../models/User");
const Order = require ("../models/Order");
const Cart = require ("../models/Cart");
const bcrypt = require('bcrypt');
const auth = require("../middlewares/auth");

// [USER REGISTRATION - NORMAL USER - HUI ANGELES]
module.exports.registerUser = async (req, res) => {
  try {
    const { firstName, lastName, address, mobileNo, email, password } = req.body;

    if (!firstName || !lastName || !mobileNo || !address || !email || !password) {
        const missingFields = [];
        if (!firstName) missingFields.push('firstName');
        if (!lastName) missingFields.push('lastName');
        if (!mobileNo) missingFields.push('mobileNo');
        if (!address) missingFields.push('address'); // address field added by hui angeles 01/29
        if (!email) missingFields.push('email');
        if (!password) missingFields.push('password');

        return res.status(400).json({
            error: `Please fill in all user details. Missing fields: ${missingFields.join(', ')}.`
        });
    }

    if (mobileNo.length !== 11) {
      return res.status(400).json({ error: "Mobile number must be 11 characters long" });
    }

    if (!email.includes('@')) {
      return res.status(400).json({ error: "Please provide a valid email address" });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters long" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email is already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      firstName,
      lastName,
      mobileNo,
      address, // address field added by hui angeles 01/29
      email,
      password: hashedPassword
    });

    const savedUser = await newUser.save();
    res.status(201).json({ message: "User registration successful!", data: savedUser });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Registration failed. Please try again." });
  }
};

// [USER REGISTRATION - ADMIN - HUI ANGELES]
module.exports.registerAdmin = async (req, res) => {
	try {
	   const { firstName, lastName, mobileNo, email, password } = req.body;

	   const isAdmin = true;

	   if (!firstName || !lastName || !mobileNo || !email || !password) {
		   const missingFields = [];
		   if (!firstName) missingFields.push('firstName');
		   if (!lastName) missingFields.push('lastName');
		   if (!mobileNo) missingFields.push('mobileNo');
		   if (!email) missingFields.push('email');
		   if (!password) missingFields.push('password');

		   return res.status(400).json({
			   error: `Please fill in all admin details. Missing fields: ${missingFields.join(', ')}.`
		   });
	   }

	   if (mobileNo.length !== 11) {
		 return res.status(400).json({ error: 'Mobile number must be 11 characters long' });
	   }

	   if (!email.includes('@')) {
		 return res.status(400).json({ error: 'Please provide a valid email address' });
	   }

	   if (password.length < 8) {
		 return res.status(400).json({ error: 'Password must be at least 8 characters long' });
	   }

	   // Check if the email is already registered
	   const existingUser = await User.findOne({ email });

	   if (existingUser) {
		 return res.status(400).json({ error: 'Email is already registered' });
	   }

	   // Hash the password before saving it to the database
	   const hashedPassword = await bcrypt.hash(password, 10);

	   const newUser = new User({
		 firstName,
		 lastName,
		 email,
		 mobileNo,
		 password: hashedPassword,
		 isAdmin
	   });

	   const savedUser = await newUser.save();

	   res.status(201).json({ message: 'Admin registration successful!', data: savedUser });
	 } catch (error) {
	   console.error(error);
	   res.status(500).json({ error: 'Admin registration failed. Please try again.' });
   }
};

// [USER AUTHENTICATION - HUI ANGELES]
module.exports.loginUser = async (req, res) => {
	try {
		const {email, password} = req.body;
		if (!email || !password) {
	      	return res.status(400).json({ error: 'Both email and password are required to login' });
	    }

	    if (!email.includes('@')) {
	      return res.status(400).json({ error: 'Invalid email format' });
	    }

		const user = await User.findOne({email});
		if (!user) {
			return res.status(404).json({ error: 'You are not registered! Please register your account.' });
		}

		// Password Validation
		const isPasswordCorrect = bcrypt.compareSync(password, user.password);
			if (isPasswordCorrect) {
		      const accessToken = auth.createAccessToken(user);
		      return res.status(200).json({ message: "Successfully logged in!", access: accessToken });
		    } else {
		      return res.status(401).json({ error: 'Email and password do not match!' });
		    }
	} catch (error) {
		return res.status(500).json({ error: 'Error while logging in. Please try again.' });
	}
};

// [RETRIEVE USER DETAILS - FROILAN OLIQUIANO]
module.exports.getProfile = async (req, res) => {
  try {
      const result = await User.findById(req.user.id);

      if (!result) {
          return res.json({ error: "User not found." });
      }
      result.password = "******";

      return res.status(200).json({message: "Here are your details!" , userDetails: result});
  } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "There is an error fetching your profile." });
  }
};

// [RETRIEVE ALL USERS - HUI ANGELES]
module.exports.getAllUsers = async (req, res) => {
	try {
		// Check if the authenticated user is an admin
		if (!req.user.isAdmin) {
			return res.status(403).json({ error: "Unauthorized access." });
		}
  
		// Retrieve all users from the database
		const users = await User.find();
  
		// Mask passwords for all users
		users.forEach(user => {
			user.password = "******";
		});
  
		return res.status(200).json({message: "Here are all users." , users: users});
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: "There is an error fetching users." });
	}
};

// [UPDATE USER AS ADMIN - ADMIN ONLY - FROILAN OLIQUIANO]
module.exports.adminUpdate = async (req, res) => {
	try {
		const {userId} = req.params;
		if (!userId) {
			return res.status(400).json({ error: "User ID not found, please correct the ID." })
		}

		// Updating User as Admin
		const updateUser = await User.findByIdAndUpdate(userId, {isAdmin: true}, {new: true});
		res.status(200).json({message: "User is successfully updated as admin!", updatedUser: updateUser});
	} catch (error) {
		res.status(500).json({ message: "There is an error on the server, failed to update as admin" });
	}
}

// [UNSET USER AS ADMIN - ADMIN ONLY - HUI ANGELES]
module.exports.unsetAdmin = async (req, res) => {
    try {
        const { userId } = req.params;

        // Check if the user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Check if the user is already not an admin
        if (!user.isAdmin) {
            return res.status(400).json({ error: "User is already not an admin" });
        }

        // Unset the user as admin
        user.isAdmin = false;
        await user.save();

        res.status(200).json({ message: "User is successfully unset as admin", updatedUser: user });
    } catch (error) {
        console.error("Error unsetting user as admin:", error);
        res.status(500).json({ message: "Failed to unset user as admin" });
    }
};

// [UPDATE PASSWORD - FROILAN OLIQUIANO]
module.exports.updatePassword = async (req, res) => {
	try {
		const {newPassword} = req.body;
		const {id} = req.user;

		// Hash / Encrypt the new password
		const hashedPassword = await bcrypt.hash(newPassword, 10);
		await User.findByIdAndUpdate(id, {password: hashedPassword});

		res.status(200).json({ message: "Password reset successful!" });
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: "Internal Server Error" });
	}
}

// [FORGET PASSWORD - HUI ANGELES]
module.exports.forgetPassword = async (req, res) => {
    const { email, newPassword, confirmPassword } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ error: "Passwords do not match." });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({ error: "Password must be at least 8 characters long." });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await User.findByIdAndUpdate(user._id, { password: hashedPassword });

        return res.status(200).json({ message: "Password reset successfully." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

// [UPDATE USER PROFILE - HUI ANGELES]
module.exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { firstName, lastName, email, mobileNo, address } = req.body;
        let updateFields = {};

        if (req.user.isAdmin) {
            updateFields = { firstName, lastName, email, mobileNo };
        } else {
            updateFields = { firstName, lastName, email, mobileNo, address };
        }

        const updateUser = await User.findByIdAndUpdate(userId, updateFields, { new: true });

        if (!updateUser) {
            return res.status(404).send({ message: "User not found." });
        }

        res.status(200).send(updateUser);
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).send({ message: "Failed to update profile." });
    }
};
