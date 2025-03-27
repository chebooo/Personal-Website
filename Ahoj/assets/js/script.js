document.addEventListener("DOMContentLoaded", () => {
  // Theme toggle functionality
  const themeToggleBtn = document.getElementById("theme-toggle-btn");
  const body = document.body;

  // Check user preference
  const prefersDarkMode = window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;
  const savedTheme = localStorage.getItem("theme");

  // Set initial theme
  if (savedTheme === "light" || (!savedTheme && !prefersDarkMode)) {
    enableLightMode();
  } else {
    enableDarkMode();
  }

  // Theme toggle event listener
  themeToggleBtn.addEventListener("click", () => {
    const currentTheme = localStorage.getItem("theme");
    if (currentTheme === "dark") {
      enableLightMode();
    } else {
      enableDarkMode();
    }
  });

  function enableDarkMode() {
    body.classList.remove("light-theme");
    themeToggleBtn.textContent = "☀️";
    localStorage.setItem("theme", "dark");
  }

  function enableLightMode() {
    body.classList.add("light-theme");
    themeToggleBtn.textContent = "🌙";
    localStorage.setItem("theme", "light");
  }

  // Set active class based on current page
  const setActiveNavLink = () => {
    const currentPage = window.location.pathname.split("/").pop();
    const navLinks = document.querySelectorAll(".main-nav a");

    navLinks.forEach((link) => {
      const linkHref = link.getAttribute("href");
      if (
        linkHref === currentPage ||
        (currentPage === "" && linkHref === "index.html") ||
        (currentPage === "/" && linkHref === "index.html")
      ) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  };

  // Call on page load
  setActiveNavLink();

  // Smooth scrolling for anchor links (only for #hash links)
  const anchorLinks = document.querySelectorAll('a[href^="#"]');

  anchorLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");
      if (targetId === "#") return;

      e.preventDefault();
      const targetElement = document.querySelector(targetId);

      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 80,
          behavior: "smooth",
        });
      }
    });
  });

  // Do not preventDefault for navigation links to actual pages
  const navLinks = document.querySelectorAll("nav a");
  navLinks.forEach((link) => {
    const href = link.getAttribute("href");

    // Only add event handling for # links or javascript: links
    if (href.startsWith("#") || href.startsWith("javascript:")) {
      link.addEventListener("click", (e) => {
        e.preventDefault();

        if (href === "#about") {
          window.location.href = "about.html";
        } else {
          console.log(`Navigate to: ${href}`);
          link.classList.add("active");
          setTimeout(() => link.classList.remove("active"), 300);
        }
      });
    }
  });

  // --- GitHub Activity Feed ---
  const fetchGitHubActivity = async (username, limit = 5) => {
    const activityFeedElement = document.getElementById("activity-feed");
    if (!activityFeedElement) return; // Exit if the element isn't on the page

    try {
      // Use GitHub's public events API
      const response = await fetch(`https://api.github.com/users/${username}/events/public?per_page=${limit}`);
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }
      const events = await response.json();

      if (!events || events.length === 0) {
        activityFeedElement.innerHTML = '<p>No recent public activity found.</p>';
        return;
      }

      let html = '';
      events.slice(0, limit).forEach(event => {
        html += `<div class="activity-item">`;
        html += formatGitHubEvent(event);
        html += `</div>`;
      });

      activityFeedElement.innerHTML = html;

    } catch (error) {
      console.error("Error fetching GitHub activity:", error);
      activityFeedElement.innerHTML = '<p>Could not load GitHub activity.</p>';
    }
  };

  // Helper function to format different event types
  const formatGitHubEvent = (event) => {
    const repoLink = `<a href="https://github.com/${event.repo.name}" target="_blank">${event.repo.name}</a>`;
    const eventDate = new Date(event.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    let description = '';

    switch (event.type) {
      case 'PushEvent':
        const commitCount = event.payload.commits.length;
        const branch = event.payload.ref.split('/').pop();
        description = `Pushed ${commitCount} commit${commitCount > 1 ? 's' : ''} to ${branch} in ${repoLink}`;
        break;
      case 'CreateEvent':
        if (event.payload.ref_type === 'repository') {
          description = `Created repository ${repoLink}`;
        } else if (event.payload.ref_type === 'branch') {
          description = `Created branch ${event.payload.ref} in ${repoLink}`;
        } else {
           description = `Created ${event.payload.ref_type} in ${repoLink}`;
        }
        break;
      case 'PullRequestEvent':
        const prAction = event.payload.action; // opened, closed, reopened
        const prLink = `<a href="${event.payload.pull_request.html_url}" target="_blank">#${event.payload.number}</a>`;
        description = `${prAction.charAt(0).toUpperCase() + prAction.slice(1)} pull request ${prLink} in ${repoLink}`;
        break;
      case 'IssuesEvent':
         const issueAction = event.payload.action;
         const issueLink = `<a href="${event.payload.issue.html_url}" target="_blank">#${event.payload.issue.number}</a>`;
         description = `${issueAction.charAt(0).toUpperCase() + issueAction.slice(1)} issue ${issueLink} in ${repoLink}`;
         break;
      case 'ForkEvent':
         const forkLink = `<a href="${event.payload.forkee.html_url}" target="_blank">${event.payload.forkee.full_name}</a>`;
         description = `Forked ${repoLink} to ${forkLink}`;
         break;
      case 'WatchEvent':
         description = `Started watching ${repoLink}`;
         break;
      default:
        description = `Performed ${event.type.replace('Event', '')} on ${repoLink}`;
    }

    return `<p>${description}</p><span class="activity-date">${eventDate}</span>`;
  };

  // Fetch activity for your username (replace 'chebooo' if needed)
  fetchGitHubActivity('chebooo');

});
