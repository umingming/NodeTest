const puppeteer = require('puppeteer');
//시간 지정(month - 1)
const targetTime = new Date(2024, 0, 8, 15, 0, 21.9);

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

    //예매 버튼 대기
    const ticketBtn = ".header-wrap .ic-ticket-24";
    const remainingTime = Math.max(targetTime.getTime() - Date.now(), 1000); 
    new Promise(() => setTimeout(async () => await clickAfterRender(page, ticketBtn), remainingTime));
    
    //리스트에서 몇 번째 경기인지 선택
    const popupBtn = ".reserve-list li:nth-child(6) button";
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
    async function selectSection(grade) {
        await popupPage.waitForSelector("#select_seat_grade", { visible: true });
        const gradeSelector = `#select_seat_grade > li:nth-child(${grade})`;
        const zoneSelector = `${gradeSelector} > .seat_zone li:first-child`;

        const result = await clickAfterRender(popupPage, gradeSelector);
        if (result) {
            return await clickAfterRender(popupPage, zoneSelector);
        } else {
            return await selectSection(grade);
        }
    }
    //전체가 첫 번째임 무조건 2부터
    const result = await selectSection(2);
    if (!result) await selectSection(2);

    //경고 팝업 나올 경우 대비
    await popupPage.keyboard.press('Enter');

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
            try {
                for (let i = rect.left + rect.width / 4; i < rect.width - 10; i+=10) {
                    for (let j = rect.top + rect.height / 10; j < rect.height - 10; j+=10) {
                        await popupPage.mouse.click(i, j);
                        //선택 완료
                        const seat = await popupPage.$('.reserve_right > .reserve_btn > .btn.btn_full');
                        if (seat) return;
                    }
                }
            } catch (error) {
                console.log("seat", error);
            }
        }
        await selectSeat(rect);

        // 다음 단계 이동
        try {
            await popupPage.click('.reserve_right > .reserve_btn > .btn.btn_full');
        } catch (error) {
            console.log("click", error);
            await selectSeat(rect);
        }
    }
})();