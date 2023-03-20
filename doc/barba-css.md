# barba css plugin 實作筆記

📄**搭配閱讀**  
Docs → https://barba.js.org/docs/getstarted/intro/  
Plugin → [@barba/css](https://barba.js.org/docs/plugins/css/)  
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
詳細頁 → [kimi.html](../src/barba-css/cats/kimi.html)、[senna.html](../src/barba-css/cats/senna.html)  
列表頁 → [index.html](../src/barba-css/index.html)

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

## 引入 @barba/css，用 css 定義轉場動畫

📄**必要知識**  
[Hooks](https://barba.js.org/docs/advanced/hooks/)  
[Transitions](https://barba.js.org/docs/advanced/transitions/)  
[Prevent](https://barba.js.org/docs/advanced/strategies/#Prevent)  
[Containers](https://barba.js.org/docs/advanced/recipes/#Containers)  
[@barba/css](https://barba.js.org/docs/plugins/css/)

📄 **js 檔案**  
主要設定檔 → [barba-css.js](../src/js/barba-css.js)

---

### 基本的 js 設定

在 barba-css.js 中引用 barba 主程式及 CSS Plugin。

```javascript
import barba from "@barba/core";
import barbaCss from "@barba/css";

barba.use(barbaCss);
```

設定各頁面的轉場：

- 頁面轉場時點擊行為無效 → `preventRunning: true`
- 控制頁面細部轉場 → `name: "detail"`、`name: "list"`
- 轉場啟動規則 → `to: { namespace: "detail" }`、`to: { namespace: "list" }`
- 為了跨頁圖片轉場，頁面間的進退場要同時運行 → `sync: true`
- 需要的轉場 hooks → `leave() {}`、`enter() {}`

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
			leave() {},
			enter() {},
		},
		{
			name: "list",
			to: {
				namespace: "list",
			},
			sync: true,
			leave() {},
			enter() {},
		},
	],
});
```

---

💡**注意**

`to: { namespace: "detail" }`、`to: { namespace: "list" }` 的意思是：前往 detail/list 頁面。

---

### 關於 @barba/css 的運作

@barba/css 是靠著 class 來執行 css transition 轉場動畫，class 會在 `data-barba="container"` 這一層被新增/移除來達成轉場效果。

@barba/css 預設的轉場 class：

```css
/* 瀏覽器第一次載入 */
.barba-once {
	/* 轉場最初的 css 屬性 */
}
.barba-once-active {
	/* css transition 設定 */
}
.barba-once-to {
	/* 轉場最終的 css 屬性 */
}

/* 退場 */
.barba-leave {
}
.barba-leave-active {
}
.barba-leave-to {
}

/* 進場 */
.barba-enter {
}
.barba-enter-active {
}
.barba-enter-to {
}
```

嗯...class 名稱感覺有一些規則可循，大概可以整理成這樣：`[prefix]-[transition-hooks]`。

對應到剛剛 js 的設定：

- `prefix` → `name`
- `transition-hooks` → `leave(){}`、`enter(){}`

可以得到以下的 class 來做兩個頁面的詳細轉場設定：

- 前往詳細頁 → 列表頁的退場：`detail-leave` `detail-leave-active` `detail-leave-to`
- 前往詳細頁 → 詳細頁的進場：`detail-enter` `detail-enter-active` `detail-enter-to`
- 前往列表頁 → 詳細頁的退場：`list-leave` `list-leave-active` `list-leave-to`
- 前往列表頁 → 列表頁的進場：`list-enter` `list-enter-active` `list-enter-to`

---

💡**注意**

當 `transitions` 有設定 `name` 的時後，預設的 barba class 就不會被使用了唷！

---

## 設定轉場動畫

📄 **css 檔案**  
主要設定檔 → [barba-style.scss](../src/sass/barba-css.scss)  
詳細頁 → [detail.scss](../src/sass/detail.scss)  
列表頁 → [list.scss](../src/sass/list.scss)

---

在一開始的[分析轉場](#分析轉場)中已經將範例的轉場做了拆解，接著就可以參照範例的 css 來設定 barba 的轉場動畫囉！

以下會分別在詳細頁 detail.scss 及列表頁 list.scss，實作各自需要的樣式。

### `.main-header-text` → 位移

<img src="view-transition-main-header.png" width="400">

_view transition 前往詳細頁 `.main-header-text` 轉場設定_

<img src="view-transition-main-header2.png" width="400">

_view transition 前往列表頁 `.main-header-text` 轉場設定_

#### 轉換為 css transition

- ease：`ease`
- duration：`0.25s`
- transform：view transition 的原始定位點和 barba 的做法不同。先來看看進退場的版面變化為何。

<img src="main-header-css.png" width="400">

_header 區塊的變化及版面相關資訊_

從上圖獲得的資訊可以計算出 `.main-header-text` 的移動距離為： 31px（`.back-icon` 寬度） + 4.8px（`column-gap` 空間） = 35.8px。但實際測試 37px 效果會更好。

- ease：`ease`
- duration：`0.25s`
- transform： `translateX(37px)`、`translateX(-37px)`

**detail.scss**

```css
.detail-leave-active .main-header-text,
.detail-enter-active .main-header-text {
	transition: transform 250ms ease;
}

.detail-leave-to .main-header-text {
	transform: translateX(37px);
}

.detail-enter .main-header-text {
	transform: translateX(-37px);
}

.detail-enter-to .main-header-text {
	transform: translateX(0);
}
```

**list.scss**

```css
.list-leave-active .main-header-text,
.list-enter-active .main-header-text {
	transition: transform 250ms ease;
}

.list-leave .main-header-text {
	transform: translateX(0);
}

.list-leave-to .main-header-text {
	transform: translateX(-37px);
}

.list-enter .main-header-text {
	transform: translateX(37px);
}

.list-enter-to .main-header-text {
	transform: translateX(0);
}
```

### `.back-icon` → 淡入淡出

view transition 沒有特別的設定，但是以動畫統一性來看，`ease` 及 `duration` 可以和 `.main-header-text` 一樣。

#### 轉換為 css transition

- ease：`ease`
- duration：`0.25s`
- opacity： `0`、`1`

**detail.scss**

```css
.detail-enter-active .back-icon {
	transition: opacity 250ms ease;
}

.detail-enter .back-icon {
	opacity: 0;
}

.detail-enter-to .back-icon {
	opacity: 1;
}
```

**list.scss**

```css
.list-leave-active .back-icon {
	transition: opacity 250ms ease;
}

.list-leave .back-icon {
	opacity: 1;
}

.list-leave-to .back-icon {
	opacity: 0;
}
```

### 主要內容的轉場動畫 → 淡出淡入 + 位移

<img src="view-transition-main2.png" width="300">

_view transition 轉場動畫設定_

<img src="view-transition-main.png" width="500">

_進退場轉場設定_

#### 轉換為 css transition

**淡出**

- ease：`cubic-bezier(0.4, 0, 1, 1)`
- duration：`90ms`
- opacity：`0`、`1`

**淡入**

- ease：`cubic-bezier(0, 0, 0.2, 1)`
- duration：`210ms`
- delay：`90ms`
- opacity：`0`、`1`

**位移**

- ease：`cubic-bezier(0.4, 0, 0.2, 1)`
- duration：`300ms`
- transform：`translateX(30px)`、`translateX(-30px)`

**detail.scss**

```css
.detail-leave-active main {
	transition: opacity 90ms cubic-bezier(0.4, 0, 1, 1), transform 300ms
			cubic-bezier(0.4, 0, 0.2, 1);
}

.detail-leave-to main {
	opacity: 0;
	transform: translateX(-30px);
}

.detail-enter-active main {
	transition: opacity 210ms cubic-bezier(0, 0, 0.2, 1) 90ms, transform 300ms
			cubic-bezier(0.4, 0, 0.2, 1);
}

.detail-enter main {
	opacity: 0;
	transform: translateX(30px);
}

.detail-enter-to main {
	opacity: 1;
}
```

**list.scss**

```css
.list-leave-active main {
	transition: opacity 90ms cubic-bezier(0.4, 0, 1, 1), transform 300ms
			cubic-bezier(0.4, 0, 0.2, 1);
}

.list-leave-to main {
	opacity: 0;
	transform: translateX(-30px);
}

.list-enter-active main {
	transition: opacity 210ms cubic-bezier(0, 0, 0.2, 1) 90ms, transform 300ms
			cubic-bezier(0.4, 0, 0.2, 1);
}

.list-enter main {
	opacity: 0;
	transform: translateX(30px);
}

.list-enter-to main {
	opacity: 1;
}
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

#### 轉換為 css transition

**位移**

- ease：`ease`
- duration：`0.25s`
- transform：view transition 的原始定位點和 barba 的做法不同，來看看版面變化為何。

<img src="view-transition-img-transform.png" width="600">

_版面相關資訊_

由於是 RWD 的版面，除了 header 的高度是固定的之外，其他的間距都需要用 js 抓取。實作的部分先設定 css variable 再用 js 塞值。

**前往詳細頁的位移**

- ease：`ease`
- duration：`0.25s`
- transform：`translate(var(--gallery-translateX), var(--gallery-translateY))`

**前往列表頁的位移**

- ease：`ease`
- duration：`0.25s`
- transform：`translate(var(--banner-translateX), var(--banner-translateY))`

**圖片尺寸縮放**

- ease：`ease`
- duration：`0.25s`
- size：view transition 看起來是利用 `object-fit` 去做漸變，但是在 [Animatable CSS properties](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_animated_properties) 當中並沒有列出 `object-fit`，所以還是以 `width` 及 `height` 做為轉場的設定。

<img src="view-transition-img-size.png" width="600">

_圖片尺寸相關資訊_

由於是 RWD 的版面，和位移的距離一樣，圖片尺寸也需要用 js 抓取，實作一樣先設定 css variable，再用 js 塞值。

**前往詳細頁圖片尺寸縮放**

- ease：`ease`
- duration：`0.25s`
- width： `100%`
- height： `var(--gallery-height-to)`

**前往列表頁圖片尺寸縮放**

- ease：`ease`
- duration：`0.25s`
- width：`var(--banner-width-to)`
- height：`var(--banner-height-to)`

**detail.scss**

```css
.detail-leave-active.galleryTransition > img {
	transition: transform 250ms ease, width 250ms ease, height 250ms ease;
}

.detail-leave-to.galleryTransition > img {
	width: 100%;
	height: var(--gallery-height-to);
	transform: translate(var(--gallery-translateX), var(--gallery-translateY));
}
```

**list.scss**

```css
.list-leave-active.bannerTransition > img {
	transition: transform 250ms ease, width 250ms ease, height 250ms ease;
}

.list-leave-to.bannerTransition > img {
	width: var(--banner-width-to);
	height: var(--banner-height-to);
	transform: translate(var(--banner-translateX), var(--banner-translateY));
}
```

嗯？css 的 code 好像出現了沒看過的 selector...還記得最一開始說到圖片需要複製 `<img>` 另外做設定的事情嗎？  
`.galleryTransition > img` 及 `.bannerTransition > img` 就是被複製出來的圖片，為了要設定預設樣式就得另外新增 `.galleryTransition`、`.bannerTransition`。

下一段會詳細說明跨頁圖片的實作過程。

---

💡**注意**

@barba/css 的轉場時間是依靠 `[prefix]-[transition-hooks]` class 來決定的。就算沒有整頁的轉場效果，也一定要下完整的 css transition duration，不然 barba 會無法判斷轉場需要的時間，而沒有轉場效果。

**detail.scss**

```css
.detail-leave-active,
.detail-enter-active {
	transition: all 300ms ease;
}
```

**list.scss**

```css
.list-leave-active,
.list-enter-active {
	transition: all 300ms ease;
}
```

---

## 處理跨頁圖片

📄 **js 檔案**  
主要設定檔 → [barba-css.js](../src/js/barba-css.js)  
詳細頁 → [detail.js](../src/js/css/detail.js)  
列表頁 → [list.js](../src/js/css/list.js)

📄 **css 檔案**  
主要設定檔 → [barba-style.scss](../src/sass/barba-css.scss)  
詳細頁 → [detail.scss](../src/sass/detail.scss)  
列表頁 → [list.scss](../src/sass/list.scss)  
跨頁圖片預設樣式 → [gallery-img.scss](../src/sass/gallery-img.scss)

---

在上一段的設定轉場動畫當中，有說到圖片的轉場需要先複製 `<img>` 後再設定轉場相關的樣式。這一段會詳細解說實作的過程。

在實作之前先把流程梳理一遍。

**載入頁面完成及頁面轉場完成後**

取得圖片預設的尺寸及位置資訊，將資訊對應到 css variable，並且設定在 `data-barba="wrapper"` 這一層

**當按下前往詳細頁的連結時**

1. 複製連結裡的圖片 `<img>` 並新增至 `data-barba="wrapper"` 內的最上方
2. 在 `data-barba="wrapper"` 新增 `.galleryTransition` class；預設的圖片尺寸及位置相關 css 及 css variable 設定在 `.galleryTransition > img`（gallery-img.scss）
3. 取得詳細頁最終圖片的尺寸及位置資訊，將資訊對應到 css variable，並且設定在 `data-barba="wrapper"` 這一層
4. 轉場運行

**當按下前往列表頁的連結時**

1. 複製列表頁的圖片 `<img>` 並新增至 `data-barba="wrapper"` 內的最上方
2. 在 `data-barba="wrapper"` 新增 `.bannerTransition` class；預設的圖片尺寸及位置相關 css 及 css variable 設定在 `.bannerTransition > img`（gallery-img.scss）
3. 取得列表頁最終圖片的尺寸及位置資訊，將資訊對應到 css variable，並且設定在 `data-barba="wrapper"` 這一層
4. 轉場運行

順著這些流程一步一步的製作吧。

### 載入頁面完成及頁面轉場完成後

**barba-css.js**

兩個 transitions 分別新增 hooks: `once(){}`、`afterOnce(){}`、`after(){}`。`once(){}` 是啟動載入頁面的 hook ，需要先指定才能使用 `afterOnce(){}`，而 `afterOnce(){}`、`after(){}` 分別為載入頁面完成及頁面轉場完成後的 hook。

```javascript
barba.init({
	transitions: [
		{
			name: "detail",
			to: {
				namespace: "detail",
			},
			sync: true,
			afterOnce() {},
			after() {},
			once() {},
			leave() {},
			enter() {},
		},
		{
			name: "list",
			to: {
				namespace: "list",
			},
			sync: true,
			afterOnce() {},
			after() {},
			once() {},
			leave() {},
			enter() {},
		},
	],
});
```

分別在詳細頁 detail.js 及列表頁 list.js，實作各自需要的功能。

> 取得圖片預設的尺寸及位置資訊，將資訊對應到 css variable，並且設定在 `data-barba="wrapper"` 這一層

**detail.js**

```javascript
const bannerSetting = (container) => {
	const { height, top } = container
		.querySelector(".banner-img img")
		.getBoundingClientRect();

	container.style.setProperty("--banner-height", `${height}px`);
	container.style.setProperty("--banner-top", `${top}px`);
};

export { bannerSetting };
```

**list.js**

```javascript
const gallerySetting = (container) => {
	const headerHeight = container
		.querySelector(".main-header")
		.getBoundingClientRect().height;
	const { width, height, top } = container
		.querySelector(".gallery img")
		.getBoundingClientRect();

	container.style.setProperty("--gallery-width", `${width}px`);
	container.style.setProperty("--gallery-height", `${height}px`);
	container.style.setProperty("--gallery-top", `${top}px`);

	container.style.setProperty(
		"--gallery-translateY",
		`-${top - headerHeight}px`
	);
};

export { gallerySetting };
```

回到 barba-css.js，在 `afterOnce() {}` 及 `after() {}` 引用 `bannerSetting()`、`gallerySetting()`。

**barba-css.js**

```javascript
import { gallerySetting } from "./css/list";
import { bannerSetting } from "./css/detail";

barba.init({
	transitions: [
		{
			name: "detail",
			to: {
				namespace: "detail",
			},
			sync: true,
			afterOnce: ({ next }) => bannerSetting(next.container),
			after: ({ next }) => bannerSetting(next.container),
			once() {},
			leave() {},
			enter() {},
		},
		{
			name: "list",
			to: {
				namespace: "list",
			},
			sync: true,
			afterOnce: ({ next }) => gallerySetting(next.container),
			after: ({ next }) => gallerySetting(next.container),
			once() {},
			leave() {},
			enter() {},
		}
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

### 當按下前往詳細頁的連結時

> 1. 複製連結裡的圖片 `<img>` 並新增至 `data-barba="wrapper"` 內的最上方
> 2. 在 `data-barba="wrapper"` 新增 `.galleryTransition` class；預設的圖片尺寸及位置相關 css 及 css variable 設定在 `.galleryTransition > img`（gallery-img.scss）
> 3. 取得詳細頁最終圖片的尺寸及位置資訊，將資訊對應到 css variable，並且設定在 `data-barba="wrapper"` 這一層
> 4. 轉場運行

將上述的動作在 detail.js 轉換成 `toDetail()`。

**detail.js**

```javascript
const toDetail = (trigger, current, next) => {
	const transitionImg = next.querySelector(".banner-img img").cloneNode();
	const galleryLeft = trigger.querySelector("img").getBoundingClientRect().left;
	const bannerHeight = next
		.querySelector(".banner-img")
		.getBoundingClientRect().height;

	current.style.setProperty("--gallery-left", `${galleryLeft}px`);
	current.style.setProperty("--gallery-translateX", `-${galleryLeft}px`);
	current.style.setProperty("--gallery-height-to", `${bannerHeight}px`);

	current.insertAdjacentElement("afterbegin", transitionImg);
	current.classList.add("galleryTransition");
};

export { toDetail };
```

回到 barba-css.js，在 `beforeLeave() {}` 引用 `toDetail()`。

**barba-css.js**

```javascript
import { bannerSetting, toDetail } from "./css/detail";

barba.init({
	transitions: [
		{
			name: "detail",
			to: {
				namespace: "detail",
			},
			sync: true,
			afterOnce: ({ next }) => bannerSetting(next.container),
			after: ({ next }) => bannerSetting(next.container),
			beforeLeave: ({ trigger, current, next }) =>
				toDetail(trigger, current.container, next.container),
			once() {},
			leave() {},
			enter() {},
		},
		...
	],
});
```

在 gallery-img.scss，設定好 `.galleryTransition > img` 樣式。

**gallery-img.scss**

```css
.galleryTransition > img {
	width: var(--gallery-width);
	height: var(--gallery-height);
	top: var(--gallery-top);
	left: var(--gallery-left);
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

### 當按下前往列表頁的連結時

> 1. 複製列表頁的圖片 `<img>` 並新增至 `data-barba="wrapper"` 內的最上方
> 2. 在 `data-barba="wrapper"` 新增 `.bannerTransition` class；預設的圖片尺寸及位置相關 css 及 css variable 設定在 `.bannerTransition > img`（gallery-img.scss）
> 3. 取得列表頁最終圖片的尺寸及位置資訊，將資訊對應到 css variable，並且設定在 `data-barba="wrapper"` 這一層
> 4. 轉場運行

將上述的動作在 list.js 轉換成 `toList()`。

**list.js**

```javascript
const toList = (url, current, next) => {
	const triggerUrl = url.path;
	const triggerImg = Array.from(next.querySelectorAll(".gallery img")).find(
		(element) => {
			const regexp = new RegExp(element.parentElement.getAttribute("href"));

			return regexp.test(triggerUrl);
		}
	);
	const { width, height, top, left } = triggerImg.getBoundingClientRect();
	const headerHeight = current
		.querySelector(".main-header")
		.getBoundingClientRect().height;
	const transitionImg = triggerImg.cloneNode(true);

	current.style.setProperty("--banner-width-to", `${width}px`);
	current.style.setProperty("--banner-height-to", `${height}px`);
	current.style.setProperty("--banner-translateX", `${left}px`);
	current.style.setProperty("--banner-translateY", `${top - headerHeight}px`);

	current.insertAdjacentElement("afterbegin", transitionImg);
	current.classList.add("bannerTransition");
};

export { toList };
```

回到 barba-css.js，在 `beforeLeave() {}` 引用 `toList()`。

**barba-css.js**

```javascript
import { gallerySetting, toList } from "./css/list";

barba.init({
	transitions: [
		{
			name: "list",
			to: {
				namespace: "list",
			},
			sync: true,
			afterOnce: ({ next }) => gallerySetting(next.container),
			after: ({ next }) => gallerySetting(next.container),
			beforeLeave: ({ current, next }) =>
				toList(current.url, current.container, next.container),
			once() {},
			leave() {},
			enter() {},
		},
		...
	],
});
```

在 gallery-img.scss，設定好 `.bannerTransition > img` 樣式。

**gallery-img.scss**

```css
.galleryTransition > img {
	width: 100%;
	height: var(--banner-height);
	top: var(--banner-top);
	left: 0;
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

---

💡**注意**

`.galleryTransition > img` 及 `.bannerTransition > img` 的設定重點在 `object-fit: cover` 及 `aspect-ratio: 1/1`，這是為了讓圖片在不同比例轉換時不變形。

---

## 確認效果及調整

📄 **js 檔案**  
主要設定檔 → [barba-css.js](../src/js/barba-css.js)  
詳細頁 → [detail.js](../src/js/css/detail.js)  
列表頁 → [list.js](../src/js/css/list.js)  
global hooks → [transition.js](../src/js/css/transition.js)

📄 **css 檔案**  
主要設定檔 → [barba-style.scss](../src/sass/barba-css.scss)  
詳細頁 → [detail.scss](../src/sass/detail.scss)  
列表頁 → [list.scss](../src/sass/list.scss)  
跨頁圖片預設樣式 → [gallery-img.scss](../src/sass/gallery-img.scss)  
客製進退場 → [custom-default.scss](../src/sass/custom-default.scss)

---

感覺上都做的差不多了，來看看目前的樣子

<img src="temp-demo-100p.gif" width="300"><br>

嗯？好像怪怪的，放慢動作再看一下

<img src="temp-demo-10p.gif" width="300"><br>

暫停轉場來比對一下程式碼

<img src="temp-demo-html.png"><br>

從畫面和程式碼的比對中，發現到是因為設定了 `sync:true` 所以進退場會同時進行，於是就形成了目前畫面上同時有新舊內容的存在。而且也注意到了新的內容的確是會被新增到 `data-barba="wrapper"` 的底部。

### 讓新舊內容位置一致

那麼該如何藉解決這個問題呢？在官網的說明文件 [ADVANCED/Recipes/Container](https://barba.js.org/docs/advanced/recipes/#Containers) 中有提到：

> `position: absolute`: keep containers superimposed, this is useful when making a sync (crossfade) transition

看起來只需要將新舊內容的 `data-barba="container"` 都加上 `position: absolute` 即可解決。

**detail.scss**

```css
.detail-leave-active,
.detail-enter-active {
	position: absolute;
	top: 0;
	left: 0;
}
```

**list.scss**

```css
.list-leave-active,
.list-enter-active {
	position: absolute;
	top: 0;
	left: 0;
}
```

確認效果。

<img src="temp-demo-absolute.gif" width="300"><br>

感覺順暢多了，但是回到列表頁的 header 轉場卻是 icon 直接消失。

### 調整前往列表頁退場內容的 z-index

由於剛才將 `data-barba="container"` 都加上了 `position: absolute`，這造成了新內容都在舊內容的上層。那為什麼只有 header 看起來受影響？是因為主要內容有淡出淡入的效果，間接地變成只有 header 被影響到。

那只要將前往列表頁退場內容的 `z-index` 提升就可以解決這個問題。

**list.scss**

```css
.list-leave-active {
	z-index: 1;
}
```

回到列表頁的 icon 問題看起來是很好地解決了，但在前往詳細頁的時候頁面好像閃了一下。

<img src="temp-demo-absolute-check.gif" width="300"><br>

放大跳動的部分來仔細確認。

<img src="temp-demo-todetail.png"><br>

其實這個狀況是偶爾才會發生的，看起來是新內容的載入和轉場應該要同步進行，但在插入轉場 class 的時候可能和新內容載入有時間差，就造成了閃動。

### 先讓新內容隱藏起來

這個問題其實也不難解，只要在轉場進行前強制讓新內容設定 `opacity:0` 先隱藏起來就好了。

不過轉場會用到的 `.[prefix]-[transition-hooks]` class 並沒有提供 `before`、`after` 之類的 transition-hooks，所以要使用 [global hooks](https://barba.js.org/docs/advanced/hooks/#Global-hooks) 來加入新的 class。

依照 `.[prefix]-[transition-hooks]` 的規則來取名。考慮到進退場兩種情境：

- 進場 → `.customDefault-enter`
- 退場 → `.customDefault-leave`

一樣是加在 `data-barba="container"` 這一層，並且轉場完成後要移除。

在 transition.js 編寫 global hooks 需要的 function `beforeLeave()`、`beforeEnter()`、`after()`。

**transition.js**

```javascript
const beforeLeave = (current) => {
	current.classList.add("customDefault-leave");
};

const beforeEnter = (next) => {
	next.classList.add("customDefault-enter");
};

const after = (current, next) => {
	requestAnimationFrame(() => {
		current.classList.remove("customDefault-leave");
		next.classList.remove("customDefault-enter");
	});
};

export { beforeLeave, beforeEnter, after };
```

到 barba-css.js 引用 `beforeLeave()`、`beforeEnter()`、`after()`。

**barba-css.js**

```javascript
import { beforeLeave, beforeEnter, after } from "./css/transition";

barba.hooks.beforeLeave(({ current, next }) => {
	beforeLeave(current.container);
	beforeEnter(next.container);
});

barba.hooks.after(({ current, next }) => {
	after(current.container, next.container);
});
```

這邊使用 `beforeLeave` 純粹是因為試過之後覺得體感上比 `beforeEnter` 在時間上比較前面一點。

再來到 custom-default.scss，對 main、header 分別設定為 `opacity: 0`。

為什麼要分開設定呢？這是因為 main 和 header 轉場的進行方式不一樣，main 是淡入進場、header 是裡面的 icon 和 標題做轉場，所以 header 需要在進場的時候取消隱藏，不然會沒有轉場效果。

**custom-default.scss**

```css
.customDefault-enter main {
	opacity: 0;
}

.customDefault-enter main-header {
	opacity: 0;
}
```

**detail.scss**

```css
.detail-enter-to header {
	opacity: 1;
}
```

**list.scss**

```css
.list-enter-to header {
	opacity: 1;
}
```

確認效果。

<img src="temp-demo-new-container.gif" width="300"><br>

看起來很不錯呢！

優化到這邊基本上是差不多了，不過還有一些小細節可以再調整。

- 跨頁圖片轉場時將原本的底圖隱藏，轉場後再出現
- 轉場時將 scroll 位置拉回頂端

### 跨頁圖片轉場時原本的底圖隱藏，轉場後再出現

<img src="temp-demo-img.png" width="60%"><br>

由於跨頁圖片轉場並不是使用原本的圖片進行，所以會產生上圖的交疊狀態，看起來效果就不夠順暢。為了讓轉場更為順暢，就必須在轉場發生時隱藏原本的圖片，等到轉場完成後在把新內容的圖片展示出來。

在寫程式前先整理一下兩個情境需要的效果：

**前往詳細頁**

1. 列表頁的退場，將選定的連結圖片隱藏
2. 詳細頁的進場，大張主視覺隱藏
3. 轉場完成，詳細頁大張主視覺出現

**前往列表頁**

1. 詳細頁的退場，大張主視覺隱藏
2. 列表頁的進場，將原先連結的圖片隱藏
3. 轉場完成，列表頁原先連結的圖片出現

這中間比較麻煩的就是選定連結圖片的部分：

> **前往詳細頁**
>
> 1. 列表頁的退場，將選定的連結圖片隱藏

> **前往列表頁**
>
> 2. 列表頁的進場，將原先連結的圖片隱藏

這兩個情境都需要另外給予圖片 class，才能針對相對應的連結圖片做設定。因為都和列表頁相關就取名為 `.galleryTrigger`。而關於進退場的情境，依然使用 `[prefix]-[transition-hooks]`：

- 列表頁的退場，將選定的連結圖片隱藏 → `.detail-leave-to .galleryTrigger`
- 列表頁的進場，將原先連結的圖片隱藏 → `.list-enter-to .galleryTrigger`

作法都整理完成了，來實際製作跨頁圖片的優化吧！

#### 前往詳細頁

修改 detail.js 當中的 `toDetail()`，新增**選定的連結圖片 class `.galleryTrigger`**。

**detail.js**

```javascript
const toDetail = (trigger, current, next) => {
	const triggerImg = trigger.querySelector("img"); //新增
	const transitionImg = next.querySelector(".banner-img img").cloneNode();
	const galleryLeft = trigger.querySelector("img").getBoundingClientRect().left;
	const bannerHeight = next
		.querySelector(".banner-img")
		.getBoundingClientRect().height;

	current.style.setProperty("--gallery-left", `${galleryLeft}px`);
	current.style.setProperty("--gallery-translateX", `-${galleryLeft}px`);
	current.style.setProperty("--gallery-height-to", `${bannerHeight}px`);

	current.insertAdjacentElement("afterbegin", transitionImg);
	current.classList.add("galleryTransition");
	triggerImg.classList.add("galleryTrigger"); //新增
};
```

轉場隱藏樣式設定。

**detail.scss**

```css
.detail-leave-to .galleryTrigger {
	opacity: 0;
}
```

#### 前往列表頁

修改 list.js 當中的 `toList()`，新增**原先連結的圖片 class `.galleryTrigger`**。

**list.js**

```javascript
const toList = (url, current, next) => {
	const triggerUrl = url.path;
	const triggerImg = Array.from(next.querySelectorAll(".gallery img")).find(
		(element) => {
			const regexp = new RegExp(element.parentElement.getAttribute("href"));

			return regexp.test(triggerUrl);
		}
	);
	const { width, height, top, left } = triggerImg.getBoundingClientRect();
	const headerHeight = current
		.querySelector(".main-header")
		.getBoundingClientRect().height;
	const transitionImg = triggerImg.cloneNode(true);

	current.style.setProperty("--banner-width-to", `${width}px`);
	current.style.setProperty("--banner-height-to", `${height}px`);
	current.style.setProperty("--banner-translateX", `${left}px`);
	current.style.setProperty("--banner-translateY", `${top - headerHeight}px`);

	current.insertAdjacentElement("afterbegin", transitionImg);
	current.classList.add("bannerTransition");
	triggerImg.classList.add("galleryTrigger"); //新增
};
```

轉場隱藏樣式設定。

**list.scss**

```css
.list-enter-to .galleryTrigger {
	opacity: 0;
}
```

### 轉場時將 scroll 位置拉回頂端

因為是進到下一頁的行為，所以希望新內容的轉場是可以在頁面頂端的位置來進行。而轉場的 hooks 是 `enter() {}`，但是使用了 CSS plugin 的話 `enter() {}` 就無法使用 callback，加上這個效果希望是所有情境都可以用到，這時候使用 global hooks 就是一個很好的選擇。

在 transition.js 新增 `enter()`。

**transition.js**

```javascript
const enter = (data) => {
	window.scrollTo({
		top: 0,
		left: 0,
		behavior: "smooth",
	});
};
```

回到 barba-css.js 在 global hooks 的 enter 中引用 `enter()`。

**barba-css.js**

```javascript
import { beforeLeave, beforeEnter, after, enter } from "./css/transition";

barba.hooks.enter(enter);
```

最終結果。

<img src="demo-complete.gif" width="300">

## 後記

雖然在看文件的時候覺得上手應該不難，不過實際執行後才發現需要注意的細節其實很多。像是 hooks 的參數在一開始的使用上有點撞牆，還有使用 CSS plugin 的話 container 一定需要設定 css transition 不然會沒有轉場效果...這些都是需要實作才會發現的事情。

當然寫筆記也是一個重新檢視程式的好方法，在編寫的當下就發現很多可以優化的地方，不管是 js 或是 css 都可以寫得更有邏輯及更簡單。

這是第一次完整地把思考分析和實作過程一步一步地寫下，希望之後每一次的嘗試也都可以像這樣寫下來並分享，也順便增強自己的對程式編寫的概念。
