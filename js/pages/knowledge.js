function toggleKnowledge(header) {
  const content = header.nextElementSibling;
  const isOpen = header.classList.contains('open');
  document.querySelectorAll('.knowledge-header').forEach(h => h.classList.remove('open'));
  document.querySelectorAll('.knowledge-content').forEach(c => c.classList.remove('open'));
  if (!isOpen) {
    header.classList.add('open');
    content.classList.add('open');
  }
}
