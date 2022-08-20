let context = document.getElementById("pacmania").getContext("2d");
context.beginPath();
context.arc(40, 40, 40, 0.2 * Math.PI, 1.8 * Math.PI);
context.lineTo(40, 40);
context.fillStyle = "yellow";
context.fill();
