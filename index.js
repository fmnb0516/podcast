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


const run = async () => {
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

		console.log(articles);
	}
};

run();