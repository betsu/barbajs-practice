import barba from "@barba/core";
import { detailEnter, detailLeave } from "./gsap/detail";
import { listEnter, listLeave } from "./gsap/list";

if (history.scrollRestoration) {
	history.scrollRestoration = "manual";
}

barba.hooks.beforeLeave(() => {
	window.scrollTo(0, barba.history.previous.scroll.y);
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
			leave: ({ current, next, trigger }) =>
				detailLeave(current.container, next.container, trigger),
			enter: ({ next }) => detailEnter(next.container),
			after({ next }) {
				next.container.classList.remove("detailEnter");
			},
		},
		{
			name: "list",
			to: {
				namespace: "list",
			},
			sync: true,
			leave: ({ current, next }) =>
				listLeave(current.container, next.container, current.url),
			enter: ({ next }) => listEnter(next.container),
			after({ next }) {
				next.container.classList.remove("listEnter");
			},
		},
	],
});
