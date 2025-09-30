    let gamesData = [];
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

    // Fetch game data from JSON file
    fetch('data/games.json')
      .then(response => response.json())
      .then(data => {
        gamesData = data;
        renderGames(gamesData);
      })
      .catch(error => console.error('Error loading games data:', error));

    // Render games in the main grid and starred grid
    function renderGames(filteredGames) {
      const gameGrid = document.getElementById('game-grid');
      const starredGrid = document.getElementById('starred-grid');
      const emptyMessage = document.getElementById('empty-favorites-message');

      gameGrid.innerHTML = '';
      starredGrid.innerHTML = '';

      // Render all games in the main grid
      filteredGames.forEach((game) => {
        const gameCard = createGameCard(game, favorites.includes(game.name));
        gameGrid.appendChild(gameCard);
      });

      // Render favorited games in the starred grid
      const starredGames = filteredGames.filter(game => favorites.includes(game.name));
      if (starredGames.length > 0) {
        starredGames.forEach((game) => {
          const gameCard = createGameCard(game, true);
          starredGrid.appendChild(gameCard);
        });
        emptyMessage.classList.add('hidden');
      } else {
        emptyMessage.classList.remove('hidden');
      }

      addFavoriteStarEventListeners();
      addGameClickEventListeners();
    }

    // Create a game card element
    function createGameCard(game, isStarred) {
      const gameCard = document.createElement('div');
      gameCard.className = 'game-card';
      const isFavorite = favorites.includes(game.name);

      gameCard.innerHTML = `
        <div class="game-card-content block w-full h-full cursor-pointer" data-game-url="${game.url}" data-game-name="${game.name}">
          <div class="image-container">
            <img src="${game.image}" alt="${game.name}">
          </div>
          <p>
            <i class="fa-star favorite-star ${isFavorite ? 'fas' : 'far'}" data-name="${game.name}"></i>
            ${game.name}
          </p>
        </div>
      `;

      return gameCard;
    }

    // Add event listeners to game cards
    function addGameClickEventListeners() {
      document.querySelectorAll('.game-card-content').forEach(card => {
        card.addEventListener('click', (e) => {
          // Don't open modal if clicking on the star
          if (e.target.classList.contains('favorite-star')) return;
          
          const gameUrl = card.getAttribute('data-game-url');
          const gameName = card.getAttribute('data-game-name');
          openGameModal(gameUrl, gameName);
        });
      });
    }

    // Add event listeners to favorite stars
    function addFavoriteStarEventListeners() {
      document.querySelectorAll('.favorite-star').forEach(star => {
        star.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const gameName = star.getAttribute('data-name');
          toggleFavorite(gameName);
        });
      });
    }

    // Open game in modal
    function openGameModal(gameUrl, gameName) {
      const modal = document.getElementById('game-modal');
      const iframe = document.getElementById('game-iframe');
      const title = document.getElementById('modal-game-title');
      const spinner = document.getElementById('loading-spinner');

      title.textContent = gameName;
      spinner.style.display = 'block';
      iframe.style.display = 'none';
      iframe.src = gameUrl;

      modal.classList.add('active');
      document.body.style.overflow = 'hidden';

      // Hide spinner when iframe loads
      iframe.onload = () => {
        spinner.style.display = 'none';
        iframe.style.display = 'block';
      };
    }

    // Close modal
    function closeGameModal() {
      const modal = document.getElementById('game-modal');
      const iframe = document.getElementById('game-iframe');
      
      modal.classList.remove('active');
      document.body.style.overflow = 'auto';
      iframe.src = '';
    }

    // Toggle fullscreen
    function toggleFullscreen() {
      const iframe = document.getElementById('game-iframe');
      if (iframe.requestFullscreen) {
        iframe.requestFullscreen();
      } else if (iframe.mozRequestFullScreen) {
        iframe.mozRequestFullScreen();
      } else if (iframe.webkitRequestFullscreen) {
        iframe.webkitRequestFullscreen();
      } else if (iframe.msRequestFullscreen) {
        iframe.msRequestFullscreen();
      }
    }

    // Toggle a game's favorite status
    function toggleFavorite(gameName) {
      if (favorites.includes(gameName)) {
        favorites = favorites.filter(name => name !== gameName);
        showNotification(`"${gameName}" has been unfavorited`);
      } else {
        favorites.push(gameName);
        showNotification(`"${gameName}" has been favorited`);
      }
      localStorage.setItem('favorites', JSON.stringify(favorites));
      renderGames(gamesData);
    }

    // Function to show a notification
    function showNotification(message) {
      const notificationContainer = document.getElementById('notification-container');
      const notification = document.createElement('div');
      notification.className = 'notification';
      notification.innerHTML = `
        <div>${message}</div>
        <div class="close-btn"></div>
        <div class="timer-bar"></div>
      `;

      notification.querySelector('.close-btn').addEventListener('click', () => {
        notification.remove();
      });

      setTimeout(() => {
        notification.remove();
      }, 4000);

      notificationContainer.appendChild(notification);
    }

    // Event listeners for modal controls
    document.getElementById('close-modal').addEventListener('click', closeGameModal);
    document.getElementById('fullscreen-btn').addEventListener('click', toggleFullscreen);
    
    // Close modal when clicking outside
    document.getElementById('game-modal').addEventListener('click', (e) => {
      if (e.target.id === 'game-modal') {
        closeGameModal();
      }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeGameModal();
      }
    });

    // Instant search functionality
    document.getElementById('search-input').addEventListener('input', () => {
      const searchQuery = document.getElementById('search-input').value.toLowerCase();
      const filteredGames = gamesData.filter(game => game.name.toLowerCase().includes(searchQuery));
      renderGames(filteredGames);
    });

    // *** TOPBAR CONTROL ADDED ***
