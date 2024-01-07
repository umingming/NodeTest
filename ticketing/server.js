const puppeteer = require('puppeteer');
//시간 지정(month - 1)
const targetTime = new Date(2024, 00, 07, 17, 17);

(async () => {
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    //로그인
    await page.goto('https://www.kbl.or.kr/auth/login');
    await page.type(".login-box .box li input[type='email']", 'u_0112@naver.com');
    await page.type(".login-box .box li input[type='password']", 'tndnjseo13!');
    await page.keyboard.press('Enter');

    /**
     * @param {puppeteer.Page} targetPage 
     * @param {String} selector 
     * @param {Number} delay ms 
     */
    async function clickAfterRender(targetPage, selector, delay = 0) {
        try {
            await targetPage.waitForSelector(selector, { visible: true });
            const target = await targetPage.$(selector);
            console.log(target, selector, delay);
            if (!target) {
                await clickAfterRender(targetPage, selector);
                return;
            }

            setTimeout(async () => {
                await targetPage.click(selector);
            }, delay)
        } catch (error) {
            console.log(error);
            await clickAfterRender(targetPage, selector);
        }
    } 

    //예매 버튼 대기
    const ticketBtn = ".header-wrap .ic-ticket-24";
    const remainingTime = Math.max(targetTime.getTime() - Date.now(), 1); 
    await clickAfterRender(page, ticketBtn, remainingTime);

    //리스트에서 몇 번째 경기인지 선택
    const popupBtn = ".reserve-list li:nth-child(4) button";
    await clickAfterRender(page, popupBtn);
    
    //popUp 페이지
    const popup = await browser.waitForTarget(
        (target) => target.url().includes('https://facility.ticketlink.co.kr/')
    )
    const popupPage = await popup.page()

    //첫번째 일정
    const reserveBtn = ".first .btn.btn_reserve";
    await clickAfterRender(popupPage, reserveBtn);

    //경고 팝업 나올 경우 대비
    await popupPage.keyboard.press('Enter');

    //구역 선택
    async function selectSection(grade, zone) {
        const gradeSelector = `#select_seat_grade > li:nth-child(${grade})`;
        const zoneSelector = `${gradeSelector} > .seat_zone li:nth-child(${zone})`;

        await clickAfterRender(popupPage, gradeSelector);
        await clickAfterRender(popupPage, zoneSelector);
    }
    await selectSection(4, 4);

    //좌석 선택
    const mapSelector = "#main_view_top > #main_view > canvas:last-child";
    await popupPage.waitForSelector(mapSelector, { visible: true });
    const map = await popupPage.$(mapSelector);

    if (map) {
        //배치도 크기 확인
        const rect = await popupPage.evaluate(el => {
            const { top, left, width, height } = el.getBoundingClientRect();
            return { top, left, width, height };
        }, map);


        async function selectSeat(rect) {
            for (let i = rect.left + rect.width / 4; i < rect.width; i+=10) {
                for (let j = rect.top + rect.height / 2; j < rect.height; j+=10) {
                    await popupPage.mouse.click(i, j);
                    //선택 완료
                    const seat = await popupPage.$('.reserve_right > .reserve_btn > .btn.btn_full');
                    if (seat) return;
                }
            }
        }
        await selectSeat(rect);

        //다음 단계 이동
        // await popupPage.click('.reserve_right > .reserve_btn > .btn.btn_full');
    }
})();