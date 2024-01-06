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
    await popupPage.waitForSelector('#select_seat_grade li:nth-child(9)', {
        visible: true,
    });
    await popupPage.click('#select_seat_grade li:nth-child(9)');
    await popupPage.waitForSelector('#select_seat_grade li:nth-child(9) .seat_zone', {
        visible: true,
    });
    await popupPage.click('#select_seat_grade li:nth-child(9) .seat_zone li:nth-child(3)');
    await popupPage.waitForSelector('#main_view_top > #main_view > canvas:last-child', {
        visible: true,
    });
    const elem = await popupPage.$('#main_view_top > #main_view > canvas:last-child');
    if (elem) {
        const rect = await popupPage.evaluate(el => {
            const { top, left, width, height } = el.getBoundingClientRect();
            return { top, left, width, height };
        }, elem);
        async function onclick(rect) {
            for (let i = rect.left + rect.width / 4; i < rect.width / 2; i++) {
                for (let j = rect.top + rect.height / 2; j < rect.height; j++) {
                    await popupPage.mouse.click(i, j);
                    const seat = await popupPage.$('.reserve_right > .reserve_btn > .btn.btn_full');
                    if (seat) {
                        return;
                    }
                }
            }
        }
        await onclick(rect);
        await popupPage.click('.reserve_right > .reserve_btn > .btn.btn_full');
        // await popupPage.waitForSelector('.selectbox:first-child', {
        //     visible: true,
        // });
        // await popupPage.click('.selectbox:first-child');
        // await popupPage.waitForSelector('.selectbox:first-child .select_list li:nth-child(2)', {
        //     visible: true,
        // });
        // await popupPage.click('.selectbox:first-child .select_list li:nth-child(2)');
    }
})();