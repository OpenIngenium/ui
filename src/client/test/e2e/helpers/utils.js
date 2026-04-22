const timeoutPromise = (timeout) => new Promise((resolve) => setTimeout(resolve, timeout));

module.exports.timeoutPromise = timeoutPromise;
