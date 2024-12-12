document.addEventListener('DOMContentLoaded', () => {
  const deleteButtons = document.querySelectorAll('.delete-btn:not([disabled])');
  deleteButtons.forEach(button => {
      button.addEventListener('click', async () => {
          const userId = button.dataset.userId;
          const userEmail = button.dataset.userEmail;
          if (confirm(`정말로 ${userEmail} 회원의 정보를 삭제하시겠습니까?`)) {
              try {
                  const response = await fetch(`/admin/user/${userId}`, {
                      method: 'DELETE'
                  });
                  const data = await response.json();
                  if (data.success) {
                      alert('회원이 성공적으로 삭제되었습니다.');
                      button.closest('tr').remove();
                  } else {
                      alert(data.message || '회원 삭제 중 오류가 발생했습니다.');
                  }
              } catch (error) {
                  console.error('Error:', error);
                  alert('회원 삭제 중 오류가 발생했습니다.');
              }
          }
      });
  });
});