document.addEventListener("DOMContentLoaded", () => {
  const usuarioLogado = localStorage.getItem("usuarioId");
  const linkPerfil = document.querySelector('.dropdown a[href="perfil.html"]');
  if (usuarioLogado && linkPerfil) {
    linkPerfil.href = `perfil.html?id=${usuarioLogado}`;
  }

  const sair = document.getElementById("logout");
  if (sair) {
    sair.addEventListener("click", () => {
      localStorage.removeItem("usuarioId");
      window.location.href = "login.html";
    });
  }
});
