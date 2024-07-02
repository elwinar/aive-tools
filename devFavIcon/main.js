const hosts = [
	{ m: /.*.production.aive.com/, c: "#FF0000" },
	{ m: /app.aive.com/, c: "#FF0000" },
	{ m: /.*.staging.aive.com/, c: "#FFFF00" },
	{ m: /localhost:.*/, c: "#00FF00" },
];

chrome.runtime.onMessage.addListener(async (msg) => {
	if (msg?.action !== "devFavIcon") {
		return;
	}

	const hostname = window.location.hostname;
	const host = hosts.findIndex((h) => h.m.test(hostname));
	if (host === -1) {
		return;
	}

	let favIconUrl = null;
	const links = document.head.getElementsByTagName("link");
	for (let i = 0; i < links.length; i++) {
		if (links[i].getAttribute("rel").match(/^(shortcut )?icon$/i)) {
			favIconUrl = links[i].href;
			document.head.removeChild(links[i]);
		}
	}
	if (favIconUrl === null) {
		return;
	}

	const favIcon = await loadImg(favIconUrl);
	const nextFavIcon = makeDevFavIcon(favIcon, hosts[host].c);
	document.head.appendChild(nextFavIcon);
});

async function loadImg(url) {
	return new Promise((resolve, reject) => {
		const favIcon = document.createElement("img");
		favIcon.addEventListener("load", () => {
			resolve(favIcon);
		});
		favIcon.addEventListener("error", (err) => {
			reject(err);
		});
		favIcon.crossOrigin = "anonymous";
		favIcon.src = url;
	});
}

function makeDevFavIcon(favIcon, color) {
	const canvas = document.createElement("canvas");
	canvas.width = favIcon.width;
	canvas.height = favIcon.height;

	const context = canvas.getContext("2d");
	context.drawImage(favIcon, 0, 0);
	context.fillStyle = color;
	context.fillRect(0, 0, canvas.width, Math.floor(canvas.height / 4));

	const nextFavIcon = document.createElement("link");
	nextFavIcon.setAttribute("rel", "icon");
	nextFavIcon.type = "image/x-icon";
	nextFavIcon.href = canvas.toDataURL();

	return nextFavIcon;
}
