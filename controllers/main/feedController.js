const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const rssParser = require('rss-parser');


const parser = new rssParser();

const User = require('../../models/userSchema');
const Feed = require('../../models/feedSchema');

parseFeeds = async (feeds) => {
	return await feeds.map(async (feed, fi) => {
		const parsedFeed = await parser.parseURL(feed.url);
		const newItems = await parsedFeed.items.map(async (item, ii) => {
			const newItem = await {
				'feedTitle': feed.title,
				'parsedFeedTitle': parsedFeed.title,
				'creator': item.creator,
				'title': item.title,
				'link': item.link,
				'pubDate': item.pubDate,
				'content': item.content,
				'contentSnippet': item.contentSnippet,
				'guid': item.guid,
				'isoDate': item.isoDate
			};
			return newItem;
		});
		return newItems;
	});
};

parseContent = (content) => {
	
	content = fixEncoding(content);

	// change img sources to local converter
	while (content.indexOf('src="http') != -1) {
		for (let i = 0; i < content.length; i++) {
			if (content.substring(i, i + 9) == 'src="http') {
				let url = '';
				for (let j = i + 5; j < content.length; j++) {
					if (content[j] == '"') {
						url = content.substring(i + 5, j);
						console.log(url);
						const newUrl = url.replace(/\//g, '%2F');
						console.log(newUrl);
						content = content.replace('<img src="' + url + '"/>',
							'<a href="/shims/img/orig/' + newUrl + '"><img src="/shims/img/small/' + newUrl + '"></a>');
						content = content.replace('<img src="' + url + '">',
							'<a href="/shims/img/orig/' + newUrl + '"><img src="/shims/img/small/' + newUrl + '"/></a>');
						content = content.replace('src="' + url + '"',
							'src="/shims/img/small/' + newUrl + '"');
						break;
					}
				}
			}
		}
	}
	return content;
};

fixEncoding = (str) => {
	str = str.replace(/“/g, '"');
	str = str.replace(/”/g, '"');
	str = str.replace(/‘/g, '\'');
	str = str.replace(/’/g, '\'');

	return str;
}

router.get('/', (req, res) => {
	console.log('GET /feeds');
	res.redirect('/feeds/page/0');
});

router.get('/page/:index', (req, res) => {
	console.log(`GET /feeds/page/${req.params.index}`);
	if (!req.session.curuserid || req.session.curuserid == '') {res.send('You are not logged in! <a href="/">Back to home</a>');}
	Feed.find({userId: req.session.curuserid}, async (err, foundFeeds) => {
		if (err) {
			console.log(err);
			res.send(err);
		}

		const items = [];

		// parseFeeds(foundFeeds).then((result) => {
		// 	console.log('parsedFeeds: ', result);
		// });

		const parsedFeeds = await parseFeeds(foundFeeds);

		Promise.all(parsedFeeds).then((values) => {
			const moreStuff = [];
			values.forEach((value) => {
				value.forEach((thing) => {
					moreStuff.push(thing);
				});
			});
			Promise.all(moreStuff).then((items) => {

				//HERE
				//HERE IS WHERE IT IS
				//FINALLY
				//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
				//I HATE JS ASYNC

				items.sort((a, b) => (a.isoDate < b.isoDate) ? 1 : -1);

				items.forEach((item) => {
					item.content = parseContent(item.content);
					item.title = fixEncoding(item.title);
					// console.log(item.content);
				});

				const pageSize = 10;

				const page = req.params.index

				if (page < 0)
				{
					res.send('Har har. Nice try.');
				}
				else
				{
					
					const pageNum = Math.ceil(items.length / pageSize);

					let start = page * pageSize;
					if (start > items.length) {start = Math.floor(items.length / pageSize)*pageSize;}

					let end = start + pageSize - 1;
					if (end > items.length - 1) {end = items.length - 1;}

					// console.log('Start: ', start);
					// console.log('End: ', end);

					res.render(req.viewdir + '/feed/index.ejs', {items: items, start: start, end: end, pageNum: pageNum, currentPage: req.params.index});
				}


			});
		});

		// console.log(parsedFeeds);

		

		// const sortedItems = await items.sort((a, b) => (a.isoDate > b.isoDate) ? 1 : -1)

		// console.log(await sortedItems);

		// console.log(items);
		// OK so now we have all the items
		// and we need to figure out which "slice" of them we
		// will be delivering to the ejs for a certain page number.

		
	});
});

router.get('/new', (req, res) => {
	console.log('GET /feeds/new');
	if (!req.session.curuserid || req.session.curuserid == '') {res.send('You are not logged in! <a href="/">Back to home</a>');}
	res.render(req.viewdir + '/feed/new.ejs');
});

router.post('/', (req, res) => {
	console.log('POST /feeds');
	if (!req.session.curuserid || req.session.curuserid == '') {res.send('You are not logged in! <a href="/">Back to home</a>');}
	if (!req.body.url || req.body.url == '') {res.send('Invalid URL');}

	const newFeed = {
		userId: req.session.curuserid,
		title: req.body.title,
		url: req.body.url
	};

	Feed.create(newFeed, (err, createdFeed) => {
		if (err) {
			console.log(err);
			res.send(err);
		}
		res.redirect('/feeds/manage');
	});
});

router.get('/manage', (req, res) => {
	console.log('GET /feeds/manage');
	if (!req.session.curuserid || req.session.curuserid == '') {res.send('You are not logged in! <a href="/">Back to home</a>');}
	Feed.find({userId: req.session.curuserid}, (err, foundFeeds) => {
		if (err) {
			console.log(err);
			res.send(err);
		}
		res.render(req.viewdir + '/feed/manage.ejs', {feeds: foundFeeds});
	});
});

router.delete('/:id', (req, res) => {
	console.log(`DELETE /feeds/${req.params.id}`);
	if (!req.session.curuserid || req.session.curuserid == '') {res.send('You are not logged in! <a href="/">Back to home</a>');}
	Feed.findByIdAndDelete(req.params.id, (err, deletedFeed) => {
		if (err) {
			console.log(err);
			res.send(err);
		}
		res.redirect('/feeds/manage');
	});
});

module.exports = router;