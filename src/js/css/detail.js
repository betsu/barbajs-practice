const bannerSetting = (container) => {
	const headerHeight = container
		.querySelector(".main-header")
		.getBoundingClientRect().height;
	const { width, height, top } = container
		.querySelector(".banner-img img")
		.getBoundingClientRect();

	container.style.setProperty("--banner-height", `${height}px`);
	container.style.setProperty("--banner-top", `${top}px`);
};

const toDetail = (trigger, current, next) => {
	const triggerImg = trigger.querySelector("img");
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

	requestAnimationFrame(() => {
		setTimeout(() => {
			triggerImg.classList.add("galleryTrigger");
		}, 100);
	});
};

export { toDetail, bannerSetting };
