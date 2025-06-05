const loginform = document.getElementById('loginForm');
    if (loginform) 
      {
        loginform.addEventListener('submit', async (e) => {
          e.preventDefault();
        
          const email = document.getElementById('email').value;
          const senha = document.getElementById('senha').value;
          
          if ( !email || !senha ) {
            alert("Todos os campos são obrigatórios!");
            return;
          }
          
          const response = await fetch('http://localhost:3030/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha})
          });
          
          const result = await response.json();
          
          if (result.success) {
            console.log("Resposta do login:", result);
            alert("login realizado com sucesso!");
        } else {
          alert("Erro no login!");
        }
      });
    }
    
function redirecionarCadastro() {
  window.location.href = "index.html";
}
document.getElementById('botaoPaginaCadastro').addEventListener('click', redirecionarCadastro);