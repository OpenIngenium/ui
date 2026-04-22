const jwt = require("jsonwebtoken");


function createToken() {
    return jwt.sign({
        scopes: ["execute:wsts", "execute:testbed", "execute:sit", "admin"],
        username: process.env.TEST_USER,
        iat: Math.floor(Date.now() / 1000) - 60,
        exp: Math.floor(Date.now() / 1000) + (30 * 60)
    }, process.env.PRIVATE_PEM, {
        algorithm: 'RS256'
    });
}

async function login() {
    browser.ignoreSynchronization = true;
    const until = protractor.ExpectedConditions;

    const loginForm = element(by.css("#login_widget"));

    try {
        await browser.get("/login/");
        await browser.wait(until.presenceOf(loginForm), 1000);
        await element(by.css("input[name=username]")).sendKeys(browser.params.login.testUser);
        await element(by.css("input[name=password]")).sendKeys(browser.params.login.testPass, protractor.Key.ENTER);
        await browser.wait(until.invisibilityOf(loginForm), 2000);
    } catch(error) {
        console.log(error);
    }

}

module.exports.createToken = createToken;
module.exports.login = login;
