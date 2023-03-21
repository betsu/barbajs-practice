import gsap from "gsap";
import CustomEase from "gsap/CustomEase";

gsap.registerPlugin(CustomEase);
CustomEase.create("cssEase", ".25, .1, .25, 1");
CustomEase.create("TranslateEase", ".4, 0, .2, 1");
CustomEase.create("fadeOutEase", ".4, 0, 1, 1");
CustomEase.create("fadeInEase", "0, 0, .2, 1");

const detailLeave = (current, next, trigger) => {
	const content = current.querySelector("main");
	const transitionImg = next.querySelector(".banner-img img").cloneNode();
	const triggerImg = trigger.querySelector("img");
	const triggerImgData = Object.assign(
		trigger.querySelector("img").getBoundingClientRect(),
		{
			scaleY: document.body.clientWidth * 0.5625,
			translateY: next.querySelector(".main-header").getBoundingClientRect()
				.height,
		}
	);
	const tl = gsap.timeline();

	transitionImg.classList.add("transitionImg");
	current.insertAdjacentElement("afterbegin", transitionImg);

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

const detailEnter = (container) => {
	const content = container.querySelector("main");
	const headerTitle = container.querySelector(".main-header-text");
	const headerIcon = container.querySelector(".back-icon");
	const tl = gsap.timeline();

	container.classList.add("detailEnter");

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
