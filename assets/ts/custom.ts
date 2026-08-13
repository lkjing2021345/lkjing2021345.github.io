// Custom TypeScript — 代码块复制按钮 & 语言标签
// 注意：主题自带 copyCodeButton，这里用自定义的按钮覆盖

const highlights = document.querySelectorAll('.article-content div.highlight');
const copyText = '<复制>';
const copiedText = '<已复制>';

highlights.forEach(highlight => {
    // 避免重复添加
    if (highlight.querySelector('.copyCodeButton')) return;

    const copyButton = document.createElement('button');
    copyButton.innerHTML = copyText;
    copyButton.classList.add('copyCodeButton');
    highlight.appendChild(copyButton);

    const codeBlock = highlight.querySelector('code[data-lang]');
    if (!codeBlock) return;

    const lang = codeBlock.getAttribute('data-lang');

    copyButton.addEventListener('click', () => {
        navigator.clipboard.writeText(codeBlock.textContent)
            .then(() => {
                copyButton.textContent = copiedText;
                setTimeout(() => {
                    copyButton.textContent = copyText;
                }, 1000);
            })
            .catch(err => {
                console.log('Copy failed', err);
            });
    });
});

// ============================================================
// 樱花背景动画 —— 盛开的樱花飘落：光标碰触时加速旋转
// ============================================================
(() => {
    declare global {
        interface Window {
            __petalDebug?: { spinHits: number; petalCount: number };
        }
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    interface Petal {
        x: number;
        y: number;
        r: number;
        fallSpeed: number;
        swayAmp: number;
        swaySpeed: number;
        rotSpeed: number;
        spinBoost: number;
        rotation: number;
        phase: number;
        t: number;
        color: string;
        alpha: number;
        isFlower: boolean;
    }

    // ---- 可调参数 ----
    const PINK = ['#ffc9d6', '#ffb7c5', '#ffa6b8', '#ff8fa3', '#f9a8c0'];
    const DEEP = '#e26b83';

    const canvas = document.createElement('canvas');
    canvas.id = 'petal-canvas';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let petals: Petal[] = [];
    let pointerX: number | undefined;
    let pointerY: number | undefined;

    // 调试计数（可在浏览器控制台查看，排查交互问题）
    window.__petalDebug = { spinHits: 0, petalCount: 0 };

    const randomBetween = (min: number, max: number) => min + Math.random() * (max - min);

    function createPetal(): Petal {
        return {
            x: Math.random() * width,
            y: Math.random() * height,
            r: randomBetween(6, 14),
            fallSpeed: randomBetween(18, 55),
            swayAmp: randomBetween(20, 60),
            swaySpeed: randomBetween(0.5, 2.0),
            rotSpeed: randomBetween(0.2, 1.2),
            spinBoost: 0,
            rotation: 0,
            phase: Math.random() * Math.PI * 2,
            t: Math.random() * 100,
            color: PINK[Math.floor(Math.random() * PINK.length)],
            alpha: randomBetween(0.5, 0.85),
            isFlower: Math.random() < 0.3,
        };
    }

    function resize() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';

        // 按视口面积调整花瓣数量
        const target = Math.min(45, Math.max(25, Math.floor((width * height) / 30000)));
        while (petals.length < target) petals.push(createPetal());
        if (petals.length > target) petals.length = target;
        window.__petalDebug!.petalCount = petals.length;
    }

    // 单瓣：盛开的泪滴形花瓣 + 径向渐变 + 叶脉
    function drawPetalShape(p: Petal) {
        const r = p.r;
        const grad = ctx.createRadialGradient(0, -r * 0.35, r * 0.15, 0, 0, r * 1.1);
        grad.addColorStop(0, p.color);
        grad.addColorStop(1, DEEP);
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(0, -r);
        ctx.bezierCurveTo(r, -r * 0.6, r * 0.9, r * 0.4, 0, r);
        ctx.bezierCurveTo(-r * 0.9, r * 0.4, -r, -r * 0.6, 0, -r);
        ctx.closePath();
        ctx.fill();

        // 叶脉
        ctx.globalAlpha = p.alpha * 0.55;
        ctx.strokeStyle = 'rgba(255,255,255,0.85)';
        ctx.lineWidth = Math.max(0.6, r * 0.08);
        ctx.beginPath();
        ctx.moveTo(0, -r * 0.5);
        ctx.quadraticCurveTo(r * 0.25, 0, 0, r * 0.7);
        ctx.stroke();
        ctx.globalAlpha = 1;
    }

    // 整朵樱花：五瓣向外展开 + 暖色花心
    function drawFlower(p: Petal) {
        const offset = p.r * 0.55;
        for (let i = 0; i < 5; i++) {
            ctx.save();
            ctx.rotate((i * Math.PI * 2) / 5);
            ctx.translate(0, -offset);
            drawPetalShape(p);
            ctx.restore();
        }
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = '#ffd9b0';
        ctx.beginPath();
        ctx.arc(0, 0, p.r * 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }

    let last = performance.now();

    function frame(now: number) {
        const dt = Math.min((now - last) / 1000, 0.05);
        last = now;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.scale(dpr, dpr);

        // 减动效偏好：环境飘落更慢更稳，但交互（旋转）保留
        const ambient = reduceMotion ? 0.35 : 1;

        for (const p of petals) {
            p.t += dt;

            // 光标碰触检测：范围内持续触发加速旋转
            if (pointerX !== undefined && pointerY !== undefined) {
                const dx = p.x - pointerX;
                const dy = p.y - pointerY;
                const threshold = Math.max(p.r * 3, 36);
                if (dx * dx + dy * dy <= threshold * threshold) {
                    p.spinBoost = reduceMotion ? 5 : 14 + Math.random() * 4;
                    window.__petalDebug!.spinHits++;
                }
            }

            // 旋转加速指数衰减回常态
            p.spinBoost *= Math.exp(-(reduceMotion ? 2.5 : 1.5) * dt);
            p.rotation += (p.rotSpeed + p.spinBoost) * dt;

            // 飘落 + 左右摆动
            p.y += p.fallSpeed * ambient * dt;
            p.x += Math.sin(p.t * p.swaySpeed + p.phase) * p.swayAmp * ambient * dt;

            // 飘出屏幕后回到顶部
            if (p.y - p.r > height) {
                p.y = -p.r - Math.random() * 20;
                p.x = Math.random() * width;
            }
            if (p.x - p.r > width) p.x = -p.r;
            if (p.x + p.r < 0) p.x = width + p.r;

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);
            if (p.isFlower) drawFlower(p);
            else drawPetalShape(p);
            ctx.restore();
        }

        ctx.restore();
        requestAnimationFrame(frame);
    }

    // ---- 指针跟踪：多事件兜底，保证交互稳定 ----
    function trackPointer(x: number, y: number) {
        pointerX = x;
        pointerY = y;
    }
    window.addEventListener('pointermove', (e) => trackPointer(e.clientX, e.clientY));
    window.addEventListener('mousemove', (e) => trackPointer(e.clientX, e.clientY));
    window.addEventListener('pointerdown', (e) => trackPointer(e.clientX, e.clientY));
    document.addEventListener('pointerleave', () => {
        pointerX = undefined;
        pointerY = undefined;
    });
    window.addEventListener('blur', () => {
        pointerX = undefined;
        pointerY = undefined;
    });

    // ---- 返回顶部按钮 ----
    const backToTop = document.getElementById('back-to-top');
    if (backToTop) {
        const updateBackToTop = () => backToTop.classList.toggle('show', window.scrollY > 400);
        window.addEventListener('scroll', updateBackToTop, { passive: true });
        updateBackToTop();
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
        });
    }

    // ---- 加载动画收场：资源加载完 + 最短展示时长后"对焦"淡出 ----
    const siteLoading = document.getElementById('site-loading');
    if (siteLoading) {
        const t0 = performance.now();
        let hidden = false;
        const hide = () => {
            if (hidden) return;
            hidden = true;
            const wait = Math.max(0, 900 - (performance.now() - t0));
            setTimeout(() => {
                siteLoading.classList.add('is-hidden');
                setTimeout(() => siteLoading.remove(), 600);
            }, wait);
        };
        if (document.readyState === 'complete') {
            hide();
        } else {
            window.addEventListener('load', hide);
        }
        // 兜底：某个资源挂起时最多等 6 秒，避免一直卡在加载页
        setTimeout(hide, 6000);
    }

    resize();
    window.addEventListener('resize', resize);
    requestAnimationFrame(frame);
})();

// ============================================================
// 目录折叠：有子级的条目右侧显示灰色下箭头，点击展开/收起
// ============================================================
(() => {
    const nav = document.getElementById('TableOfContents');
    if (!nav) return;

    nav.querySelectorAll('li').forEach(li => {
        const sub = li.querySelector(':scope > ul');
        if (!sub) return;

        sub.classList.add('toc-sub');
        li.classList.add('has-sub');

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'toc-toggle';
        btn.title = '展开/收起';
        btn.setAttribute('aria-expanded', 'false');
        btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>';
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const open = li.classList.toggle('toc-open');
            btn.setAttribute('aria-expanded', String(open));
        });

        const a = li.querySelector(':scope > a');
        // 箭头放在链接左侧
        if (a) {
            li.insertBefore(btn, a);
        } else {
            li.appendChild(btn);
        }
    });
})();
