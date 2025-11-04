document.getElementById("formEditar").addEventListener("submit", async (e) => {
  e.preventDefault();

  const usuarioId = localStorage.getItem("usuarioId");
  const formData = new FormData(e.target);

  const res = await fetch(`http://localhost:3030/users/${usuarioId}`, {
    method: "PUT",
    body: formData
  });

  const data = await res.json();
  alert(data.message);
  if (data.success) window.location.href = `perfil.html?id=${usuarioId}`;
});
