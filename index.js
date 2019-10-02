const rp = require('request-promise');
const $ = require('cheerio');

const Discord = require('discord.js');
const { prefix, token } = require('./config.json');

const client = new Discord.Client();

client.once('ready', () => {
    console.log('Palico Ready!');
});

const itemList = new Map();

client.on('message', message => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;

    // Slice prefix out, normalize whitespace then split
    const args = message.content.slice(prefix.length).split(/ +/);

    // (!) shift() removes first array element and returns it
	const command = args.shift().toLowerCase();

	if (command === 'ping') {
		message.channel.send('Pong.');
    }
    else if (command === 'beep') {
        message.channel.send('Bop.');
    }
    else if (command === 'chad') {
        message.channel.send('¯\\_(ツ)_/¯ (trademark pending)');
    }
	else if (command === 'item') {
		if (!args.length) {
			return message.channel.send(`Usage: \`${prefix}item item-name \``);
        }

        const userInput = args.join(' ').toLowerCase();

        console.log(`Someone is looking for item: ${userInput}`);

        if (!itemList.has(userInput)) {
            return message.channel.send('Sorry, I don\'t know that item...');
        }
        else {
            const item = itemList.get(userInput);

            const itemEmbed = new Discord.RichEmbed()
                .setColor('#8fde5d')
                .setTitle(item.name)
                .setURL(item.url)
                .setDescription('Endemic Life')
                .addField('Description', 'Hehe', true)
                .addField('Locations', 'Coming soon')
                .setTimestamp()
                .setFooter('Item Menu');

              message.channel.send(itemEmbed);
        }

	}
	// other commands...
});

async function fetchItems() {

    const url = 'https://mhworld.kiranico.com/items';

    itemList.clear();
    console.log(`Fetching items from ${url}...`);

    // eslint-disable-next-line no-unused-vars
    const promise = await rp(url)
        .then(function(html) {
            $('span.d-none.d-xl-inline-block > a', html).each(function() {
                const itemName = $(this).text();
                const itemUrl = $(this).attr('href');

                // Store scraped item in map,
                // using lowercase name as key and item (formatted name + url) as value
                itemList.set(itemName.toLowerCase(), { 'name': itemName, 'url': itemUrl });
            });
        })
        .catch(function(err) {
            console.error('ERROR - Shit happened -> ', err);
        });
    console.log(`Done fetching items. Count: ${itemList.size}`);
}

// Fetch all items before starting the bot (login)
Promise.all([fetchItems()])
    .then(function() {
        console.log('Logging in...');
        client.login(token);
}).catch(function(err) {
    console.error('Error fetching the items from the wiki. Items will be unavailable. Starting anyway. ', err);
    client.login(token);
});
