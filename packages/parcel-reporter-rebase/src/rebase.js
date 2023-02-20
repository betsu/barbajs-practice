const { Reporter } = require("@parcel/plugin");
const path = require("path");
const fs = require("fs");
const glob = require("glob");
const process = require("process");
const production = process.env.NODE_ENV == "production";
const packageJson = require(path.join(process.cwd(), "package.json"));
const target = process.env.npm_lifecycle_script
	.match(/(?<=--target "*)[a-z-_]*|(?<=build:)[a-z]*/g)
	.pop();
const root = target ? packageJson.targets[target].distDir : null;

const rebaseConfig = {
	link: {
		css: "css",
	},
	img: {
		images: "images",
		assets: "assets",
	},
	source: {
		images: "images",
		assets: "assets",
	},
	script: {
		js: "js",
	},
	a: {
		html: "",
	},
};

function rebase(data, file) {
	const dirs = path.posix.dirname(file);
	const relativePath = path.posix.relative(dirs, root);
	const rebaseList = Object.keys(rebaseConfig);
	let result = data;

	// process.stdout.write(`\n\n${file}\n`);

	rebaseList.forEach((tag) => {
		const rebase = rebaseConfig[tag];
		const regex = () => {
			const search = Object.keys(rebase);

			return search.map((regex) => {
				if (regex.includes("html")) {
					return new RegExp(`(${tag}.*href=")[a-zA-Z-_./]*${regex}?`, "g");
				} else {
					return new RegExp(
						`(${tag}.*[src=|href=|srcset=|poster=]"|, )[./]*${regex}?\\/`,
						"g"
					);
				}
			});
		};
		const replace = () => {
			const replace = Object.values(rebase);

			return replace.map((string) => {
				if (string.includes("html")) {
					return `${string}`;
				} else {
					return `${string}/`;
				}
			});
		};

		regex().forEach((regex, index) => {
			const dir = replace()[index];
			if (regex.toString().includes("html")) {
				result = result.replace(regex, (match, p1) => {
					const link = path.posix.join(root, match.replace(p1, ""));

					// process.stdout.write(`link:${link}}\n`);
					return `${p1}${path.posix.relative(dirs, link)}`;
				});
			} else {
				result = result.replace(
					regex,
					`$1${path.posix.join(relativePath, dir)}`
				);
			}
		});
	});

	return result;
}

module.exports = new Reporter({
	report({ event }) {
		if (event.type === "buildSuccess" && production) {
			process.stdout.write(`\n✨ Go rebase 👉\n`);

			const html = glob.sync(`${path.posix.join(root, "**/*.html")}`, {
				matchBase: true,
			});

			// process.stdout.write(html.length.toString() + "\n");

			html.forEach((file, i) => {
				// process.stdout.write(file + "\n");

				fs.readFile(
					file,
					{ encoding: "utf-8", flag: "r" },
					function (err, data) {
						if (err) throw err;

						const result = rebase(data, file);

						fs.writeFileSync(file, result);
					}
				);
			});
		}
	},
});
