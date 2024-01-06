// 공식문서 예제이다.
const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    await page.goto('https://www.kbl.or.kr/auth/login');
    await page.type(".login-box .box li input[type='email']", 'u_0112@naver.com');
    await page.type(".login-box .box li input[type='password']", 'tndnjseo13!');
    await page.keyboard.press('Enter');
    await page.waitForSelector('.contents.main', {
        visible: true,
    });
    await page.waitForSelector('.ic-ticket-24', {
        visible: true,
    });
    await page.click('.header-wrap .ic-ticket-24');
    await page.waitForSelector('.reserve-list', {
        visible: true,
    });
    await page.click('.reserve-list li:nth-child(2) button');
    
    const popup = await browser.waitForTarget(
        (target) => target.url().includes('https://facility.ticketlink.co.kr/')
    )
    const popupPage = await popup.page()
    await popupPage.waitForSelector('.first', {
        visible: true,
    });
    await popupPage.click('.first .btn.btn_reserve');
    await popupPage.keyboard.press('Enter');
    await popupPage.waitForSelector('#seat_grade_88218', {
        visible: true,
    });
    await popupPage.click('#seat_grade_88218');
    await popupPage.waitForSelector('#seat_zone_110014', {
        visible: true,
    });
    await popupPage.click('#seat_zone_110014');
    await popupPage.waitForSelector('#main_view_top > #main_view > canvas:last-child', {
        visible: true,
    });
    await popupPage.focus('#main_view_top > #main_view > canvas:last-child');
    const elem = await popupPage.$('#main_view_top > #main_view > canvas:last-child');
    console.log(typeof elem);
})();