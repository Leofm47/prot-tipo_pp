document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const userId = params.get("id");
  const usuarioLogado = localStorage.getItem("usuarioId");
  const perfilContainer = document.getElementById("perfil");
  const acoesContainer = document.getElementById("acoes");
  const nomeUsuarioSpan = document.getElementById("nome-usuario");
  const listaPostagens = document.getElementById("postsUsuario");


  try {
    // 🔹 Buscar dados do usuário
    const res = await fetch(`http://localhost:3030/users/${userId}`);
    const user = await res.json();

    perfilContainer.innerHTML = `
      <div class="profile">
        <h2>${user.name}</h2>
        <p><b>Email:</b> ${user.email}</p>
        ${user.profile_image ? `<img src="http://localhost:3030${user.profile_image}" width="150">` : ""}
        <p><b>Membro desde:</b> ${new Date(user.created_at).toLocaleDateString()}</p>
      </div>
    `;

    nomeUsuarioSpan.textContent = user.name;

    // 🔹 Mostrar botões de editar/excluir se for o próprio usuário
    if (usuarioLogado == userId) {
      acoesContainer.innerHTML = `
        <button id="editar">Editar Perfil</button>
        <button id="excluir">Excluir Conta</button>
      `;

      document.getElementById("editar").addEventListener("click", () => {
        window.location.href = "editar_perfil.html";
      });

      document.getElementById("excluir").addEventListener("click", async () => {
        if (confirm("Tem certeza que deseja excluir sua conta? Isso apagará todos os seus posts.")) {
          const res = await fetch(`http://localhost:3030/users/${userId}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: usuarioLogado })
          });

          const data = await res.json();
          alert(data.message);
          if (data.success) {
            localStorage.removeItem("usuarioId");
            window.location.href = "index.html";
          }
        }
      });
    }

    // 🔹 Buscar e exibir os posts do usuário
    const resPosts = await fetch(`http://localhost:3030/posts`);
    const posts = await resPosts.json();

    const postsDoUsuario = posts.filter(post => post.author_id == userId);

    if (postsDoUsuario.length === 0) {
      listaPostagens.innerHTML = `<p>Esse usuário ainda não fez nenhuma postagem.</p>`;
    } else {
      postsDoUsuario.forEach(post => {
        const postDiv = document.createElement("div");
        postDiv.classList.add("post-usuario");

        postDiv.innerHTML = `
          <h4>${post.title}</h4>
          <p>${post.description}</p>
          ${post.url ? `<img src="http://localhost:3030${post.url}" width="200">` : ""}
          <small>Postado em: ${new Date(post.created_at).toLocaleDateString()}</small>
          <hr>
        `;

        postDiv.addEventListener("click", () => {
          window.location.href = `post_detalhe.html?id=${post.id}`;
        });

        listaPostagens.appendChild(postDiv);
      });
    }

  } catch (err) {
    console.error("Erro ao carregar perfil:", err);
  }
});
