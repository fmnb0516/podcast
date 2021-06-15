const NodeID3 = require('node-id3');
const mp3Duration = require('mp3-duration');
const recursive = require('recursive-readdir');
const dateFormat = require("dateformat");
const fs = require('fs');

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

	/*
	categories.forEach(t => {
		print("    <itunes:category text=\"${category}\"/>");
	});

	articles.forEach(a => {

		print("    <item>");
		print("        <title>${info.title}</title>");
		print("        <itunes:author>${info.author}</itunes:author>");
		print("        <itunes:subtitle>${info.subtitle}</itunes:subtitle>");
		print("        <itunes:summary><![CDATA[${info.summary}]]></itunes:summary>");
		print("        <itunes:image href=\"${info.image}\" />");
		print("        <enclosure url=\"${baseurl}${info.url}\" />");
		print("        <guid>${hash}</guid>");
		print("        <pubDate>${info.date}</pubDate>");
		print("        <itunes:duration>${info.duration}</itunes:duration>");
		print("    </item>");
	});
	*/

	print("</channel>");
	print("</rss>");
};


const run = async () => {
	const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
	const result = await audiofiles("./docs/audio");
	const articles = [];

	for(let i=0; i<result.length; i++) {
		const file = result[i];
		
		const duration = await getDuration(file);
		const tags = await getTag(file);
		const props = fs.statSync(file);
		articles.push({
			title : tags.title,
			subtitle : "",
			summary : "",
			image : "",
			url : file.replace(/\\/g, '/'),
			date :dateFormat(props.ctime, "yyyy-mm-dd"),
			duration :duration
		});
	}

	writeXML(config, articles, (text) => {
		console.log(text)
	});
};

run();