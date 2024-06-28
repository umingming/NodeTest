const puppeteer = require('puppeteer');
//시간 지정(month - 1)
const targetTime = new Date(2024, 5, 27, 13, 59, 55);

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

/**
 * @returns {Promise<Object>}
 */
function waitLogin() {
    const remainingTime = Math.max(targetTime.getTime() - Date.now(), 1000); 
    return new Promise(resolve => setTimeout(resolve, remainingTime));
}

(async () => {
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    
    // 팝업 무시
    await page.goto('https://ticket.interpark.com/Contents/Sports/GoodsInfo?SportsCode=07001&TeamCode=PB026');
    const popupCloseBtn = ".popupInput > .btnClose"
    const popupCloseBtn2 = "#div_checkDontsee_PT002_12_2 .popupInput > .btnClose"
    await clickAfterRender(page, popupCloseBtn);

    // 로그인 이동
    const loginBtn = ".Ticket_Account.header_userMenu__c408a a:first-child"
    await clickAfterRender(page, loginBtn)

    // 로그인
    await page.waitForSelector("#userId", { visible: true, timeout: 3000000 });
    await page.type("#userId", id);
    await page.type("#userPwd", password);

    await waitLogin();
    await page.keyboard.press('Enter');
    
    // 팝업 무시
    await clickAfterRender(page, popupCloseBtn);
    await clickAfterRender(page, popupCloseBtn2);
    
    // 예매하기
    const reserveBtn = ".timeSchedule:nth-child(2) > div:last-child"
    await clickAfterRender(page, reserveBtn);
})();