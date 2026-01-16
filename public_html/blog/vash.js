
// Initialize Lucide icons
document.addEventListener('DOMContentLoaded', () => {
    // Sample data for founders
    const founders = [
      {
        name: 'Dineth Gunawardena',
        role: 'CEO & Owner',
        image: 'https://apilageai.lk/uploads/ApilageAI_t_1743780040_t_tk_179f92edb9a2d0597464506b9909a95c.jpg',
        bio: 'Front End designer and AI enthusiastic Maths and ICT Student at Mahanama College',
        social: {
          twitter: '#',
          linkedin: '#',
          github: '#'
        }
      },
      {
        name: 'Thisath Damiru',
        role: 'Co-Founder & Software Engineer',
        image: 'https://apilageai.lk/uploads/ApilageAI_t_1743705732_t_tk_a46ef49b890d3cdaf398d659b74148c1.jpg',
        bio: 'Expert In Backend programming and AI , Student',
        social: {
          twitter: '#',
          linkedin: '#',
          github: '#'
        }
      },
      {
        name: 'Daham Pansilu',
        role: 'Marketing & Community Manager',
        image: 'https://apilageai.lk/uploads/ApilageAI_t_1744047973_t_tk_780d2b2487027d413cccb15fa4a02a10.jpg',
        bio: 'Graphic Designer and marketing expert, Student',
        social: {
          twitter: '#',
          linkedin: '#',
          github: '#'
        }
      }
    ];
  
    // Render founders section
    const foundersGrid = document.querySelector('.founders-grid');
    if (foundersGrid) {
      founders.forEach(founder => {
        const founderCard = document.createElement('div');
        founderCard.className = 'founder-card fade-in';
        founderCard.innerHTML = `
          <img src="${founder.image}" alt="${founder.name}" class="founder-image">
          <h3>${founder.name}</h3>
          <p class="founder-role">${founder.role}</p>
          <p>${founder.bio}</p>
          <div class="founder-social">
            <a href="${founder.social.twitter}"><i data-lucide="twitter"></i></a>
            <a href="${founder.social.linkedin}"><i data-lucide="linkedin"></i></a>
            <a href="${founder.social.github}"><i data-lucide="github"></i></a>
          </div>
        `;
        foundersGrid.appendChild(founderCard);
      });
    }
  
    // Render blog posts section
    const postsGrid = document.querySelector('.posts-grid');
    if (postsGrid) {
      blogPosts.forEach(post => {
        const postCard = document.createElement('div');
        postCard.className = 'post-card fade-in';
        postCard.innerHTML = `
          <img src="${post.image}" alt="${post.title}" class="post-image">
          <div class="post-content">
            <div class="post-meta">
              <span>${post.date}</span>
              <span>${post.author}</span>
            </div>
            <h3>${post.title}</h3>
            <p>${post.excerpt}</p>
            <div class="post-tags">
              ${post.tags.map(tag => `<span class="post-tag">${tag}</span>`).join('')}
            </div>
          </div>
        `;
        postsGrid.appendChild(postCard);
      });
    }
  
    // Add animation classes
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
      heroContent.querySelectorAll('h1, p, .btn-primary').forEach((el, index) => {
        el.classList.add('fade-in');
        el.style.animationDelay = `${index * 100}ms`;
      });
    }
  
    // Button click event
    const startButton = document.querySelector('.btn-primary');
    if (startButton) {
      startButton.addEventListener('click', () => {
        alert('Welcome to Apilageai! Start your learning journey now.');
      });
    }
  });
  
  // Add smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      document.querySelector(targetId).scrollIntoView({
        behavior: 'smooth'
      });
    });
  });
  
