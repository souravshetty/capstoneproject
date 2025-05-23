module.exports = function configure(config) {
	config.android = config.android || {};
	config.android.minSdkVersion = 26;
	return config;
};
