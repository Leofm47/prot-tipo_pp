const loginform = document.getElementById('loginForm');
    if (loginform) 
      {
        loginform.addEventListener('submit', async (e) => {
          e.preventDefault();
        
          const email = document.getElementById('email').value;
          const password = document.getElementById('password').value;
          
          if ( !email || !password ) {
            alert("Todos os campos são obrigatórios!");
            return;
          }
          
          const response = await fetch('http://localhost:3030/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password})
          });
          
          const result = await response.json();
          
          if (result.success) {
            localStorage.setItem("usuarioId", result.usuario_id);
            alert("Login realizado com sucesso!");
            window.location.href = "index.html";
        } else {
            alert(result.message); // mostra 'Usuário ou senha incorretos!' ou outro erro
        }
      });
    }