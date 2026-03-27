$(function(){

    // 타이핑 애니메이션
    const el = document.querySelector('.typing-text');
    const lines = ["We are ", "getting married!"];
    const msg = lines.join('\n');
    let i = 0;

    const timer = setInterval(() => {
        el.innerHTML = msg.slice(0, i + 1).replace('\n', '<br>');
        i++;
        if (i === msg.length) {
            clearInterval(timer);
            el.classList.add('done');
        }
    }, 80);


    // 꽃잎 애니메이션 (canvas)
    const canvas = document.getElementById('petal-canvas');
    const ctx    = canvas.getContext('2d');

    canvas.width  = canvas.offsetWidth;
    canvas.height = window.innerHeight;

    // 창 크기 변경 시 canvas 재설정
    window.addEventListener('resize', () => {
        canvas.width  = canvas.offsetWidth;
        canvas.height = window.innerHeight;
    });

    const petals = [];
    const petalCount = 30;

    for (let i = 0; i < petalCount; i++) {
        petals.push(newPetal());
    }

    function newPetal() {
        return {
            x:        Math.random() * canvas.width,
            y:        Math.random() * canvas.height * -1,  // 화면 위에서 시작
            w:        Math.random() * 6 + 3,
            h:        Math.random() * 7 + 4,
            opacity:  Math.random() * 0.6 + 0.2,          // 0.1 ~ 0.4 연하게
            speedY:   Math.random() * 1 + 0.5,            // 낙하 속도
            speedX:   (Math.random() - 0.5) * 1.5,        // 좌우 이동 (-0.75 ~ +0.75)
            rotate:   Math.random() * 360,
            rotSpeed: (Math.random() - 0.5) * 2,          // 회전 속도
        };
    }

    function drawPetal(p) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotate * Math.PI / 180);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = '#fff';

        // 꽃잎 모양 (베지어 곡선)
        ctx.beginPath();
        ctx.moveTo(0, -p.h / 2);                                        // 위 꼭짓점
        ctx.bezierCurveTo(p.w / 2, -p.h / 4,  p.w / 2, p.h / 4,  0, p.h / 2);  // 오른쪽 곡선
        ctx.bezierCurveTo(-p.w / 2, p.h / 4, -p.w / 2, -p.h / 4, 0, -p.h / 2); // 왼쪽 곡선
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        petals.forEach(p => {
            p.y       += p.speedY;
            p.x       += p.speedX;
            p.rotate  += p.rotSpeed;

            // 화면 벗어나면 위에서 다시 시작
            if (p.y > canvas.height) {
                p.y = -20;
                p.x = Math.random() * canvas.width;
            }
            if (p.x < -20)            p.x = canvas.width;
            if (p.x > canvas.width)   p.x = -20;

            drawPetal(p);
        });

        requestAnimationFrame(animate);
    }

    animate();

    
    // 페이드업 애니메이션
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.dataset.delay || 0;
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, parseInt(delay));
                observer.unobserve(entry.target); // 한 번만 실행
            }
        });
    }, {
        threshold: 0.1  // 10% 보이면 실행
    });

    document.querySelectorAll('.fade-up').forEach(el => {
        observer.observe(el);
    });

    // 캘린더
    const TARGET_YEAR  = 2026;
    const TARGET_MONTH = 10;
    const TARGET_DAY   = 10;

    // 공휴일 목록
    const HOLIDAYS = {
        // '2026-10-3':  '개천절',
        '2026-10-5':  '대체공휴일',
        '2026-10-9':  '한글날',
    };

    function renderCalendar(year, month) {
        const $title = $('.cal-title');
        const $dates = $('.dates');

        $title.text(`${year}년 ${month}월`);
        $dates.empty();

        const firstDay = new Date(year, month - 1, 1).getDay();
        const lastDate = new Date(year, month, 0).getDate();

        for (let i = 0; i < firstDay; i++) {
            $dates.append('<span class="empty"></span>');
        }

        for (let d = 1; d <= lastDate; d++) {
            const day     = new Date(year, month - 1, d).getDay();
            const key     = `${year}-${month}-${d}`;
            const holiday = HOLIDAYS[key];

            let cls = '';
            if (day === 0)  cls = 'sun';
            // if (day === 6)  cls = 'sat';
            if (holiday)    cls = 'sun';  // 공휴일 빨간색만
            if (year === TARGET_YEAR && month === TARGET_MONTH && d === TARGET_DAY) cls += ' today';

            $dates.append(`<span class="${cls}">${d}</span>`);  // label 제거
        }
    }

    renderCalendar(TARGET_YEAR, TARGET_MONTH);


    // 카운트다운
    const weddingDate = new Date('2026-10-10T12:00:00');

    function updateCountdown() {
        const now  = new Date();
        const diff = weddingDate - now;

        if (diff <= 0) {
            $('.countdown-text').text('오늘이 결혼식 날입니다 🎉');
            return;
        }

        const days    = Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
        const hours   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        $('.days').text(String(days).padStart(2, '0'));
        $('.hours').text(String(hours).padStart(2, '0'));
        $('.minutes').text(String(minutes).padStart(2, '0'));
        $('.seconds').text(String(seconds).padStart(2, '0'));
        $('.d-day').text(days);
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);


    // 갤러리 자동 생성
    const TOTAL_IMAGES = 20; // ✅ 총 이미지 개수만 여기서 변경
    const SHOW_COUNT   = 9;  // ✅ 처음에 보여줄 개수
    let currentIndex   = 0;  // ✅ 현재 이미지 인덱스

    for (let i = 1; i <= TOTAL_IMAGES; i++) {
        const cls = i > SHOW_COUNT ? 'gallery-item hidden' : 'gallery-item';
        $('.gallery-grid').append(`
            <div class="${cls}" data-index="${i - 1}">
                <img src="./images/main/gallery/${i}.jpg" alt="gallery${i}">
            </div>
        `);
    }

    // 더보기
    $('.more-btn').on('click', function() {
        $('.gallery-item.hidden').removeClass('hidden');
        $(this).addClass('hide');
    });

    // 모달 열기
    $('.gallery-grid').on('click', '.gallery-item', function() {
        currentIndex = parseInt($(this).data('index'));
        updateModal(currentIndex);
        $('.gallery-modal').addClass('active');
        $('body').css('overflow', 'hidden');
    });

    // 모달 이미지 업데이트
    function updateModal(index) {
        const src = `./images/main/gallery/${index + 1}.jpg`;
        $('.modal-img').attr('src', src);

        // 첫/마지막 이미지일 때 버튼 숨기기
        $('.modal-prev').toggle(index > 0);
        $('.modal-next').toggle(index < TOTAL_IMAGES - 1);
    }

    // 이전
    $('.modal-prev').on('click', function() {
        if (currentIndex > 0) {
            currentIndex--;
            updateModal(currentIndex);
        }
    });

    // 다음
    $('.modal-next').on('click', function() {
        if (currentIndex < TOTAL_IMAGES - 1) {
            currentIndex++;
            updateModal(currentIndex);
        }
    });

    // 모달 닫기
    $('.modal-overlay, .modal-close').on('click', function() {
        $('.gallery-modal').removeClass('active');
        $('body').css('overflow', '');
    });


    // 오시는 길 버튼
    const address   = '제주 제주시 일주서로 7316';
    const placeName = '그라벨호텔 제주';
    const lat = '33.492444';
    const lng = '126.4286588';

    // 주소 복사
    $('#btn-copy').on('click', function() {
        navigator.clipboard.writeText(address).then(() => {
            alert('주소가 복사되었습니다.');
        });
    });

    // 카카오맵
    $('#btn-kakao').on('click', function() {
        const kakaoApp = `kakaomap://look?p=${lat},${lng}`;
        const kakaoWeb = `https://map.kakao.com/link/map/${encodeURIComponent(placeName)},${lat},${lng}`;

        // 모바일 앱 시도
        const start = Date.now();
        window.location.href = kakaoApp;

        setTimeout(() => {
            // 앱이 실행됐으면 페이지가 이미 떠났으므로 시간 차이로 판별
            if (Date.now() - start < 1600) {
                window.open(kakaoWeb);
            }
        }, 1500);
    });

    // 네이버지도
    $('#btn-naver').on('click', function() {
        const naverApp = `nmap://place?lat=${lat}&lng=${lng}&name=${encodeURIComponent(placeName)}&appname=com.wedding.invite`;
        const naverWeb = `https://map.naver.com/v5/search/${encodeURIComponent(placeName)}?c=${lng},${lat},15,0,0,0,dh`;

        const start = Date.now();
        window.location.href = naverApp;

        setTimeout(() => {
            if (Date.now() - start < 1600) {
                window.open(naverWeb);
            }
        }, 1500);
    });

    // 계좌 드롭다운
    $('.account-toggle').on('click', function() {
        const $group = $(this).closest('.account-group');
        const $list  = $group.find('.account-list');
        const isOpen = $list.hasClass('open');

        // 모두 닫기
        $('.account-list').removeClass('open');
        $('.account-toggle').removeClass('open');

        // 클릭한 것만 토글
        if (!isOpen) {
            $list.addClass('open');
            $(this).addClass('open');
        }
    });

    // 계좌 복사
    $('.copy-btn').on('click', function() {
        const bank   = $(this).data('bank');
        const number = $(this).data('number');
        const name   = $(this).data('name');
        const text   = `${bank} ${number} ${name}`;  // ✅ "토스뱅크 000-0000-0000 고건호"

        const $icon = $(this).find('i');

        navigator.clipboard.writeText(text).then(() => {
            $icon.removeClass('bi-copy').addClass('bi-check2');
            setTimeout(() => {
                $icon.removeClass('bi-check2').addClass('bi-copy');
            }, 1500);
        });
    });

    // 스크롤탑 버튼 위치 동적 계산
    function updateScrollTopPos() {
        const wrapRight = document.getElementById('wrap').getBoundingClientRect().right;
        const btnOffset = window.innerWidth - wrapRight + 16; // wrap 오른쪽 끝에서 16px 안쪽
        $('#scroll-top').css('right', btnOffset + 'px');
    }

    updateScrollTopPos();
    $(window).on('resize', updateScrollTopPos);

    // 스크롤탑 버튼 표시/숨김
    const $scrollTop = $('#scroll-top');
    const headerH = $('#header').outerHeight();

    $(window).on('scroll', function() {
        if ($(this).scrollTop() > headerH) {
            $scrollTop.addClass('visible');
        } else {
            $scrollTop.removeClass('visible');
        }
    });

    $scrollTop.on('click', function() {
        $('html, body').animate({ scrollTop: 0 }, 400);
    });

});