module.exports = function exitWithError() {
    console.log.apply(console, arguments);
    process.exit(1);
};
