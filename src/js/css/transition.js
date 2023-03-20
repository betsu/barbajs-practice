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

const enter = (data) => {
	window.scrollTo({
		top: 0,
		left: 0,
		behavior: "smooth",
	});
};

export { beforeLeave, beforeEnter, after, enter };
