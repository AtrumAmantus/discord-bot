// Dependencies
const app = require("./../app.js");

const Discord = app.Discord;

// Database Models
const User = require("./../models/User.js");
const UserProfile = require("./../models/UserProfile.js");

// Set the command's properties
const properties = {
	command: "profile",
	description: "Get a user's profile.",
	prefix: true,
	arguments: ["[id|username]"],
	visible: true,
	botchat: true
};

// The code that runs when the command is executed.
function run(message, args) {
	const guild = message.guild;
	let userId;

	if (typeof args[1] == "undefined") {
		userId = message.author.id;
	} else {
		// Checks if the argument only contains letters.
		if (/^[a-zA-Z]+$/.test(args[1])) {
			const guildMember = guild.members.find((member) => {
				return member.displayName == args[1];
			});

			userId = guildMember == null ? null : guildMember.id;
		} else {
			userId = args[1];
		}
	}

	const guildMember = guild.members.find((member) => {
		return member.id == userId;
	});

	if (guildMember) {
		User.findAll({
			where: {
				discordId: guildMember.id
			}
		}).then((users) => {
			let userDatabaseId;

			if (users.length == 0) {
				const embed = new Discord.RichEmbed();

				embed.setTitle("Error");
				embed.setDescription("We could not find that user in the users database. Creating their record.");

				message.channel.send({embed}).then((message) => {
					message.delete(2500);
				});

				User.create({
					discordId: guildMember.id
				}).then((user) => {
					const embed = new Discord.RichEmbed();

					embed.setTitle("Success");
					embed.setDescription("Created the user's record in the database.");

					message.channel.send({embed}).then((message) => {
						message.delete(2500);
					});

					userDatabaseId = user.id;
				});
			} else {
				userDatabaseId = users[0].id;
			}

			UserProfile.findAll({
				where: {
					userId: userDatabaseId
				}
			}).then((users) => {
				let userProfile;

				if (users.length == 0) {
					const embed = new Discord.RichEmbed();

					embed.setTitle("Error");
					embed.setDescription("We could not find that user in the user profile database. Creating their record.");

					message.channel.send({embed}).then((message) => {
						message.delete(2500);
					});

					UserProfile.create({
						userId: userDatabaseId
					}).then((user) => {
						const embed = new Discord.RichEmbed();

						embed.setTitle("Success");
						embed.setDescription("Created the user's record in the database.");

						message.channel.send({embed}).then((message) => {
							message.delete(2500);
						});

						userProfile = user;
					});
				} else {
					userProfile = users[0];
				}

				const waitForProfileCreation = setInterval(() => {
					if (userProfile) {
						const embed = new Discord.RichEmbed();

						embed.setTitle(`${userDatabaseId}'s Profile`);
						embed.setDescription(`${userProfile.bio ? userProfile.bio : "Not Defined"}`);
						embed.addField("Git", `${userProfile.git ? userProfile.git : "Not Defined"}`);
						embed.addField("Country", `${userProfile.country ? userProfile.country : "Not Defined"}`);

						message.channel.send({embed});

						clearInterval(waitForProfileCreation);
					}
				}, 1000);
			});
		});
	} else {
		const embed = new Discord.RichEmbed();

		embed.setTitle("Error");
		embed.setDescription("We could not find that user in the CodeSupport Discord.");

		message.channel.send({embed});
	}
}

// Export the data to the command handler
exports.properties = properties;
exports.run = run;
