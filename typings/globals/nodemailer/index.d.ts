// Generated by typings
// Source: https://raw.githubusercontent.com/DefinitelyTyped/DefinitelyTyped/56295f5058cac7ae458540423c50ac2dcf9fc711/nodemailer/nodemailer.d.ts

declare module "nodemailer" {


	export type Transport = any;
	export type SendMailOptions = any;
	export type SentMessageInfo = any;

	/**
	 * Transporter plugin
	 */
	export interface Plugin {
		(mail: SendMailOptions, callback?: (error: Error, info: SentMessageInfo) => void): void;
	}

	/**
	 * This is what you use to send mail
	 */
	export interface Transporter {
		/**
		 * Send a mail
		 */
		sendMail(mail: SendMailOptions, callback?: (error: Error, info: SentMessageInfo) => void): void;

		/**
		 * Attach a plugin. 'compile' and 'stream' plugins can be attached with use(plugin) method
		 *
		 * @param step is a string, either 'compile' or 'stream' thatd defines when the plugin should be hooked
		 * @param pluginFunc is a function that takes two arguments: the mail object and a callback function
		 */
		use(step: string, plugin: Plugin): void;


		/**
		 * Close all connections
		 */
		close?(): void;
	}

	/**
	 * Create a direct transporter
	 */
	export function createTransport(options?: any, defaults?: Object): Transporter;
	/**
	 * Create an SMTP transporter
	 */
	export function createTransport(options?: any, defaults?: Object): Transporter;
	/**
	 * Create a transporter from a given implementation
	 */
	export function createTransport(transport: Transport, defaults?: Object): Transporter;
}
