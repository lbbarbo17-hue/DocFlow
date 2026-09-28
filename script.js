// Inicializar Ícones Lucide
lucide.createIcons();

// Lógica do Alternador de Tema Dark/Light
const themeToggleBtn = document.getElementById('theme-toggle');

// Verificar preferência salva no LocalStorage
if (localStorage.getItem('color-theme') === 'light') {
  document.documentElement.classList.remove('dark');
} else {
  document.documentElement.classList.add('dark');
}

// Evento de clique no botão de alternar tema
themeToggleBtn.addEventListener('click', function() {
  if (document.documentElement.classList.contains('dark')) {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('color-theme', 'light');
  } else {
    document.documentElement.classList.add('dark');
    localStorage.setItem('color-theme', 'dark');
  }
});

// Lógica para Abrir e Fechar o Modal de Acesso ao App
function openAppModal() {
  const modal = document.getElementById('appModal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closeAppModal() {
  const modal = document.getElementById('appModal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}