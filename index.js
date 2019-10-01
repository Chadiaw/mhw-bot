const cheerio = require('cheerio');
const jsonframe = require('jsonframe-cheerio');
const got = require('got');

const Discord = require('discord.js');
const { prefix, token } = require('./config.json');

const client = new Discord.Client();

client.once('ready', () => {
	console.log('Palico Ready!');
});


async function fetchPages() {
    /** Function to parse initial wiki page and grab list of items */
    const url = 'https://mhworld.kiranico.com/items'
    const html = await got(url)
    const $ = cheerio.load(html.body)

    jsonframe($);
    const frame = {
        'items': {
            'selector': 'element-box-tp',
            'data': [{
                'name': 'd-none d-xl-inline-block > a',
                'link': 'd-none d-xl-inline-block > a @ href',
            }],
        },
    };

    const itemList = $('.element-box-tp').scrape(frame);

    console.log(itemList);

    return itemList;
}

const pages = fetchPages();

client.on('message', message => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).split(/ +/);
	const command = args.shift().toLowerCase();

	if (command === 'ping') {
		message.channel.send('Pong.');
	}
	else if (command === 'items') {
		if (!args.length) {
			return message.channel.send('You need to type the item name.');
        }

        const userInput = args.join(' ');

        if (!(userInput in pages)) {
            return message.channel.send('I don\'t know that item...');
        }
        else {
            const item = pages[userInput];

            const itemEmbed = new Discord.RichEmbed()
                .setColor('#8fde5d')
                .setTitle(item.title)
                .setURL(item.url)
                .setDescription('Endemic Life')
                .addField('Description', item.description, true)
                .addField('Locations', item.locations)
                .setTimestamp()
                .setFooter('Info Menu');

              message.channel.send(itemEmbed);
        }

	}
	// other commands...
});

client.login(token);