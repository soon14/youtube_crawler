const fs = require('fs');

exports.writeIntoFile = (fileName, data, w) => {
	if (w) {
		fs.writeFileSync(fileName, data);
		console.log('It\'s saved!');
	} else {
		if (fs.existsSync(fileName)) {
			fs.appendFileSync(fileName, data);
			console.log('The "data to append" was appended to file!');
		} else {
			fs.writeFileSync(fileName, data);
			console.log('It\'s saved!');
		}

	}

}