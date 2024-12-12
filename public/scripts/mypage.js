document.addEventListener('DOMContentLoaded', () => {
      // 탭 메뉴 관련 코드
      const menuItems = document.querySelectorAll('.page-ul li');
      const sections = document.querySelectorAll('.content-section');

      menuItems.forEach(item => {
        item.addEventListener('click', () => {
          // 모든 섹션 숨기기
          sections.forEach(section => section.style.display = 'none');

          // 클릭한 메뉴의 data-target에 해당하는 섹션 표시
          const targetId = item.getAttribute('data-target');
          const targetSection = document.getElementById(targetId);
          if (targetSection) {
            targetSection.style.display = 'flex';
          }

          // 모든 메뉴에서 active 클래스 제거
          menuItems.forEach(menu => menu.classList.remove('active'));

          // 클릭한 메뉴에만 active 클래스 추가
          item.classList.add('active');
        });
      });

      // 기본 메뉴 활성화
      document.querySelector('li[data-target="section1"]').classList.add('active');

      // 회원 정보 수정 관련 코드
      const editButton = document.getElementById('edit-button');
      const editForm = document.getElementById('edit-form');
      const userInfo = document.getElementById('user-info');
      const cancelButton = document.getElementById('cancel-button');

      // 수정 버튼 클릭 시
      editButton.addEventListener('click', () => {
        userInfo.style.display = 'none';
        editForm.style.display = 'block';
      });

      // 취소 버튼 클릭 시
      cancelButton.addEventListener('click', () => {
        editForm.style.display = 'none';
        userInfo.style.display = 'block';
      });

      // 폼 제출 시
      editForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = {
          action: e.submitter.value,
          email: document.getElementById('edit-email').value,
          nickname: document.getElementById('edit-nickname').value
        };

        // 비밀번호가 입력된 경우에만 포함
        const password = document.getElementById('edit-password').value;
        if (password) {
          formData.password = password;
        }

        fetch('/user/update', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        })
          .then(response => response.json())
          .then(data => {
            if (data.success) {
              alert(data.message);
              window.location.href = data.redirectUrl;
            } else {
              alert(data.message || '업데이트 중 오류가 발생했습니다.');
            }
          })
          .catch(error => {
            console.error('Error:', error);
            alert('업데이트 중 오류가 발생했습니다.');
          });
      });
    });

    // DOMContentLoaded 이벤트 핸들러 내부에 추가
    document.querySelectorAll('.delete-post').forEach(button => {
      button.addEventListener('click', async (e) => {
        if (confirm('정말로 이 게시물을 삭제하시겠습니까?')) {
          const postId = e.target.dataset.postId;
          try {
            const response = await fetch(`/posts/${postId}`, {
              method: 'DELETE'
            });
            const data = await response.json();

            if (data.success) {
              // 성공적으로 삭제되면 해당 게시물의 div를 제거
              e.target.closest('.grid-item').remove();
              alert('게시물이 삭제되었습니다.');

              // 만약 더 이상 게시물이 없다면 메시지 표시
              if (document.querySelectorAll('.grid-item').length === 0) {
                const noPostsMessage = document.createElement('p');
                noPostsMessage.className = 'no-posts';
                noPostsMessage.textContent = '아직 업로드한 게시물이 없습니다.';
                document.getElementById('my-posts').appendChild(noPostsMessage);
              }
            } else {
              alert('게시물 삭제에 실패했습니다.');
            }
          } catch (error) {
            console.error('Error:', error);
            alert('게시물 삭제 중 오류가 발생했습니다.');
          }
        }
      });
    });

    // 게시물 삭제 기능
    function initializeDeleteButtons() {
      // 기존 이벤트 리스너 제거 방지
      const deleteButtons = document.querySelectorAll('.delete-post');
      deleteButtons.forEach(button => {
        // 기존 이벤트 리스너 제거
        button.removeEventListener('click', handleDeleteClick);
        // 새로운 이벤트 리스너 추가
        button.addEventListener('click', handleDeleteClick);
      });
    }

    // 삭제 클릭 핸들러를 별도의 함수로 분리
    async function handleDeleteClick(e) {
      e.preventDefault();
      e.stopPropagation();

      if (confirm('정말로 이 게시물을 삭제하시겠습니까?')) {
        const postId = e.target.dataset.postId;

        try {
          const response = await fetch(`/posts/${postId}`, {
            method: 'DELETE'
          });

          const data = await response.json();

          if (data.success) {
            // 화면에서 게시물 요소 제거
            const postElement = e.target.closest('.grid-item');
            postElement.style.opacity = '0';
            setTimeout(() => {
              postElement.remove();

              // 게시물이 더 이상 없는 경우 메시지 표시
              const gridContainer = document.querySelector('.masonry-grid');
              if (gridContainer && !gridContainer.children.length) {
                const noPostsMessage = document.createElement('p');
                noPostsMessage.className = 'no-posts';
                noPostsMessage.textContent = '게시물이 없습니다.';
                gridContainer.appendChild(noPostsMessage);
              }
            }, 300);

            alert('게시물이 삭제되었습니다.');
          } else {
            alert(data.message || '게시물 삭제에 실패했습니다.');
          }
        } catch (error) {
          console.error('Error:', error);
          alert('게시물 삭제 중 오류가 발생했습니다.');
        }
      }
    }