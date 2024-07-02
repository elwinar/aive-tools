chrome.tabs.onUpdated.addListener((id, info, tab) => {
	if (info?.status !== "complete") {
		return;
	}
	chrome.tabs.sendMessage(id, {
		action: "devFavIcon",
	});
});
