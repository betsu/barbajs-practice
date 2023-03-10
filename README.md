# barba.js å­¸ç¿ç­è¨

ð [å¯¦ä½åè¡¨](#å¯¦ä½ç·´ç¿)

## èµ·å¿åå¿µ

2014-2015 å¹´å¨é±è®å­¸ç¿ [Material Design](https://m3.material.io/) ç¬¬ä¸ççæåï¼çå° [motion](https://m3.material.io/styles/motion/transitions/transition-patterns) ç« ç¯å°æ¼äºåè½å ´çæºåéå¸¸çæèè¶£ãä½æ¯ç¤æ¼ç¶æçæè¡ï¼è¦åå°çæ³ä¸­çäºåææï¼éæ¯åªè½æå§å®¹å¨é¨å¡å¨åä¸é ï¼å¦é¡ SPAðï¼æè½éæï¼æä»¥ç¶æéæ¯åªè½å¨ campaign site å¯¦ä½å±å¤ã

æ­²æçæµé...

çµæ¼å¨ 2022 å¹´ç google I/O ä¸ï¼google ç¼è¡¨äºä¸åå¯¦é©æ§ç APIï¼**view transition**ã

## view transition API

**å­¸ç¿è³æº**  
youtube â https://youtu.be/JCJUPJ_zDQ4  
å®æ´ä»ç´¹ â https://goo.gle/3yrbzrS  
W3C â https://www.w3.org/TR/css-view-transitions-1/

---

view transition çéä½æ¹å¼ï¼æ¯å°èé é¢ snapshot ä¿å­èµ·ä¾ï¼åå©ç¨ CSS å®ç¾©ä¸­ç [Replaced Elements](https://developer.mozilla.org/en-US/docs/Web/CSS/Replaced_element)ï¼exï¼`<img>`ï¼å°æ°é é¢ç HTML åèé é¢ç snapshotï¼åæåç¾å¨ç«é¢ä¸ã

```
::view-transition
ââ ::view-transition-group (root)
   ââ ::view-transition-image-pair (root)
      ââ ::view-transition-old (root)
      ââ ::view-transition-new (root)
```

view transition é è¨­çè½å ´æææ¯æ·¡åºæ·¡å¥ãèé é¢ï¼snapshotï¼ç± `opacity:1` è½è®çº `opacity:0`ï¼æ°é é¢ï¼HTMLï¼ç± `opacity:0` è½è®çº `opacity:1`ï¼ä¾éæè½å ´ææã  
ç±æ¼è½å ´æ¯å©ç¨ CSS å¯¦ä½ï¼å æ­¤ä¹å¯ä»¥ä½¿ç¨ CSS ä¾å®¢è£½è½å ´ææã

ä¸é view transition ç¢ç«éåªæ¯ google çå¯¦é©æ§ APIï¼æçµæ¯å¦è½æçºæ¨æºè¦æ ¼éæ¯æå¾é·çä¸æ®µè·¯...

## barba.js

**å­¸ç¿è³æº**  
å®ç¶² â https://barba.js.org/  
youtube æå­¸ ð â https://youtube.com/playlist?list=PLkEZWD8wbltmopvSzUvXw9itOosGXPEJ6

---

å¨ 2016 å¹´çæåï¼barba ä¸»è¦çéç¼èå¨ [Smashing Magazine](https://www.smashingmagazine.com/) ç¼è¡¨äºä¸ç¯ [Improving User Flow Through Page Transitions](https://www.smashingmagazine.com/2016/07/improving-user-flow-through-page-transitions/?utm_source=pocket_saves) çæç« ï¼ä¸¦ä¸å°æç« å§çæ¦å¿µå¯¦ä½æ libraryï¼é£å°±æ¯ barba.js

barba.js çå¯¦ä½æ¯ä¸»è¦æ¯éç¨ [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) å [History API](https://developer.mozilla.org/en-US/docs/Web/API/History_API) ä¾éæçã

åç¨ Fetch API ç²åæ°é é¢ç HTMLï¼ä¸¦å°åå¾ç HTML æ°å¢è³èé é¢ç¶ä¸­ï¼åæå·è¡è½å ´ææï¼å¾è½å ´å®æå¾ï¼åä½¿ç¨ History API æ´æ° URL è·³è½å°çå¯¦çæ°é é¢ã

[![](https://barba.js.org/assets/diagram/lifecycle.png)_barba Lifecycle_](https://barba.js.org/assets/diagram/lifecycle.png)

å¦æ­¤ä¸ä¾å°±å¯ä»¥ç²å¾å view transition å¹¾ä¹å¯ä»¥èªªæ¯ä¸æ¨¡ä¸æ¨£çææã

å¨æ²ææ¨æºè¦æ ¼ä¹åé½å¯ä»¥ä½¿ç¨ barba.js ä¾è£½ä½æµæ¢ä¸èé©çé é¢è½æã

---

**æéº¼ç¥é barba çé¡å¤è©±...**

å¨ 2023 çè¾²æå¹´åï¼æ­£å¥½æéå°æ¡é½åä¸æ®µè½ï¼æ³èªªå¥½ä¹æ²æççç¶²ç«ä½åä¾åºæ¿ä¸ä¸èªå·±ï¼æ­£å¥½å°±çå°äºä¸ååæå¾æ»é çç¶²ç« [pilot.auto](https://pilot.auto/)

<img src="doc/pilot-auto-demo.gif" width="60%">

<!-- <figure class="video_container" style="width:60%">
  <video controls="false" allowfullscreen="true" src="doc/pilot-auto-demo.mp4" >
  </video>
</figure> -->

èº«çºä¸ååç«¯å·¥ç¨å¸«ï¼ç¶ç¶å°±æ¯è¦ç¨ devtools æ¥çï¼å°åºæ¯ç¨äºçéº¼ç¥å¥çå¥ä»¶åå°éåææçï¼å°±æ¾å°äº barba.js éåç¥å¥çæ±è¥¿ ð

![](doc/barbajs.png)

é¼åµå¤§å®¶å¤ééç¶²ç«ç¼ç¾æ°æ±è¥¿

## å¯¦ä½ç·´ç¿

ç¨ barba.js éè£½ view transition çç¯ä¾ï¼[Demo](https://simple-set-demos.glitch.me/7-expanding-image-ratio/) [Source](https://glitch.com/edit/#!/simple-set-demos?path=7-expanding-image-ratio%2Fstyles.css%3A59%3A0)

<img src="doc/view-transition.gif" width="60%">

- [barba-css](http://labs.docs.isobar.tw/snow/barba/barba-css)
  - å¿å¾
- barba-gsap
  - å¿å¾
