import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

// ...

export default async function resetPasswordEmail(user) {
	let token = await encodeToken(user._id.toString());
	console.log(token);
	sendMail(user, token);
}

function encodeToken(id) {
	// The information we need to find our user in the database (not sensible info)

	// The hash we will be sending to the user
	return new Promise((resolve, reject) => {
		jwt.sign(
			{ id: id },
			process.env.JWT_SECRET_KEY,
			{
				expiresIn:
					process.env.EMAIL_CONFIRMATION_TOKEN_EXPIRATION_TIME,
			},
			(err, token) => {
				if (err) {
					reject(err);
				} else {
					resolve(token);
				}
			}
		);
	});
}

function sendMail(user, token) {
	console.log(user);
	// Create a transporter using the Gmail service and your credentials
	const transporter = nodemailer.createTransport({
		host: process.env.SMTP_SERVICE,
		port: process.env.SMTP_PORT,
		auth: {
			user: process.env.SMTP_EMAIL,
			pass: process.env.SMTP_PASSWORD,
		},
	});

	const emailText = `Hello ${user.local.name},

Go to this link to reset your password:
<a href="${process.env.APP_LINK}/auth/reset-password/${token}"> Reset Password </a>

Thank You!`;

	// Example email configuration
	const mailOptions = {
		from: process.env.SMTP_EMAIL,
		to: user.local.email,
		subject: "Reset Password",
		text: emailText,
		html: emailText,
	};

	// Send the email
	transporter
		.sendMail(mailOptions)
		.then((info) => {
			console.log("Email sent:", info.response);
		})
		.catch((error) => {
			console.error("Error sending email:", error);
		});
}
