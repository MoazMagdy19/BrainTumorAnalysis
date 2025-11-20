const sampleImages = [
  "Screenshot 2025-11-20 110309.png",
  "Screenshot 2025-11-20 110328.png",
  "Screenshot 2025-11-20 110354.png",
  "Screenshot 2025-11-20 110417.png",
  "Screenshot 2025-11-20 110446.png",
];

const gallery = document.getElementById("gallery");

sampleImages.forEach(src => {
  let img = document.createElement("img");
  img.src = src;
  gallery.appendChild(img);
});
