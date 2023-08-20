import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

// ...

export default async function confirmEmail(user) {
	let token = await encodeRegistrationToken(user._id);
	console.log(token);
	sendMail(user, token);
}

function encodeRegistrationToken(id) {
	// The information we need to find our user in the database (not sensible info)
	console.log(id.toString());
	// The hash we will be sending to the user
	return new Promise((resolve, reject) => {
		jwt.sign(
			{ id: id.toString() },
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

Please verify your account by clicking the link:
<a href="${process.env.APP_LINK}/auth/confirmation/${token}"> Confirmation Link </a>

Thank You!`;

	// Example email configuration
	const mailOptions = {
		from: process.env.SMTP_EMAIL,
		to: user.local.email,
		subject: "Account Verification Link",
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
