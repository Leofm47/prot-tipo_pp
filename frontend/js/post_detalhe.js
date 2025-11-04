document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const postId = params.get("id");
  const usuarioId = localStorage.getItem("usuarioId");

  // Carregar post
  const postRes = await fetch(`http://localhost:3030/posts/${postId}`);
  const post = await postRes.json();

  document.getElementById("post-container").innerHTML = `
  <div class="profile">
    <h2>${post.title}</h2>
    <p>${post.description}</p>
    ${post.url ? `<img src="http://localhost:3030${post.url}" width="300">` : ""}
    <p><b>Autor:</b> ${post.author_name}</p>
  </div>
  `;

  // Carregar comentários
  async function carregarComentarios() {
    const res = await fetch(`http://localhost:3030/comments/${postId}`);
    const comentarios = await res.json();
    const lista = document.getElementById("lista-comentarios");
    lista.innerHTML = "";
    comentarios.forEach(c => {
      const div = document.createElement("div");
      div.innerHTML = `<p><b>${c.author_name}:</b> ${c.text}</p>`;
      lista.appendChild(div);
    });
  }
  carregarComentarios();

  // Enviar comentário
  document.getElementById("btnComentar").addEventListener("click", async () => {
    const text = document.getElementById("textoComentario").value;
    if (!text) return alert("Escreva algo!");
    await fetch("http://localhost:3030/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, photo_id: postId, author_id: usuarioId })
    });
    document.getElementById("textoComentario").value = "";
    carregarComentarios();
  });

  // Curtir
  document.getElementById("btnCurtir").addEventListener("click", async () => {
    const res = await fetch("http://localhost:3030/likes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: usuarioId, photo_id: postId })
    });
    const data = await res.json();
    alert(data.message);
  });
});
