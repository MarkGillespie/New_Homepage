function getBackground(){
	let background_data = g_backgrounds[Math.floor(Math.random() * g_backgrounds.length)];
	let background = "url(\"" +background_data["url"] +"\")";

	let downloadingImage = new Image();
	downloadingImage.src = background_data["url"];

	downloadingImage.onload = function(){
		document.body.style.backgroundImage = background;
		let overlay = document.getElementById("overlay");
		overlay.style.opacity = 0;
	};
}

getBackground();