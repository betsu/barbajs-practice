# barba.js 學習筆記

👉 [實作列表](#實作練習)

## 起心動念

2014-2015 年在閱讀學習 [Material Design](https://m3.material.io/) 第一版的時候，看到 [motion](https://m3.material.io/styles/motion/transitions/transition-patterns) 章節對於互動轉場的準則非常的感興趣。但是礙於當時的技術，要做到理想中的互動效果，還是只能把內容全部塞在同一頁（另類 SPA😂）才能達成，所以當時還是只能在 campaign site 實作居多。

歲月的流逝...

終於在 2022 年的 google I/O 上，google 發表了一個實驗性的 API：**view transition**。

## view transition API

**學習資源**  
youtube → https://youtu.be/JCJUPJ_zDQ4  
完整介紹 → https://goo.gle/3yrbzrS  
W3C → https://www.w3.org/TR/css-view-transitions-1/

---

view transition 的運作方式：是將舊頁面 snapshot 保存起來，再利用 CSS 定義中的 [Replaced Elements](https://developer.mozilla.org/en-US/docs/Web/CSS/Replaced_element)（ex：`<img>`）將新頁面的 HTML 及舊頁面的 snapshot，同時呈現在畫面上。

```
::view-transition
└─ ::view-transition-group (root)
   └─ ::view-transition-image-pair (root)
      ├─ ::view-transition-old (root)
      └─ ::view-transition-new (root)
```

view transition 預設的轉場效果是淡出淡入。舊頁面（snapshot）由 `opacity:1` 轉變為 `opacity:0`，新頁面（HTML）由 `opacity:0` 轉變為 `opacity:1`，來達成轉場效果。  
由於轉場是利用 CSS 實作，因此也可以使用 CSS 來客製轉場效果。

不過 view transition 畢竟還只是 google 的實驗性 API，最終是否能成為標準規格還是有很長的一段路...

## barba.js

**學習資源**  
官網 → https://barba.js.org/  
youtube 教學 👍 → https://youtube.com/playlist?list=PLkEZWD8wbltmopvSzUvXw9itOosGXPEJ6

---

在 2016 年的時候，barba 主要的開發者在 [Smashing Magazine](https://www.smashingmagazine.com/) 發表了一篇 [Improving User Flow Through Page Transitions](https://www.smashingmagazine.com/2016/07/improving-user-flow-through-page-transitions/?utm_source=pocket_saves) 的文章，並且將文章內的概念實作成 library，那就是 barba.js

barba.js 的實作是主要是運用 [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) 及 [History API](https://developer.mozilla.org/en-US/docs/Web/API/History_API) 來達成的。

先用 Fetch API 獲取新頁面的 HTML，並將取得的 HTML 新增至舊頁面當中，同時執行轉場效果，待轉場完成後，再使用 History API 更新 URL 跳轉到真實的新頁面。

[![](https://barba.js.org/assets/diagram/lifecycle.png)_barba Lifecycle_](https://barba.js.org/assets/diagram/lifecycle.png)

如此一來就可以獲得和 view transition 幾乎可以說是一模一樣的效果。

在沒有標準規格之前都可以使用 barba.js 來製作流暢且舒適的頁面轉換。

---

**怎麼知道 barba 的題外話...**

在 2023 的農曆年前，正好手邊專案都告一段落，想說好久沒有看看網站作品來刺激一下自己，正好就看到了一個動態很滑順的網站 [pilot.auto](https://pilot.auto/)

<figure class="video_container" style="width:60%">
  <video controls="false" allowfullscreen="true" src="doc/pilot-auto-demo.mp4" >
  </video>
</figure>

身為一個前端工程師，當然就是要用 devtools 查看，到底是用了甚麼神奇的套件做到這個效果的，就找到了 barba.js 這個神奇的東西 😊

![](doc/barbajs.png)

鼓勵大家多逛逛網站發現新東西

## 實作練習

用 barba.js 重製 view transition 的範例

**view transition**：
[Demo](https://simple-set-demos.glitch.me/7-expanding-image-ratio/) [Source](https://glitch.com/edit/#!/simple-set-demos?path=7-expanding-image-ratio%2Fstyles.css%3A59%3A0)

<figure class="video_container" style="width:60%">
  <video controls="false" allowfullscreen="true" src="https://storage.googleapis.com/web-dev-uploads/video/CZmpGM8Eo1dFe0KNhEO9SGO8Ok23/gXiaS9IpE70fnv4kkrK5.mp4" >
  </video>
</figure>

- [barba-css](http://labs.docs.isobar.tw/snow/barba/barba-css)
  - [心得](doc/barba-css.md)
