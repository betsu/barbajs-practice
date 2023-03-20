import barba from "@barba/core";
import barbaCss from "@barba/css";
import { beforeLeave, beforeEnter, after, enter } from "./css/transition";
import { gallerySetting, toList } from "./css/list";
import { bannerSetting, toDetail } from "./css/detail";

barba.use(barbaCss);

barba.hooks.beforeLeave(({ current, next }) => {
	beforeLeave(current.container);
	beforeEnter(next.container);
});

barba.hooks.enter(enter);

barba.hooks.after(({ current, next }) => {
	after(current.container, next.container);
});

barba.init({
	preventRunning: true,
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
	],
});
