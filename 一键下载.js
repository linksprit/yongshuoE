// ==UserScript==
// @name         永硕E盘(ys168) 深度提取全站下载链接(过滤HTML)
// @namespace    https://violentmonkey.github.io
// @version      8.0
// @description  递归展开所有目录，自动过滤 jb.html 等非下载文件，提取纯正下载链接到剪贴板
// @author       Assistant
// @match        *://*.ys168.com/*
// @match        *://*.ysepan.com/*
// @match        *://*/*
// @allFrames     true
// @run-at       document-end
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    function checkIsYsepan() {
        var host = location.host || '';
        if (host.indexOf('ys168.com') !== -1 || host.indexOf('ysepan.com') !== -1) {
            return true;
        }
        var html = (document.documentElement && document.documentElement.innerHTML) || '';
        return html.indexOf('ys168') !== -1 || !!document.querySelector('div[id^="ml_"], a[id^="ml_"], #menu');
    }

    function createButton() {
        if (!checkIsYsepan() || document.getElementById('ys_deep_extract_btn')) return;

        var targetContainer = document.body || document.documentElement;
        if (!targetContainer) return;

        var btn = document.createElement('button');
        btn.id = 'ys_deep_extract_btn';
        btn.innerHTML = '⚡ 深度提取全站链接';
        btn.style.cssText = [
            'position: fixed !important',
            'top: 15px !important',
            'right: 15px !important',
            'z-index: 2147483647 !important',
            'background: #d63384 !important',
            'color: #ffffff !important',
            'border: none !important',
            'border-radius: 6px !important',
            'padding: 8px 14px !important',
            'font-size: 13px !important',
            'font-weight: bold !important',
            'box-shadow: 0 3px 10px rgba(0,0,0,0.3) !important',
            'cursor: pointer !important'
        ].join(';');

        btn.onclick = function () {
            startDeepExtract();
        };

        targetContainer.appendChild(btn);
    }

    // 逐个点击目录节点展开
    function startDeepExtract() {
        var btn = document.getElementById('ys_deep_extract_btn');
        if (btn) btn.innerText = '⏳ 正在深度扫描目录...';

        var folderNodes = document.querySelectorAll('a[id^="ml_"], div[id^="ml_"], .mli_a, .m_title, [onclick*="ml"]');
        var index = 0;

        var expandInterval = setInterval(function () {
            if (index < folderNodes.length) {
                try {
                    folderNodes[index].click();
                } catch (e) {}
                index++;
            } else {
                clearInterval(expandInterval);
                if (btn) btn.innerText = '⏳ 正在解析下载地址...';
                setTimeout(function () {
                    collectAllLinks();
                }, 2500);
            }
        }, 150);
    }

    // 判断链接是否符合规则（包含 HTML 过滤）
    function isValidDownloadUrl(href, title) {
        if (!href) return false;

        var lowerHref = href.toLowerCase();
        var lowerTitle = title.toLowerCase();

        // 1. 过滤包含 jb.html 以及常见无用 html 页面
        if (lowerHref.indexOf('jb.html') !== -1 || 
            lowerHref.indexOf('index.html') !== -1 || 
            lowerHref.indexOf('default.html') !== -1 ||
            lowerHref.indexOf('readme.html') !== -1) {
            return false;
        }

        // 2. 剔除系统功能导航按钮
        var invalidTitles = ['首页', '留言', '空间管理', '联系我们', '返回', '说明', '刷新', '复制', '目录'];
        if (invalidTitles.indexOf(title) !== -1) {
            return false;
        }

        // 3. 必须包含永硕E盘文件下载特征
        return (lowerHref.indexOf('down') !== -1 || 
                lowerHref.indexOf('ys168') !== -1 || 
                lowerHref.indexOf('ysepan') !== -1 || 
                lowerHref.indexOf('/f/') !== -1);
    }

    // 抓取并过滤链接
    function collectAllLinks() {
        var btn = document.getElementById('ys_deep_extract_btn');
        var anchors = document.querySelectorAll('a');
        var urlList = [];
        var seenUrls = {};
        var filterCount = 0;

        for (var i = 0; i < anchors.length; i++) {
            var a = anchors[i];
            var href = a.href || '';
            var title = (a.innerText || a.textContent || '').trim();

            if (isValidDownloadUrl(href, title)) {
                if (!seenUrls[href]) {
                    seenUrls[href] = true;
                    urlList.push(href);
                }
            } else if (href.toLowerCase().indexOf('jb.html') !== -1) {
                filterCount++;
            }
        }

        if (btn) btn.innerText = '⚡ 深度提取全站链接';

        if (urlList.length === 0) {
            alert('未识别到有效文件！\n（已自动过滤 html 网页链接。如有加密文件夹，请手动输入密码展开后再试）');
            return;
        }

        var resultText = urlList.join('\n');

        // 复制到剪贴板
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(resultText).then(function () {
                alert('成功提取 ' + urlList.length + ' 个有效下载链接！\n(已过滤 ' + filterCount + ' 个 jb.html 网页链接)\n已自动复制到剪贴板。');
            }).catch(function () {
                fallbackCopy(resultText, urlList.length, filterCount);
            });
        } else {
            fallbackCopy(resultText, urlList.length, filterCount);
        }
    }

    function fallbackCopy(text, count, filterCount) {
        var textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        (document.body || document.documentElement).appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
            alert('成功提取 ' + count + ' 个有效下载链接！\n(已过滤 ' + filterCount + ' 个 jb.html 网页链接)\n已自动复制到剪贴板。');
        } catch (err) {
            alert('复制失败，提取结果已打印在控制台');
            console.log(text);
        }
        (document.body || document.documentElement).removeChild(textarea);
    }

    setInterval(function () {
        createButton();
    }, 500);
})();
