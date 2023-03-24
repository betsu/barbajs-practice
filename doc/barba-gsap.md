# barba gsap 實作筆記

📄**搭配閱讀**  
GSAP → https://greensock.com/get-started/  
Docs → https://barba.js.org/docs/getstarted/intro/  
view transition source → https://glitch.com/edit/#!/simple-set-demos?path=1-cross-fade%2Findex.html%3A1%3A0

📄**必要知識**  
內文中只會簡單帶到一些說明，請先閱讀完再看此筆記。

---

由於是想要重製 view transition 的效果，HTML 及 base-styles.css 排版相關的部分就直接套用原本的程式碼。

<img src="barba-folder-structure.png" width="200px">

## 分析轉場

<img src="view-transition.gif" width="60%"><br>

可分成 header 及 content 兩個部分。

### header

共有兩個元素：標題 `.main-header-text` 及回上頁的圖示 `.back-icon`，各有不同的動畫展演方式。

- `.main-header-text` → 位移
- `.back-icon` → 淡入淡出

### content

共有兩個轉場動畫：主要內容的共用轉場及跨頁圖片的轉場。

- **主要內容的轉場動畫** → 淡出淡入 + 位移
- **跨頁圖片的轉場動畫** → 尺寸縮放 + 位移

## HTML 架構

