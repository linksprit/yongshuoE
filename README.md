# yongshuoE
一键获取获取 永硕E盘文件  下载链接
1、crx 脚本运行 暴力猴  安装下方插件到 谷歌或Edge浏览器
https://www.crxsoso.com/webstore/detail/dhdgffkkebhmkfjojejmpbldmpobfkfo

2、 设置 - 扩展程序 - 打开开发者选项 点击暴力猴详细信息  点击运行用户脚本

3、打开右上角扩展 暴力猴 添加用户脚本 

4、打开永硕E盘连接，  到达文件页面， 右上角会出现获取下载连接按钮


5、利用下载软件 aria2   IDM FDM 软件下载


 '''
 // ==UserScript==
// @name         永硕E盘(ys168) 提取当前已展开文件链接
// @namespace    https://violentmonkey.github.io
// @version      5.3
// @description  提取永硕E盘已展开文件链接
// @author       Assistant
// @match        *://*.ys168.com/*
// @match        *://*.ysepan.com/*
// @match        *://*/*
// @allFrames     true
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // 严密判断是否为永硕E盘相关页面
    function checkIsYsepan() {
        var host = location.host || '';
        if (host.indexOf('ys168.com') !== -1 || host.indexOf('ysepan.com') !== -1) {
            return true;
        }
        var html = (document.documentElement && document.documentElement.innerHTML) || '';
        return html.indexOf('ys168') !== -1 || !!document.querySelector('div[id^="ml_"], a[id^="ml_"], #menu');
    }

    // 注入右上角按钮
    function createButton() {
        if (!checkIsYsepan()) return;
        if (document.getElementById('ys_simple_extract_btn')) return;

        var targetContainer = document.body || document.documentElement;
        if (!targetContainer) return;

        var btn = document.createElement('button');
        btn.id = 'ys_simple_extract_btn';
        btn.innerHTML = '📋 提取已展开文件';
        btn.style.cssText = [
            'position: fixed !important',
            'top: 15px !important',
            'right: 15px !important',
            'z-index: 2147483647 !important',
            'background: #28a745 !important',
            'color: #ffffff !important',
            'border: none !important',
            'border-radius: 6px !important',
            'padding: 8px 12px !important',
            'font-size: 13px !important',
            'font-weight: bold !important',
            'box-shadow: 0 3px 10px rgba(0,0,0,0.3) !important',
            'cursor: pointer !important'
        ].join(';');

        btn.onclick = function () {
            extractLinks();
        };

        targetContainer.appendChild(btn);
    }

    // 核心提取逻辑
    function extractLinks() {
        var anchors = document.querySelectorAll('a');
        var urlList = [];

        for (var i = 0; i < anchors.length; i++) {
            var a = anchors[i];
            var href = a.href || '';
            var title = (a.innerText || a.textContent || '').trim();

            if (href && (href.indexOf('down') !== -1 || href.indexOf('ys168') !== -1 || href.indexOf('ysepan') !== -1 || href.indexOf('/f/') !== -1)) {
                if (title && ['首页', '留言', '空间管理', '联系我们', '返回', '说明', '刷新'].indexOf(title) === -1) {
                    if (a.offsetWidth > 0 || a.offsetHeight > 0 || a.getClientRects().length > 0) {
                        urlList.push(href);
                    }
                }
            }
        }

        if (urlList.length === 0) {
            alert('未检测到已展开的文件！\n请先点击网页上的文件夹（若有加密输入密码展开），再点击此按钮。');
            return;
        }

        var resultText = urlList.join('\n');

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(resultText).then(function () {
                alert('成功提取 ' + urlList.length + ' 个文件链接并已复制到剪贴板！');
            }).catch(function () {
                fallbackCopy(resultText, urlList.length);
            });
        } else {
            fallbackCopy(resultText, urlList.length);
        }
    }

    function fallbackCopy(text, count) {
        var textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        (document.body || document.documentElement).appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
            alert('成功提取 ' + count + ' 个文件链接并已复制到剪贴板！');
        } catch (err) {
            alert('复制失败，提取结果已打印在控制台');
            console.log(text);
        }
        (document.body || document.documentElement).removeChild(textarea);
    }

    // 持续轮询，确保在动态渲染完成后成功挂载按钮
    var timer = setInterval(function () {
        createButton();
    }, 500);
})();
 '''
