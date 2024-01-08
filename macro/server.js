const puppeteer = require("puppeteer");

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    });
    const page = await browser.newPage();
    //페이지 이동
    await page.goto(
        "https://www.notion.so/yumding/daeb583c911342088781d60b98b8378a?v=8a37c37672344def9396032531147377"
    );

    //경고 무시
    const ignoreBtn = ".block-page_button2";
    await clickAfterRender(page, ignoreBtn);

    //로그인
    const googleBtn = ".notion-login div[role='button']:first-child";
    await clickAfterRender(page, googleBtn);
    const loginPopup = await browser.waitForTarget((target) =>
        target.url().includes("https://accounts.google.com/")
    );
    const loginPage = await loginPopup.page();
    await clickAfterRender(loginPage, "input[type='email']");
    await loginPage.type("input[type='email']", "u13040035@gmail.com");
    await loginPage.keyboard.press("Enter");
})();

/**
 * @param {puppeteer.Page} targetPage
 * @param {String} selector
 */
async function clickAfterRender(targetPage, selector) {
    try {
        //timeout 설정 안 하면 30초 제한 걸림.
        await targetPage.waitForSelector(selector, {
            visible: true,
            timeout: 3000000,
        });
        const target = await targetPage.$(selector);
        if (!target) {
            return await clickAfterRender(targetPage, selector);
        }
        await target.click();
        return true;
    } catch (error) {
        console.log(selector, error);
        return false;
    }
}
