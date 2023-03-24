import barba from "@barba/core";
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
	const tl = gsap.timeline();

	triggerImg.classList.add("triggerImg");
	transitionImg.classList.add("transitionImg");
	current.insertAdjacentElement("afterbegin", transitionImg);
	current.classList.add("listLeave");

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
				width: "100%",
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

const listEnter = (next) => {
	const content = next.querySelector("main");
	const tl = gsap.timeline();

	next.classList.add("listEnter");

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
