$(function(){

    // =============================
    // 배경음악 플레이어
    // =============================
    const audio    = document.getElementById('bg-music');
    const musicBtn = document.getElementById('music-btn');

    // 자동재생 시도 (페이지 로드 즉시)
    function tryAutoPlay() {
        audio.play().then(() => {
            musicBtn.classList.remove('paused');
        }).catch(() => {
            // 자동재생 실패 시 첫 터치/클릭 때 재생
            const startOnInteraction = () => {
                audio.play().then(() => {
                    musicBtn.classList.remove('paused');
                }).catch(() => {});
                document.removeEventListener('touchstart', startOnInteraction);
                document.removeEventListener('click',      startOnInteraction);
            };
            document.addEventListener('touchstart', startOnInteraction, { once: true });
            document.addEventListener('click',      startOnInteraction, { once: true });
        });
    }

    tryAutoPlay();

    // 버튼 클릭으로 켜고 끄기
    musicBtn.addEventListener('click', function(e) {
        e.stopPropagation(); // 위의 click 이벤트와 충돌 방지
        if (audio.paused) {
            audio.play();
            musicBtn.classList.remove('paused');
        } else {
            audio.pause();
            musicBtn.classList.add('paused');
        }
    });


    // =============================
    // 타이핑 애니메이션
    // =============================
    const typingEl = document.querySelector('.typing-text');
    const msg      = "We are \ngetting married!";
    let   charIdx  = 0;

    const typingTimer = setInterval(() => {
        typingEl.innerHTML = msg.slice(0, charIdx + 1).replace('\n', '<br>');
        charIdx++;
        if (charIdx === msg.length) {
            clearInterval(typingTimer);
            typingEl.classList.add('done');
        }
    }, 80);


    // =============================
    // 꽃잎 애니메이션 (canvas)
    // =============================
    const canvas = document.getElementById('petal-canvas');
    const ctx    = canvas.getContext('2d');

    function resizeCanvas() {
        canvas.width  = canvas.offsetWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    function newPetal() {
        return {
            x:        Math.random() * canvas.width,
            y:        Math.random() * canvas.height * -1,
            w:        Math.random() * 6 + 3,
            h:        Math.random() * 7 + 4,
            opacity:  Math.random() * 0.6 + 0.2,
            speedY:   Math.random() * 1 + 0.5,
            speedX:   (Math.random() - 0.5) * 1.5,
            rotate:   Math.random() * 360,
            rotSpeed: (Math.random() - 0.5) * 2,
        };
    }

    function drawPetal(p) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotate * Math.PI / 180);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle   = '#fff';
        ctx.beginPath();
        ctx.moveTo(0, -p.h / 2);
        ctx.bezierCurveTo( p.w / 2, -p.h / 4,  p.w / 2, p.h / 4,  0,        p.h / 2);
        ctx.bezierCurveTo(-p.w / 2,  p.h / 4, -p.w / 2, -p.h / 4, 0,       -p.h / 2);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    const petals = Array.from({ length: 30 }, newPetal);

    function animatePetals() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        petals.forEach(p => {
            p.y      += p.speedY;
            p.x      += p.speedX;
            p.rotate += p.rotSpeed;
            if (p.y > canvas.height) { p.y = -20; p.x = Math.random() * canvas.width; }
            if (p.x < -20)            p.x = canvas.width;
            if (p.x > canvas.width)   p.x = -20;
            drawPetal(p);
        });
        requestAnimationFrame(animatePetals);
    }
    animatePetals();


    // =============================
    // 페이드업 애니메이션
    // =============================
    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = parseInt(entry.target.dataset.delay) || 0;
                setTimeout(() => entry.target.classList.add('visible'), delay);
                fadeObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-up').forEach(el => fadeObserver.observe(el));


    // =============================
    // 캘린더
    // =============================
    const TARGET_YEAR  = 2026;
    const TARGET_MONTH = 10;
    const TARGET_DAY   = 10;

    const HOLIDAYS = {
        '2026-10-3': '개천절',
        '2026-10-5': '대체공휴일',
        '2026-10-9': '한글날',
    };

    function renderCalendar(year, month) {
        const $dates   = $('.dates');
        const firstDay = new Date(year, month - 1, 1).getDay();
        const lastDate = new Date(year, month, 0).getDate();

        $dates.empty();

        for (let i = 0; i < firstDay; i++) {
            $dates.append('<span class="empty"></span>');
        }

        for (let d = 1; d <= lastDate; d++) {
            const day     = new Date(year, month - 1, d).getDay();
            const key     = `${year}-${month}-${d}`;
            const holiday = HOLIDAYS[key];

            let cls = '';
            if (day === 0 || holiday) cls = 'sun';
            if (year === TARGET_YEAR && month === TARGET_MONTH && d === TARGET_DAY) cls += ' today';

            $dates.append(`<span class="${cls}">${d}</span>`);
        }
    }

    renderCalendar(TARGET_YEAR, TARGET_MONTH);


    // =============================
    // 카운트다운
    // =============================
    const weddingDate = new Date('2026-10-10T12:00:00');

    function updateCountdown() {
        const diff = weddingDate - new Date();

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


    // =============================
    // D+Day 카운터
    // =============================
    const startDate = new Date('2019-10-20T00:00:00');

    function updateDday() {
        const diff    = new Date() - startDate;
        const days    = Math.floor(diff / (1000 * 60 * 60 * 24) + 1);
        const hours   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        $('.dday-text').html(
            `<em>${days}</em>일 <em>${hours}</em>시간 <em>${minutes}</em>분 <em>${seconds}</em>초`
        );
    }

    updateDday();
    setInterval(updateDday, 1000);


    // =============================
    // 갤러리
    // =============================
    const TOTAL_IMAGES = 43;
    const SHOW_COUNT   = 9;
    let   currentIndex = 0;

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

    function updateModal(index) {
        $('.modal-img').attr('src', `./images/main/gallery/${index + 1}.jpg`);
        $('.modal-prev').toggle(index > 0);
        $('.modal-next').toggle(index < TOTAL_IMAGES - 1);
    }

    $('.modal-prev').on('click', function() {
        if (currentIndex > 0) updateModal(--currentIndex);
    });

    $('.modal-next').on('click', function() {
        if (currentIndex < TOTAL_IMAGES - 1) updateModal(++currentIndex);
    });

    $('.modal-overlay, .modal-close').on('click', function() {
        $('.gallery-modal').removeClass('active');
        $('body').css('overflow', '');
    });


    // =============================
    // 오시는 길 버튼
    // =============================
    const address   = '제주 제주시 일주서로 7316';
    const placeName = '그라벨호텔 제주';
    const lat       = '33.492444';
    const lng       = '126.4286588';

    $('#btn-copy').on('click', function() {
        navigator.clipboard.writeText(address).then(() => alert('주소가 복사되었습니다.'));
    });

    $('#btn-kakao').on('click', function() {
        const start = Date.now();
        window.location.href = `kakaomap://look?p=${lat},${lng}`;
        setTimeout(() => {
            if (Date.now() - start < 1600) {
                window.open(`https://map.kakao.com/link/map/${encodeURIComponent(placeName)},${lat},${lng}`);
            }
        }, 1500);
    });

    $('#btn-naver').on('click', function() {
        const start = Date.now();
        window.location.href = `nmap://place?lat=${lat}&lng=${lng}&name=${encodeURIComponent(placeName)}&appname=com.wedding.invite`;
        setTimeout(() => {
            if (Date.now() - start < 1600) {
                window.open(`https://map.naver.com/v5/search/${encodeURIComponent(placeName)}?c=${lng},${lat},15,0,0,0,dh`);
            }
        }, 1500);
    });


    // =============================
    // 계좌 드롭다운
    // =============================
    $('.account-toggle').on('click', function() {
        const $group = $(this).closest('.account-group');
        const $list  = $group.find('.account-list');
        const isOpen = $list.hasClass('open');

        $('.account-list').removeClass('open');
        $('.account-toggle').removeClass('open');

        if (!isOpen) {
            $list.addClass('open');
            $(this).addClass('open');
        }
    });

    // 계좌 복사
    $('.copy-btn').on('click', function() {
        const text  = `${$(this).data('bank')} ${$(this).data('number')} ${$(this).data('name')}`;
        const $icon = $(this).find('i');

        navigator.clipboard.writeText(text).then(() => {
            $icon.removeClass('bi-copy').addClass('bi-check2');
            setTimeout(() => $icon.removeClass('bi-check2').addClass('bi-copy'), 1500);
        });
    });


    // =============================
    // 스크롤탑 & 뮤직 버튼 위치
    // =============================
    function updateButtonPos() {
        const wrapRight = document.getElementById('wrap').getBoundingClientRect().right;
        const offset    = window.innerWidth - wrapRight + 16;
        $('#scroll-top').css('right', offset + 'px');
        $('#music-player').css('right', offset + 'px');
    }

    updateButtonPos();
    $(window).on('resize', updateButtonPos);

    // 스크롤탑 표시/숨김
    const $scrollTop = $('#scroll-top');
    const headerH    = $('#header').outerHeight();

    $(window).on('scroll', function() {
        $scrollTop.toggleClass('visible', $(this).scrollTop() > headerH);
    });

    $scrollTop.on('click', function() {
        $('html, body').animate({ scrollTop: 0 }, 400);
    });

});
