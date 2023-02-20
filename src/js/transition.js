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
		document
			.querySelector(".bannerImg", ".galleryTrigger")
			?.classList.remove("bannerImg", "galleryTrigger");
	});
};

const enter = (data) => {
	window.scrollTo(0, 0);
};

export { beforeLeave, beforeEnter, after, enter };
