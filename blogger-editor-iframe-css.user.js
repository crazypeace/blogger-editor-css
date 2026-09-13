// ==UserScript==
// @name         Blogger的编辑器 所见即所得WYSIWYG 优化
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Blogger的编辑器 所见即所得WYSIWYG 优化, 向class为ZW3ZFc的iframe注入自定义样式
// @author       You
// @match        https://www.blogger.com/blog/post/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function () {
    'use strict';

    const CSS_TO_INJECT = `
h2 {
  border-bottom: 1px solid #e8eaed;
  padding-bottom: 6px;
}

p {
  margin: 0.85em 0;
}

blockquote {
  margin: 1em 0;
  padding: 8px 16px;
  border-left: 4px solid #dadce0;
  color: #5f6368;
  background: #fafafa;
  line-height: 1.55;
}

code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas,
    "Liberation Mono", monospace;
  background: #f1f3f4;
  border-radius: 4px;
  padding: 2px 5px;
}

pre {
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 12px 14px;
  overflow-x: auto;
  line-height: 1.55;
}
`;

    function injectInto(doc) {
        if (!doc || doc.getElementById('tm-injected-style')) return;
        const style = doc.createElement('style');
        style.id = 'tm-injected-style';
        style.textContent = CSS_TO_INJECT;
        (doc.head || doc.documentElement).appendChild(style);
    }

    function tryInjectIframe(iframe) {
        try {
            const doc = iframe.contentDocument;
            if (doc && doc.readyState !== 'loading') {
                injectInto(doc);
            }
        } catch (e) {
            // 非同源,忽略
        }
    }

    function handleIframe(iframe) {
        // 立即尝试一次(可能已经加载完)
        tryInjectIframe(iframe);

        // 监听load事件(处理还未加载完或后续刷新的情况)
        iframe.addEventListener('load', () => tryInjectIframe(iframe));
    }

    function scanAndInject() {
        document.querySelectorAll('iframe.ZW3ZFc').forEach(handleIframe);
    }

    // 首次扫描
    scanAndInject();

    // 监听DOM变化,处理动态插入/重新渲染的iframe
    const observer = new MutationObserver(() => {
        scanAndInject();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });

})();