📄**必要知識**  
[Markup](https://barba.js.org/docs/getstarted/markup/)

📄 **HTML 檔案**  
詳細頁 → [kimi.html](../src/barba-gsap/cats/kimi.html)、[senna.html](../src/barba-gsap/cats/senna.html)  
列表頁 → [index.html](../src/barba-gsap/index.html)

---

回到實作的 HTML，來加入 barba 相關結構。

頁面所有的 HTML 結構都要放在 `data-barba="wrapper"` 內。為了不想多一層結構，決定直接在 `<body>` 加上 `data-barba="wrapper"`。

```html
<body data-barba="wrapper">
	<header class="main-header">...</header>
	<main class="content">...</main>
</body>
```

現在所有的結構都放到 `data-barba="wrapper"` 裡面了，接下來要決定哪些區塊需要 barba 更新來作轉場效果，區塊要放在 `data-barba="container"` 內。

由於頁面整體都有轉場需求，新增一層 `<section data-barba="container">` 將 `<header>`、`<main>` 都放入其中。

```html
<body data-barba="wrapper">
	<section data-barba="container">
		<header class="main-header">...</header>
		<main class="content">...</main>
	</section>
</body>
```

為了可以分別設定各頁面的轉場，在 `data-barba="container"` 的同一層加上 `data-barba-namespace="唯一的頁面名稱"` ，即可作為 `transitions` 的啟動轉場規則。

以列表頁為例：

```html
<body data-barba="wrapper">
	<section data-barba="container" data-barba-namespace="list">
		<header class="main-header">...</header>
		<main class="content">...</main>
	</section>
</body>
```

列表頁：`data-barba-namespace="list"`  
詳細頁：`data-barba-namespace="detail"`

---

💡**注意**

新頁面需要轉場的內容會新增在 `data-barba="wrapper"` 的底部，可能會造成破版，在架構時需要小心。

---

## 基本的 js 設定

📄**必要知識**  
[Hooks](https://barba.js.org/docs/advanced/hooks/)  
[Transitions](https://barba.js.org/docs/advanced/transitions/)  
[Prevent](https://barba.js.org/docs/advanced/strategies/#Prevent)  
[Containers](https://barba.js.org/docs/advanced/recipes/#Containers)

📄 **js 檔案**  
主要設定檔 → [barba-gsap.js](../src/js/barba-gsap.js)

---

設定各頁面的轉場：

- 頁面轉場時點擊行為無效 → `preventRunning: true`
- 控制頁面細部轉場 → `name: "detail"`、`name: "list"`
- 轉場啟動規則 → `to: { namespace: "detail" }`、`to: { namespace: "list" }`
- 為了跨頁圖片轉場，頁面間的進退場要同時運行 → `sync: true`
- 需要的轉場 hooks → `leave:() => leaveTransition()`、`enter:() => enterTransition()`

```javascript
import barba from "@barba/core";

barba.init({
	preventRunning: true,
	transitions: [
		{
			name: "detail",
			to: {
				namespace: "detail",
			},
			sync: true,
			leave: ({ current }) => detailLeave(current.container),
			enter: ({ next }) => detailEnter(next.container),
		},
		{
			name: "list",
			to: {
				namespace: "list",
			},
			sync: true,
			leave: ({ current }) => listLeave(current.container),
			enter: ({ next }) => listEnter(next.container),
		},
	],
});
```

---

💡**注意**

官網對於 hooks 的 data 參數的說明：

| Property     | Type   | Description          |
| ------------ | ------ | -------------------- |
| data.current | Object | Current page related |
| data.next    | Object | Next page related    |

data.current 及 data.next 的內容是對應到 transitions 的規則，以 `to: { namespace: "detail" }` 為例：

| Property     | Description  |
| ------------ | ------------ |
| data.current | 目前所在頁面 |
| data.next    | 詳細頁       |

若以 `afterOnce() {}` 的行為來看，`to: { namespace: "detail" }` == 詳細頁的載入頁面完、`to: { namespace: "list" }` == 列表頁的載入頁面完成。若要取得載入頁面的資料，依照上述的規則就必須要使用 data.next 來取得。

---

## 設定轉場動畫

📄**必要知識**  
Getting Started with GSAP → [1](https://greensock.com/get-started/)、[2](https://greensock.com/get-started-2/)  
GSAP CustomEase → https://greensock.com/docs/v3/Eases/CustomEase

📄 **js 檔案**  
主要設定檔 → [barba-gsap.js](../src/js/barba-gsap.js)  
詳細頁 → [detail.js](../src/js/gsap/detail.js)  
列表頁 → [list.js](../src/js/gsap/list.js)

📄 **css 檔案**  
主要設定檔 → [barba-gsap.scss](../src/sass/barba-gsap.scss)

---

在一開始的[分析轉場](#分析轉場)中已經將範例的轉場做了拆解，接著就可以參照範例的 css 來設定 barba 的轉場動畫囉！

以下會分別在詳細頁 detail.js 及列表頁 list.js，實作各自需要的轉場動畫。

### `.main-header-text` → 位移

<img src="view-transition-main-header.png" width="400">

_view transition 前往詳細頁 `.main-header-text` 轉場設定_

<img src="view-transition-main-header2.png" width="400">

_view transition 前往列表頁 `.main-header-text` 轉場設定_

#### 轉換為 gsap

| prop     | value                                                                           |
| -------- | ------------------------------------------------------------------------------- |
| ease     | `CustomEase.create("cssEase", ".25, .1, .25, 1")`                               |
| duration | `0.25`                                                                          |
| x        | view transition 的原始定位點和 barba 的做法不同。先來看看進退場的版面變化為何。 |

<img src="main-header-css.png" width="400">

_header 區塊的變化及版面相關資訊_

從上圖獲得的資訊可以計算出 `.main-header-text` 的移動距離為： 31px（`.back-icon` 寬度） + 4.8px（`column-gap` 空間） = 35.8px。但實際測試 37px 效果會更好。

| prop     | value                                             |
| -------- | ------------------------------------------------- |
| ease     | `CustomEase.create("cssEase", ".25, .1, .25, 1")` |
| duration | `0.25`                                            |
| x        | `37`、`-37`                                       |

**detail.js**

`detailEnter()`

```javascript
import gsap from "gsap";
import CustomEase from "gsap/CustomEase";

gsap.registerPlugin(CustomEase);
CustomEase.create("cssEase", ".25, .1, .25, 1");

const detailEnter = (next) => {
	// next 是 next.container
	const content = next.querySelector("main");
	const headerTitle = next.querySelector(".main-header-text");
	const tl = gsap.timeline();

	tl.from(
		headerTitle,
		{
			x: -37,
			duration: 0.25,
			ease: "cssEase",
		},
		0
	);

	return tl;
};
```

**list.js**

`listLeave()`

```javascript
import gsap from "gsap";
import CustomEase from "gsap/CustomEase";

gsap.registerPlugin(CustomEase);
CustomEase.create("cssEase", ".25, .1, .25, 1");

const listLeave = (current) => {
	// current 是 current.container
	const content = current.querySelector("main");
	const headerTitle = current.querySelector(".main-header-text");
	const tl = gsap.timeline();

	tl.to(
		headerTitle,
		{
			x: -37,
			duration: 0.25,
			ease: "cssEase",
		},
		0
	);

	return tl;
};
```

### `.back-icon` → 淡入淡出

view transition 沒有特別的設定，但是以動畫統一性來看，`ease` 及 `duration` 可以和 `.main-header-text` 一樣。

#### 轉換為 css transition

| prop     | value                                             |
| -------- | ------------------------------------------------- |
| ease     | `CustomEase.create("cssEase", ".25, .1, .25, 1")` |
| duration | `0.25`                                            |
| opacity  | `0`、`1`                                          |

**detail.js**

`detailEnter()`

```javascript
import gsap from "gsap";
import CustomEase from "gsap/CustomEase";

gsap.registerPlugin(CustomEase);
CustomEase.create("cssEase", ".25, .1, .25, 1");

const detailEnter = (next) => {
	// next 是 next.container
	const headerTitle = next.querySelector(".main-header-text");
	const headerIcon = next.querySelector(".back-icon"); //新增
	const tl = gsap.timeline();

	//新增 headerIcon timeline
	tl.from(
		headerTitle,
		{
			x: -37,
			duration: 0.25,
			ease: "cssEase",
		},
		0
	).from(
		headerIcon,
		{
			opacity: 0,
			duration: 0.25,
			ease: "cssEase",
		},
		0
	);

	return tl;
};

export { detailEnter };
```

**list.js**

`listLeave()`

```javascript
import gsap from "gsap";
import CustomEase from "gsap/CustomEase";

gsap.registerPlugin(CustomEase);
CustomEase.create("cssEase", ".25, .1, .25, 1");

const listLeave = (current) => {
	// current 是 current.container
	const headerTitle = current.querySelector(".main-header-text");
	const headerIcon = current.querySelector(".back-icon"); //新增
	const tl = gsap.timeline();

	//新增 headerIcon timeline
	tl.to(
		headerTitle,
		{
			x: -37,
			duration: 0.25,
			ease: "cssEase",
		},
		0
	).to(
		headerIcon,
		{
			opacity: 0,
			duration: 0.25,
			ease: "cssEase",
		},
		0
	);

	return tl;
};

export { listLeave };
```

### 主要內容的轉場動畫 → 淡出淡入 + 位移

<img src="view-transition-main2.png" width="300">

_view transition 轉場動畫設定_

<img src="view-transition-main.png" width="500">

_進退場轉場設定_

#### 轉換為 gsap

**淡出**

| prop     | value                                             |
| -------- | ------------------------------------------------- |
| ease     | `CustomEase.create("fadeOutEase", ".4, 0, 1, 1")` |
| duration | ：`.09`                                           |
| opacity  | `0`、`1`                                          |

**淡入**

| prop     | value                                            |
| -------- | ------------------------------------------------ |
| ease     | `CustomEase.create("fadeInEase", "0, 0, .2, 1")` |
| duration | `.21`                                            |
| delay    | `.09`                                            |
| opacity  | `0`、`1`                                         |

**位移**

| prop     | value                                                |
| -------- | ---------------------------------------------------- |
| ease     | `CustomEase.create("TranslateEase", ".4, 0, .2, 1")` |
| duration | `300`                                                |
| x        | `30`、`-30`                                          |

**detail.js**

`detailLeave()`

```javascript
import gsap from "gsap";
import CustomEase from "gsap/CustomEase";

gsap.registerPlugin(CustomEase);
CustomEase.create("cssEase", ".25, .1, .25, 1");
CustomEase.create("TranslateEase", ".4, 0, .2, 1");
CustomEase.create("fadeOutEase", ".4, 0, 1, 1");
CustomEase.create("fadeInEase", "0, 0, .2, 1");

const detailLeave = (current) => {
	const content = current.querySelector("main");
	const tl = gsap.timeline();

	tl.to(
		content,
		{
			opacity: 0,
			duration: 0.09,
			ease: "fadeOutEase",
		},
		0
	).to(
		content,
		{
			x: -30,
			duration: 0.3,
			ease: "translateEase",
		},
		0
	);

	return tl;
};

export { detailLeave, detailEnter };
```

`detailEnter()`

```javascript
import gsap from "gsap";
import CustomEase from "gsap/CustomEase";

gsap.registerPlugin(CustomEase);
CustomEase.create("cssEase", ".25, .1, .25, 1");
CustomEase.create("TranslateEase", ".4, 0, .2, 1");
CustomEase.create("fadeOutEase", ".4, 0, 1, 1");
CustomEase.create("fadeInEase", "0, 0, .2, 1");

const detailEnter = (next) => {
	const content = next.querySelector("main"); //新增
	const headerTitle = next.querySelector(".main-header-text");
	const headerIcon = next.querySelector(".back-icon");
	const tl = gsap.timeline();

	//新增 content timeline
	tl.from(
		content,
		{
			opacity: 0,
			duration: 0.21,
			delay: 0.09,
			ease: "fadeInEase",
		},
		0
	)
		.from(
			content,
			{
				x: 30,
				duration: 0.3,
				ease: "translateEase",
			},
			0
		)
		.from(
			headerTitle,
			{
				x: -37,
				duration: 0.25,
				ease: "cssEase",
			},
			0
		)
		.from(
			headerIcon,
			{
				opacity: 0,
				duration: 0.25,
				ease: "cssEase",
			},
			0
		);

	return tl;
};

export { detailLeave, detailEnter };
```

**list.js**

`listLeave()`

```javascript
import gsap from "gsap";
import CustomEase from "gsap/CustomEase";

gsap.registerPlugin(CustomEase);
CustomEase.create("cssEase", ".25, .1, .25, 1");
CustomEase.create("TranslateEase", ".4, 0, .2, 1");
CustomEase.create("fadeOutEase", ".4, 0, 1, 1");
CustomEase.create("fadeInEase", "0, 0, .2, 1");

const listLeave = (current, next, url) => {
	const content = current.querySelector("main"); //新增
	const headerTitle = current.querySelector(".main-header-text");
	const headerIcon = current.querySelector(".back-icon");
	const tl = gsap.timeline();

	//新增 content timeline
	tl.to(
		content,
		{
			opacity: 0,
			duration: 0.09,
			ease: "fadeOutEase",
		},
		0
	)
		.to(
			content,
			{
				x: -30,
				duration: 0.3,
				ease: "translateEase",
			},
			0
		)
		.to(
			headerTitle,
			{
				x: -37,
				duration: 0.25,
				ease: "cssEase",
			},
			0
		)
		.to(
			headerIcon,
			{
				opacity: 0,
				duration: 0.25,
				ease: "cssEase",
			},
			0
		);

	return tl;
};

export { listLeave, listEnter };
```

`listEnter()`

```javascript
import gsap from "gsap";
import CustomEase from "gsap/CustomEase";

gsap.registerPlugin(CustomEase);
CustomEase.create("cssEase", ".25, .1, .25, 1");
CustomEase.create("TranslateEase", ".4, 0, .2, 1");
CustomEase.create("fadeOutEase", ".4, 0, 1, 1");
CustomEase.create("fadeInEase", "0, 0, .2, 1");

const listEnter = (next) => {
	const content = next.querySelector("main");
	const tl = gsap.timeline();

	tl.from(
		content,
		{
			opacity: 0,
			duration: 0.21,
			delay: 0.09,
			ease: "fadeInEase",
		},
		0
	).from(
		content,
		{
			x: 30,
			duration: 0.3,
			ease: "translateEase",
		},
		0
	);

	return tl;
};

export { listLeave, listEnter };
```

### 跨頁圖片的轉場動畫 → 尺寸縮放 + 位移

跨頁圖片的轉場效果是製作當中最複雜的一塊，由於 barba 的做法會讓圖片繼承主要內容的轉場效果，所以圖片會跟著淡出淡入。要能夠單獨設定圖片的解法就剩下複製 `<img>` 一途了。

複製的做法後面會說明，還是先來看看 view transition 的設定。

<img src="view-transition-img.png" width="400">

_view transition 前往詳細頁 `.banner-img` 轉場設定_

<img src="view-transition-img3.png" width="400">

_view transition 前往列表頁 `.banner-img` 轉場設定_

<img src="view-transition-img2.png" width="400">

_view transition `.banner-img` 進退場圖片尺寸設定_

#### 轉換為 gsap

**位移**

| prop     | value                                                                 |
| -------- | --------------------------------------------------------------------- |
| ease     | `CustomEase.create("cssEase", ".25, .1, .25, 1")`                     |
| duration | `0.25`                                                                |
| x        | view transition 的原始定位點和 barba 的做法不同，來看看版面變化為何。 |

<img src="view-transition-img-transform.png" width="600">

_版面相關資訊_

由於是 RWD 的版面，間距都需要用 js 抓取，先取好變數名。

**前往詳細頁的位移**

| prop     | value                                             |
| -------- | ------------------------------------------------- |
| ease     | `CustomEase.create("cssEase", ".25, .1, .25, 1")` |
| duration | `0.25`                                            |
| x        | `triggerImgData.left`、`0`                        |
| y        | `triggerImgData.top`、`triggerImgData.translateY` |

**前往列表頁的位移**

| prop     | value                                              |
| -------- | -------------------------------------------------- |
| ease     | `CustomEase.create("cssEase", ".25, .1, .25, 1")`  |
| duration | `0.25`                                             |
| x        | `0`、`triggerImgData.translateX`                   |
| y        | `triggerImgData.top` 、`triggerImgData.translateY` |

**圖片尺寸縮放**

| prop     | value                                                                                                                                                                                                                                         |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ease     | `CustomEase.create("cssEase", ".25, .1, .25, 1")`                                                                                                                                                                                             |
| duration | `0.25`                                                                                                                                                                                                                                        |
| size     | view transition 看起來是利用 `object-fit` 去做漸變，但是在 [Animatable CSS properties](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_animated_properties) 當中並沒有列出 `object-fit`，所以還是以 `width` 及 `height` 做為轉場的設定。 |

<img src="view-transition-img-size.png" width="600">

_圖片尺寸相關資訊_

由於是 RWD 的版面，和位移的距離一樣，圖片尺寸也需要用 js 抓取，先取好變數名稱。

**前往詳細頁圖片尺寸縮放**

| prop     | value                                             |
| -------- | ------------------------------------------------- |
| ease     | `CustomEase.create("cssEase", ".25, .1, .25, 1")` |
| duration | `0.25`                                            |
| width    | `triggerImgData.width`、`"100%"`                  |
| height   | `triggerImgData.height`、` triggerImgData.scaleY` |

**前往列表頁圖片尺寸縮放**

| prop     | value                                             |
| -------- | ------------------------------------------------- |
| ease     | `CustomEase.create("cssEase", ".25, .1, .25, 1")` |
| duration | `0.25`                                            |
| width    | `triggerImgData.width`、`triggerImgData.scaleX`   |
| height   | `triggerImgData.height`、`triggerImgData.scaleY`  |

先將 timeline 完成，target 的部分：複製出來的跨頁圖片，先取好變數名稱 `transitionImg` 之後就可以直接使用。

**detail.js**

`detailLeave()`

```javascript
import gsap from "gsap";
import CustomEase from "gsap/CustomEase";

gsap.registerPlugin(CustomEase);
CustomEase.create("cssEase", ".25, .1, .25, 1");
CustomEase.create("TranslateEase", ".4, 0, .2, 1");
CustomEase.create("fadeOutEase", ".4, 0, 1, 1");
CustomEase.create("fadeInEase", "0, 0, .2, 1");

const detailLeave = (current) => {
	const content = current.querySelector("main");
	const tl = gsap.timeline();

	//新增 transitionImg timeline
	tl.to(
		content,
		{
			opacity: 0,
			duration: 0.09,
			ease: "fadeOutEase",
		},
		0
	)
		.to(
			content,
			{
				x: -30,
				duration: 0.3,
				ease: "translateEase",
			},
			0
		)
		.fromTo(
			transitionImg,
			{
				width: triggerImgData.width,
				height: triggerImgData.height,
				x: triggerImgData.left,
				y: triggerImgData.top,
			},
			{
				width: "100%",
				height: triggerImgData.scaleY,
				x: 0,
				y: triggerImgData.translateY,
				duration: 0.25,
				ease: "cssEase",
			},
			0
		);

	return tl;
};
```

**list.js**

```javascript
import gsap from "gsap";
import CustomEase from "gsap/CustomEase";

gsap.registerPlugin(CustomEase);
CustomEase.create("cssEase", ".25, .1, .25, 1");
CustomEase.create("TranslateEase", ".4, 0, .2, 1");
CustomEase.create("fadeOutEase", ".4, 0, 1, 1");
CustomEase.create("fadeInEase", "0, 0, .2, 1");

const listLeave = (current, next, url) => {
	const content = current.querySelector("main");
	const headerTitle = current.querySelector(".main-header-text");
	const headerIcon = current.querySelector(".back-icon");
	const tl = gsap.timeline();

	//新增 transitionImg timeline
	tl.to(
		content,
		{
			opacity: 0,
			duration: 0.09,
			ease: "fadeOutEase",
		},
		0
	)
		.to(
			content,
			{
				x: -30,
				duration: 0.3,
				ease: "translateEase",
			},
			0
		)
		.to(
			headerTitle,
			{
				x: -37,
				duration: 0.25,
				ease: "cssEase",
			},
			0
		)
		.to(
			headerIcon,
			{
				opacity: 0,
				duration: 0.25,
				ease: "cssEase",
			},
			0
		)
		.fromTo(
			transitionImg,
			{
				width: triggerImgData.width,
				height: triggerImgData.height,
				x: 0,
				y: triggerImgData.top,
			},
			{
				width: triggerImgData.scaleX,
				height: triggerImgData.scaleY,
				x: triggerImgData.translateX,
				y: triggerImgData.translateY,
				duration: 0.25,
				ease: "cssEase",
			},
			0
		);

	return tl;
};
```

下一段會詳細說明跨頁圖片的實作過程。

## 處理跨頁圖片

📄 **js 檔案**  
主要設定檔 → [barba-css.js](../src/js/barba-css.js)  
詳細頁 → [detail.js](../src/js/css/detail.js)  
列表頁 → [list.js](../src/js/css/list.js)

📄 **css 檔案**  
主要設定檔 → [barba-css.scss](../src/sass/barba-css.scss)

---

在上一段的設定轉場動畫當中，有說到圖片的轉場需要先複製 `<img>` 後再設定轉場相關的樣式。這一段會詳細解說實作的過程。

在實作之前先把流程梳理一遍。

**當按下前往詳細頁的連結時**

1. 複製連結裡的圖片 `<img>` 並新增至 `data-barba="wrapper"` 內的最上方
2. 圖片加上 `.transitionImg` class（圖片基本樣式）
3. 取得轉場圖片預設資訊及轉場資訊
4. 轉場運行

**當按下前往列表頁的連結時**

1. 複製列表頁的圖片 `<img>` 並新增至 `data-barba="wrapper"` 內的最上方
2. 圖片加上 `.transitionImg` class（圖片基本樣式）
3. 取得轉場圖片預設資訊及轉場資訊
4. 轉場運行

順著這些流程一步一步的製作吧。

在編寫 js 前先到 barba-gsap.scss 設定圖片 `transitionImg` 的樣式，設定重點在 `object-fit: cover` 及 `aspect-ratio: 1/1`，這是為了讓圖片在不同比例轉換時不變形。

```css
.transitionImg {
	position: fixed;
	z-index: 2;
	object-fit: cover;
	object-position: center center;
	aspect-ratio: 1/1;
	transform-origin: 50% 100%;
	overflow: clip;
	pointer-events: none;
}
```

### 當按下前往詳細頁的連結時

> 1. 複製連結裡的圖片 `<img>` 並新增至 `data-barba="wrapper"` 內的最上方
> 2. 圖片加上 `.transitionImg` class
> 3. 取得轉場圖片預設資訊及轉場資訊
> 4. 轉場運行

**detail.js**

在 `detailLeave()` 增加複製圖片及取得圖片資訊的程式。

```javascript
const detailLeave = (current, next, trigger) => {
	// 原本的code....

	const transitionImg = next.querySelector(".banner-img img").cloneNode();
	const triggerImgData = Object.assign(
		trigger.querySelector("img").getBoundingClientRect(),
		{
			scaleY: document.body.clientWidth * 0.5625,
			translateY: next.querySelector(".main-header").getBoundingClientRect()
				.height,
		}
	);
};
```

回到 barba-css.js，修改 `name: "detail"` 的 `leave ()` 參數。

**barba-css.js**

```javascript
barba.init({
	preventRunning: true,
	transitions: [
		{
			name: "detail",
			to: {
				namespace: "detail",
			},
			sync: true,
			leave: ({ current, next, trigger }) =>
				detailLeave(current.container, next.container, trigger),
			enter: ({ next }) => detailEnter(next.container),
		},
		...
	],
});
```

### 當按下前往列表頁的連結時

> 1. 複製列表頁的圖片 `<img>` 並新增至 `data-barba="wrapper"` 內的最上方
> 2. 圖片加上 `.transitionImg` class（圖片基本樣式）
> 3. 取得轉場圖片預設資訊及轉場資訊
> 4. 轉場運行

**list.js**

在 `detailLeave()` 增加複製圖片及取得圖片資訊的程式。

```javascript
const listLeave = (current, next, url) => {
	// 原本的code...

	const triggerUrl = url.path;
	const triggerImg = Array.from(next.querySelectorAll(".gallery img")).find(
		(element) => {
			const regexp = new RegExp(element.parentElement.getAttribute("href"));

			return regexp.test(triggerUrl);
		}
	);
	const transitionImg = triggerImg.cloneNode(true);
	const galleryImgData = triggerImg.getBoundingClientRect();
	const triggerImgData = Object.assign(
		current.querySelector(".banner-img img").getBoundingClientRect(),
		{
			scaleX: galleryImgData.width,
			scaleY: galleryImgData.height,
			translateX: galleryImgData.left,
			translateY: galleryImgData.top,
		}
	);

	transitionImg.classList.add("transitionImg");
	current.insertAdjacentElement("afterbegin", transitionImg);
};
```

回到 barba-css.js，修改 `name: "list"` 的 `leave ()` 參數。

**barba-css.js**

```javascript
barba.init({
	preventRunning: true,
	transitions: [
		{
			name: "list",
			to: {
				namespace: "list",
			},
			sync: true,
			leave: ({ current, next }) =>
				listLeave(current.container, next.container, current.url),
			enter: ({ next }) => listEnter(next.container),
		},
		...
	],
});
```

## 確認效果及調整

📄 **js 檔案**  
主要設定檔 → [barba-css.js](../src/js/barba-gsap.js)  
詳細頁 → [detail.js](../src/js/gsap/detail.js)  
列表頁 → [list.js](../src/js/gsap/list.js)

📄 **css 檔案**  
主要設定檔 → [barba-gsap.scss](../src/sass/barba-gsap.scss)

---

感覺上都做的差不多了，來看看目前的樣子

<img src="temp-demo-gsap.gif" width="300"><br>

暫停轉場來比對一下程式碼

<img src="temp-demo-gsap-html.png"><br>

從畫面和程式碼的比對中，發現到是因為設定了 `sync:true` 所以進退場會同時進行，於是就形成了目前畫面上同時有新舊內容的存在。而且也注意到了新的內容的確是會被新增到 `data-barba="wrapper"` 的底部。

### 讓新舊內容位置一致

那麼該如何藉解決這個問題呢？在官網的說明文件 [ADVANCED/Recipes/Container](https://barba.js.org/docs/advanced/recipes/#Containers) 中有提到：

> `position: absolute`: keep containers superimposed, this is useful when making a sync (crossfade) transition

看起來只需要將新舊內容的 `data-barba="container"` 都加上 `position: absolute` 即可解決。`width:100%` 一定要加上，這樣頁面才會有正常的寬度。

**barba-gsap.scss**

```css
[data-barba="container"] {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
}
```

確認效果。

<img src="temp-demo-gsap-absolute.gif" width="300"><br>

感覺順暢多了，但是回到列表頁的 header 轉場卻是 icon 直接消失。

### 調整前往列表頁退場內容的 z-index

由於剛才將 `data-barba="container"` 都加上了 `position: absolute`，這造成了新內容都在舊內容的上層。那為什麼只有 header 看起來受影響？是因為主要內容有淡出淡入的效果，間接地變成只有 header 被影響到。

那只要將前往列表頁退場內容的 `z-index` 提升就可以解決這個問題。

在列表頁退場時加上 `.listLeave` class，用這個 class 來設定。

**list.js**

修改 `listLeave()`。

```javascript
const listLeave = (current, next, url) => {
	// 原本的code...

	current.classList.add("listLeave");
};
```

**barba-gsap.scss**

```css
.listLeave {
	z-index: 1;
}
```

確認結果。

<img src="temp-demo-gsap-zindex.gif" width="300"><br>

看起來很不錯呢！

優化到這邊基本上是差不多了，不過還有一些細節可以調整：

- 跨頁圖片轉場時將原本的底圖隱藏，轉場後再出現
- 轉場時調整 scroll 位置

### 跨頁圖片轉場時原本的底圖隱藏，轉場後再出現

雖然畫面上不是看得拿麼清楚，但是跨頁圖片轉場並不是使用原本的圖片進行，所以會產生上圖的交疊狀態，眼睛比較利的人看起來效果就會不夠順暢。為了讓轉場更為順暢，就必須在轉場發生時隱藏原本的圖片，等到轉場完成後在把新內容的圖片展示出來。

在寫程式前先整理一下兩個情境需要的效果：

**前往詳細頁**

1. 列表頁的退場，將選定的連結圖片隱藏
2. 詳細頁的進場，大張主視覺隱藏
3. 轉場完成，詳細頁大張主視覺出現

**前往列表頁**

1. 詳細頁的退場，大張主視覺隱藏
2. 列表頁的進場，將原先連結的圖片隱藏
3. 轉場完成，列表頁原先連結的圖片出現

可以利用剛剛設定列表頁退場 z-index 的方法，在 `data-barba="container"` 這一層新增進退場 class，再另外對於需要隱藏的圖片進行樣式設定。列表頁的圖片是按下連結和對照後才會確定是哪一張，所以在列表頁的圖片也需要另外增加 class `.triggerImg` 來辨識。

**detail.js**

```javascript
const detailLeave = (current, next, trigger) => {
	// 原本的code....

	triggerImg.classList.add("triggerImg");
	current.classList.add("detailLeave");
};

const detailEnter = (next) => {
	// 原本的code....

	next.classList.add("detailEnter");
};
```

**list.js**

```javascript
const listLeave = (current, next, url) => {
	// 原本的code...

	triggerImg.classList.add("triggerImg");
	current.classList.add("listLeave");
};

const listEnter = (next) => {
	// 原本的code....

	next.classList.add("listEnter");
};
```

**barba-gsap.scss**

```css
.detailEnter .banner-img img {
	opacity: 0;
}

.listLeave .banner-img img {
	opacity: 0;
}

.detailLeave .triggerImg,
.listEnter .triggerImg {
	opacity: 0;
}
```

### 轉場時調整 scroll 位置

目前轉場後頁面的 scroll 位置都是根據內容自動定義的，基本上看到的都是固定到最上方再進行轉場。

但如果從詳細頁回到列表頁的時候，會希望是回到列表頁當時按下連結的 scroll 位置，而不是最上方。

**barba-gsap.js**

```javascript
barba.hooks.beforeLeave(() => {
	window.scrollTo(0, barba.history.previous.scroll.y);
});
```

最終結果。

<img src="demo-complete-gsap.gif" width="300">

## 後記

gsap 版是在 CSS Plugin 後製作的，主要是想感受一下不同之處在哪邊。做完之後真心覺得，如果是要做複雜的轉場效果，還是使用官方推薦的 animation library 來製作，在效率上跟 CSS Plugin 相比是好上許多。也不用處理太多繁雜的問題。

不過可以的話還是推薦大家兩種方式都可以寫寫看，感受一下不同之處，在專案的使用上可以挑選更合適的方法來製作。
