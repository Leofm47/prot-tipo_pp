document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const postId = params.get("id");
  const usuarioId = localStorage.getItem("usuarioId");

  if (!postId) {
    alert("ID do post não encontrado.");
    window.location.href = "index.html";
    return;
  }

  // =======================
  // 1. Carregar post
  // =======================
  const postRes = await fetch(`http://localhost:3030/posts/${postId}`);
  const post = await postRes.json();

  let botoesAutor = "";
  if (parseInt(usuarioId) === parseInt(post.author_id)) {
    botoesAutor = `
      <div class="acoes-post">
        <button id="btnEditar">✏️ Editar</button>
        <button id="btnExcluir">🗑️ Excluir</button>
      </div>
    `;
  }

  document.getElementById("post-container").innerHTML = `
    <div class="profile">
      <h2>${post.title}</h2>

      ${post.url
        ? `<img src="http://localhost:3030${post.url}" alt="${post.title}" class="post-imagem"/>`
        : `<img src="" class="post-imagem"/>`
      }

      <p>${post.description}</p>
      <p><b>Autor:</b> ${post.author_name}</p>
      ${botoesAutor}
    </div>
  `;

  // =======================
  // 2. Editar / Excluir
  // =======================
  if (parseInt(usuarioId) === parseInt(post.author_id)) {

    // Excluir post
    document.getElementById("btnExcluir").addEventListener("click", async () => {
      if (!confirm("Tem certeza que deseja excluir este post?")) return;

      await fetch(`http://localhost:3030/posts/${postId}?user_id=${usuarioId}`, {
        method: "DELETE",
      });

      alert("Post excluído com sucesso!");
      window.location.href = "index.html";
    });

    // Editar post
    document.getElementById("btnEditar").addEventListener("click", () => {
      window.location.href = `editar_post.html?id=${postId}`;
    });
  }

  // =======================
  // 3. Comentários
  // =======================
  async function carregarComentarios() {
    const res = await fetch(`http://localhost:3030/comments/${postId}`);
    const comentarios = await res.json();

    const lista = document.getElementById("lista-comentarios");
    lista.innerHTML = "";

    comentarios.forEach((c) => {
      const div = document.createElement("div");
      div.classList.add("comentario");

      const btnExcluir =
        parseInt(c.author_id) === parseInt(usuarioId)
          ? `<button class="btnExcluir" data-id="${c.id}">Excluir</button>`
          : "";

      div.innerHTML = `
        <p>
          <b>${c.author_name}:</b> ${c.text}
          ${btnExcluir}
        </p>
      `;
      lista.appendChild(div);
    });

    // Evento excluir comentário
    document.querySelectorAll(".btnExcluir").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const commentId = btn.dataset.id;
        if (!confirm("Excluir comentário?")) return;

        await fetch(`http://localhost:3030/comments/${commentId}?user_id=${usuarioId}`, { method: "DELETE" });
        carregarComentarios();
      });
    });
  }

  carregarComentarios();

  document.getElementById("btnComentar").addEventListener("click", async () => {
    const text = document.getElementById("textoComentario").value;
    if (!text) return alert("Escreva algo!");

    await fetch("http://localhost:3030/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        photo_id: postId,
        author_id: usuarioId,
      }),
    });

    document.getElementById("textoComentario").value = "";
    carregarComentarios();
  });

  // =======================
  // 4. Curtir / Descurtir
  // =======================
  const btnCurtir = document.getElementById("btnCurtir");

  async function verificarCurtida() {
    const res = await fetch(`http://localhost:3030/likes/${usuarioId}`);
    const likes = await res.json();

    const jaCurtiu = likes.some(
      (l) => l.id === parseInt(postId) || l.photo_id === parseInt(postId)
    );

    btnCurtir.textContent = jaCurtiu ? "Descurtir 💔" : "Curtir ❤️";
    return jaCurtiu;
  }

  btnCurtir.addEventListener("click", async () => {
    const jaCurtiu = await verificarCurtida();

    if (jaCurtiu) {
      await fetch("http://localhost:3030/likes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: usuarioId, photo_id: postId }),
      });
      alert("Você descurtiu o post.");
    } else {
      await fetch("http://localhost:3030/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: usuarioId, photo_id: postId }),
      });
      alert("Você curtiu o post!");
    }

    verificarCurtida();
  });

  verificarCurtida();
});
