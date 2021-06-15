const NodeID3 = require('node-id3');
const mp3Duration = require('mp3-duration');
const recursive = require('recursive-readdir');
const dateFormat = require("dateformat");
const fs = require('fs');
const crypto = require('crypto')

const md5hex = (str) => {
	const md5 = crypto.createHash('md5')
	return md5.update(str, 'binary').digest('hex')
  }

const audiofiles = () => {
  return new Promise((resolve, reject) => {
	  recursive("docs/audio", [], (err, files) => {
		  if(err) {
			  reject(err);
		  } else {
			  resolve(files);
		  }
	  });
  });
};

const getDuration = (file) => {
	return new Promise((resolve, reject) => {
		mp3Duration(file, (err, duration) => {
			if(err) {
				reject(err);
			} else {
				resolve(duration);
			}
		});
	});
};

const getTag = (file) => {
	return new Promise((resolve, reject) => {
		NodeID3.read(file, function(err, tags) {
			if(err) {
				reject(err)
			} else {
				resolve(tags);
			}
		});
	});
};

const writeXML = (config, articles, print) => {

	const categories = [];

	print("<?xml version=\"1.0\" encoding=\"UTF-8\"?>");
	print("<rss xmlns:itunes=\"http://www.itunes.com/dtds/podcast-1.0.dtd\" version=\"2.0\">");
	print("<channel>");
	print("    <title>"+config.title+"</title>");
	print("    <link>"+config.link+"</link>");
	print("    <language>"+config.locale+"</language>");
	print("    <copyright>"+config.copyright+"</copyright>");
	print("");
	print("    <itunes:subtitle>"+config.subtitle+"</itunes:subtitle>");
	print("    <itunes:author>"+config.author+"</itunes:author>");
	print("    <itunes:summary>"+config.summary+"</itunes:summary>");
	print("    <description>"+config.description+"</description>");
	print("    <itunes:owner>");
	print("        <itunes:name>"+config.author+"</itunes:name>");
	print("        <itunes:email>"+config.email+"</itunes:email>");
	print("    </itunes:owner>");
	print("");
	print("    <itunes:image href=\""+config.image+"\" />");

	categories.forEach(t => {
		print("    <itunes:category text=\"${category}\"/>");
	});

	articles.forEach(a => {

		print("    <item>");
		print("        <title>"+a.title+"</title>");
		print("        <itunes:author>"+a.author+"</itunes:author>");
		print("        <itunes:subtitle>"+"</itunes:subtitle>");
		print("        <itunes:summary><![CDATA["+"]]></itunes:summary>");
		print("        <itunes:image href=\""+"\" />");
		print("        <enclosure url=\""+config.link+a.url+"\" />");
		print("        <guid>"+md5hex(config.link+a.url)+"</guid>");
		print("        <pubDate>"+a.date+"</pubDate>");
		print("        <itunes:duration>"+a.duration+"</itunes:duration>");
		print("    </item>");
	});

	print("</channel>");
	print("</rss>");
};


const run = async (confId) => {
	const config = JSON.parse(fs.readFileSync("./configs/"+confId+".json", 'utf8'));
	const result = await audiofiles("./docs/audio/"+confId);
	const articles = [];

	for(let i=0; i<result.length; i++) {
		const file = result[i];
		
		const duration = await getDuration(file);
		const tags = await getTag(file);
		const props = fs.statSync(file);
		articles.push({
			title : tags.title,
			author: tags.performerInfo,
			subtitle : "",
			summary : "",
			image : "",
			url : file.replace(/\\/g, '/').replace(/docs\//g, ''),
			date :dateFormat(props.ctime, "yyyy-mm-dd"),
			duration :duration
		});
	}

	writeXML(config, articles, (text) => {
		console.log(text)
	});
};

const confId = process.argv[2];
if(confId !== undefined) {
	run(confId);
}