window.topbarControl = (function() {
  let disabled = false;

  // Adjust this selector to match your actual topbar element(s)
  const topbarSelector = '#topbar, .topbar, [id*="topbar"], [class*="topbar"]';

  function disableTopbar() {
    if (disabled) return;
    disabled = true;
    console.log('Disabling topbar');
    document.body.classList.add('modal-open');

    // Force hide topbar elements
    const topbars = document.querySelectorAll(topbarSelector);
    topbars.forEach(el => {
      el.style.display = 'none';
    });
  }

  function enableTopbar() {
    if (!disabled) return;
    disabled = false;
    console.log('Enabling topbar');
    document.body.classList.remove('modal-open');

    // Restore display of topbar elements
    const topbars = document.querySelectorAll(topbarSelector);
    topbars.forEach(el => {
      el.style.display = '';
    });
  }

  return {
    disableTopbar,
    enableTopbar
  };
})();

// Get DOM elements
const modal = document.getElementById('game-modal');
const iframe = document.getElementById('game-iframe');
const loadingSpinner = document.getElementById('loading-spinner');
const modalTitle = document.getElementById('modal-game-title');
const refreshBtn = document.getElementById('refresh-btn');
const fullscreenBtn = document.getElementById('fullscreen-btn');
const iframeContainer = document.getElementById('iframe-container');
const exitMessage = document.getElementById('exit-message');

let currentGameUrl = '';

// Update exit message position to follow cursor
function updateExitMessagePosition(e) {
  exitMessage.style.left = e.clientX + 'px';
  exitMessage.style.top = e.clientY + 'px';
}

// Open modal function with enhanced loading
function openModal(gameUrl, gameTitle) {
  currentGameUrl = gameUrl;
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';

  // *** DISABLE TOPBAR ***
  if (window.topbarControl) {
    window.topbarControl.disableTopbar();
  }

  modalTitle.textContent = gameTitle || 'Game Title';

  // Load the game
  iframe.src = gameUrl || '';
}

// Close modal function
function closeModal() {
  modal.classList.remove('active');
  document.body.style.overflow = '';

  // *** ENABLE TOPBAR ***
  if (window.topbarControl) {
    window.topbarControl.enableTopbar();
  }

  // Hide exit message
  exitMessage.classList.remove('show');

  // Delay iframe unload for smooth animation
  setTimeout(() => {
    iframe.src = '';
    customLoadingScreen.classList.remove('active', 'fade-out');
  }, 300);
}

// Mouse tracking for exit message
modal.addEventListener('mousemove', (e) => {
  if (modal.classList.contains('active')) {
    updateExitMessagePosition(e);
  }
});

// Show/hide exit message based on mouse position
modal.addEventListener('mouseenter', (e) => {
  if (modal.classList.contains('active')) {
    updateExitMessagePosition(e);
    exitMessage.classList.add('show');
  }
});

modal.addEventListener('mouseleave', () => {
  exitMessage.classList.remove('show');
});

// Hide exit message when hovering over iframe container
iframeContainer.addEventListener('mouseenter', () => {
  exitMessage.classList.remove('show');
});

// Show exit message when leaving iframe container (but still in modal)
iframeContainer.addEventListener('mouseleave', (e) => {
  // Only show if we're still within the modal bounds
  if (modal.contains(e.relatedTarget) && modal.classList.contains('active')) {
    updateExitMessagePosition(e);
    exitMessage.classList.add('show');
  }
});

// Event listeners
document.getElementById('close-modal').addEventListener('click', closeModal);

// Refresh game
refreshBtn.addEventListener('click', () => {
  if (currentGameUrl) {
    showCustomLoadingScreen();
    iframe.src = '';
    
    setTimeout(() => {
      iframe.src = currentGameUrl;
      
      const startTime = Date.now();
      const minLoadingTime = 2000; // Shorter refresh loading time
      
      const handleRefreshLoad = () => {
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
        
        setTimeout(() => {
          hideCustomLoadingScreen();
        }, remainingTime);
      };
      
      iframe.onload = handleRefreshLoad;
      iframe.onerror = handleRefreshLoad;
      
      setTimeout(() => {
        if (!customLoadingScreen.classList.contains('fade-out')) {
          hideCustomLoadingScreen();
        }
      }, minLoadingTime + 500);
      
    }, 100);
  }
});

// Fullscreen toggle with better UX
fullscreenBtn.addEventListener('click', () => {
  const fullscreenIcon = fullscreenBtn.querySelector('i');
  const fullscreenText = fullscreenBtn.querySelector('span');

  if (!document.fullscreenElement) {
    modal.requestFullscreen().then(() => {
      fullscreenIcon.className = 'fas fa-compress';
      fullscreenText.textContent = 'Exit Fullscreen';
    }).catch((err) => {
      console.error(`Error enabling fullscreen: ${err.message}`);
    });
  } else {
    document.exitFullscreen().then(() => {
      fullscreenIcon.className = 'fas fa-expand';
      fullscreenText.textContent = 'Fullscreen';
    });
  }
});

// Handle fullscreen change events
document.addEventListener('fullscreenchange', () => {
  const fullscreenIcon = fullscreenBtn.querySelector('i');
  const fullscreenText = fullscreenBtn.querySelector('span');

  if (!document.fullscreenElement) {
    fullscreenIcon.className = 'fas fa-expand';
    fullscreenText.textContent = 'Fullscreen';
  }
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal.classList.contains('active')) {
    closeModal();
  }
});

// Close modal when clicking outside the modal content
modal.addEventListener('click', (e) => {
  if (e.target === modal) {
    closeModal();
  }
});

// Example: You can call openModal(url, title) to open the modal with a game
// openModal('https://example.com/game', 'Example Game');
