document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const userId = params.get("id");
  const usuarioLogado = localStorage.getItem("usuarioId");
  const perfilContainer = document.getElementById("perfil");
  const acoesContainer = document.getElementById("acoes");

  try {
    const res = await fetch(`http://localhost:3030/users/${userId}`);
    const user = await res.json();

    perfilContainer.innerHTML = `
      <h2>${user.name}</h2>
      <p><b>Email:</b> ${user.email}</p>
      ${user.profile_image ? `<img src="http://localhost:3030${user.profile_image}" width="150">` : ""}
      <p><b>Membro desde:</b> ${new Date(user.created_at).toLocaleDateString()}</p>
    `;

    // Se for o próprio usuário logado, mostrar botões de editar e excluir
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
          });
          const data = await res.json();
          alert(data.message);
          localStorage.removeItem("usuarioId");
          window.location.href = "index.html";
        }
      });
    }
  } catch (err) {
    console.error("Erro ao carregar perfil:", err);
  }
});
