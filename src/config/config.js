import Joi from "joi";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, "../../.env") });

const envVarsSchema = Joi.object({
	NODE_ENV: Joi.string()
		.valid("production", "development", "test")
		.required(),
	PORT: Joi.number().default(3000),
	MONGO_URL: Joi.string().required().description("Mongo DB url"),
	JWT_SECRET_KEY: Joi.string().required().description("JWT secret key"),
	TOKEN_EXPIRATION_TIME: Joi.string()
		.default("240h")
		.description("Token expiration time"),
	EMAIL_CONFIRMATION_TOKEN_EXPIRATION_TIME: Joi.string()
		.default("1h")
		.description("Email confirmation token expiration time"),
	FACEBOOK_APP_ID: Joi.string().description("Facebook App ID"),
	FACEBOOK_APP_SECRET: Joi.string().description("Facebook App Secret"),
	FACEBOOK_CALL_BACK_URL: Joi.string()
		.uri()
		.description("Facebook callback URL"),
	GOOGLE_CLIENT_ID: Joi.string().description("Google Client ID"),
	GOOGLE_CLIENT_SECRET: Joi.string().description("Google Client Secret"),
	GOOGLE_CALL_BACK_URL: Joi.string()
		.uri()
		.description("Google callback URL"),
	APP_LINK: Joi.string().uri().description("Application link"),
	SMTP_SERVICE: Joi.string().description("SMTP service"),
	SMTP_PORT: Joi.number().description("port to connect to the email server"),
	SMTP_EMAIL: Joi.string().description("email for email server"),
	SMTP_PASSWORD: Joi.string().description("password for email server"),
	// JWT_ACCESS_EXPIRATION_MINUTES: Joi.number()
	// 	.default(30)
	// 	.description("minutes after which access tokens expire"),
	// JWT_REFRESH_EXPIRATION_DAYS: Joi.number()
	// 	.default(30)
	// 	.description("days after which refresh tokens expire"),
	// JWT_RESET_PASSWORD_EXPIRATION_MINUTES: Joi.number()
	// 	.default(10)
	// 	.description("minutes after which reset password token expires"),
	// JWT_VERIFY_EMAIL_EXPIRATION_MINUTES: Joi.number()
	// 	.default(10)
	// 	.description("minutes after which verify email token expires"),
	// SMTP_HOST: Joi.string().description("server that will send the emails"),

	// EMAIL_FROM: Joi.string().description(
	// 	"the from field in the emails sent by the app"
	// ),
}).unknown();

const { value: envVars, error } = envVarsSchema
	.prefs({ errors: { label: "key" } })
	.validate(process.env);

if (error) {
	throw new Error(`Config validation error: ${error.message}`);
}

const config = {
	env: envVars.NODE_ENV,
	port: envVars.PORT,
	mongoose: {
		url: envVars.MONGO_URL + (envVars.NODE_ENV === "test" ? "-test" : ""),
		options: {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		},
	},
	jwt: {
		secret: envVars.JWT_SECRET_KEY,
		tokenExpirationTime: envVars.TOKEN_EXPIRATION_TIME,
		emailConfirmationTokenExpirationTime:
			envVars.EMAIL_CONFIRMATION_TOKEN_EXPIRATION_TIME,
	},
	facebook: {
		appId: envVars.FACEBOOK_APP_ID,
		appSecret: envVars.FACEBOOK_APP_SECRET,
		callBackURL: envVars.FACEBOOK_CALL_BACK_URL,
	},
	google: {
		clientId: envVars.GOOGLE_CLIENT_ID,
		clientSecret: envVars.GOOGLE_CLIENT_SECRET,
		callBackURL: envVars.GOOGLE_CALL_BACK_URL,
	},
	appLink: envVars.APP_LINK,
	smtp: {
		service: envVars.SMTP_SERVICE,
		port: envVars.SMTP_PORT,
		email: envVars.SMTP_EMAIL,
		password: envVars.SMTP_PASSWORD,
	},
};
console.log(config);

export default config;
