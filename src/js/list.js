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

const toList = (url, current, next) => {
	const triggerUrl = url.path;
	const triggerImg = Array.from(next.querySelectorAll(".gallery img")).find(
		(element) => {
			const regexp = new RegExp(element.parentElement.getAttribute("href"));

			return regexp.test(triggerUrl);
		}
	);
	const { width, height, top, left } = triggerImg.getBoundingClientRect();
	const bannerImg = current.querySelector("img");
	const transitionImg = bannerImg.cloneNode(true);

	current.style.setProperty("--banner-width-to", `${width}px`);
	current.style.setProperty("--banner-height-to", `${height}px`);
	current.style.setProperty("--banner-translateX", `${left}px`);
	current.style.setProperty("--banner-translateY", `${top}px`);

	current.insertAdjacentElement("afterbegin", transitionImg);
	current.classList.add("bannerTransition");
	triggerImg.classList.add("galleryTrigger");

	requestAnimationFrame(() => {
		setTimeout(() => {
			bannerImg.classList.add("bannerImg");
		}, 100);
	});
};

export { gallerySetting, toList };
