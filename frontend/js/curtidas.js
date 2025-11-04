document.addEventListener("DOMContentLoaded", async () => {
  const usuarioId = localStorage.getItem("usuarioId");
  const res = await fetch(`http://localhost:3030/likes/${usuarioId}`);
  const posts = await res.json();

  const div = document.getElementById("curtidas");
  posts.forEach(p => {
    const el = document.createElement("div");
    el.innerHTML = `
      <h3>${p.title}</h3>
      <p>${p.description}</p>
      ${p.url ? `<img src="http://localhost:3030${p.url}" width="200">` : ""}
      <hr>
    `;
    div.appendChild(el);
  });
});