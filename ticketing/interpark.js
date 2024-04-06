const puppeteer = require('puppeteer');
//시간 지정(month - 1)
const targetTime = new Date(2024, 3, 6, 13, 55, 21.9);
const id = "o0o5193";
const password = "tndnjseo13!";

/**
 * @param {puppeteer.Page} targetPage 
 * @param {String} selector 
 * @param {Number} delay ms 
 */
async function clickAfterRender(targetPage, selector) {
    try {
        //timeout 설정 안 하면 30초 제한 걸림.
        await targetPage.waitForSelector(selector, { visible: true, timeout: 3000000 });
        const target = await targetPage.$(selector);
        if (!target) {
            return await clickAfterRender(targetPage, selector)
        }
        await targetPage.keyboard.press('Enter');
        await target.click();
        return true;
    } catch (error) {
        console.log(selector, error);
        return false;
    }
} 

(async () => {
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    
    // 팝업 무시
    await page.goto('https://tickets.interpark.com/goods/24003992');
    // const popupCloseBtn = ".popupFooter > .popupCheck"
    // await clickAfterRender(page, popupCloseBtn);

    // 로그인 이동
    const loginBtn = ".Ticket_Account.header_userMenu__c408a a:first-child"
    await clickAfterRender(page, loginBtn)

    // 로그인
    await page.waitForSelector("#userId", { visible: true, timeout: 3000000 });
    await page.type("#userId", id);
    await page.type("#userPwd", password);

    const remainingTime = Math.max(targetTime.getTime() - Date.now(), 1000); 
    new Promise(() => setTimeout(async () => await page.keyboard.press('Enter'), remainingTime))
        .then(async () => {
             // 예매하기
            const reserveBtn = ".sideBtn.is-primary"
            await clickAfterRender(page, reserveBtn);
        });
})();