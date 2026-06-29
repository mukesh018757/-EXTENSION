// Format seconds into a readable time string.
function formatTime(seconds) {
  if (!seconds || seconds <= 0) return '0s';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m`;
  return `${secs}s`;
}

// Return a motivational message based on the productivity score.
function getScoreMessage(score) {
  if (score >= 90) return '🏆 Outstanding! You are crushing it!';
  if (score >= 75) return '🌟 Excellent! Keep it up!';
  if (score >= 60) return '👍 Good job! Room to improve.';
  if (score >= 40) return '⚠️ Average. Try to focus more.';
  return '🔴 Poor. Reduce distractions!';
}

// Color-code the score based on the productivity band.
function getScoreColor(score) {
  if (score >= 80) return '#22c55e';
  if (score >= 60) return '#eab308';
  if (score >= 40) return '#f97316';
  return '#ef4444';
}

// Load time data and render all dashboard charts and cards.
async function loadDashboardData() {
  try {
    const todayData = await chrome.runtime.sendMessage({ type: 'getTodayData' });
    const data = todayData?.data || {};
    const entries = Object.entries(data).map(([domain, seconds]) => ({ domain, seconds: Math.round(seconds) }));
    entries.sort((a, b) => b.seconds - a.seconds);

    const total = entries.reduce((sum, item) => sum + item.seconds, 0);
    const productive = entries.filter(item => ['github.com', 'stackoverflow.com', 'leetcode.com', 'coursera.org', 'udemy.com', 'notion.so', 'kaggle.com', 'hackerrank.com'].some(domain => item.domain.includes(domain))).reduce((sum, item) => sum + item.seconds, 0);
    const unproductive = entries.filter(item => ['youtube.com', 'instagram.com', 'facebook.com', 'reddit.com', 'netflix.com', 'tiktok.com', 'twitter.com'].some(domain => item.domain.includes(domain))).reduce((sum, item) => sum + item.seconds, 0);
    const neutral = total - productive - unproductive;

    document.getElementById('totalTime').textContent = formatTime(total);
    document.getElementById('productiveTime').textContent = formatTime(productive);
    document.getElementById('unproductiveTime').textContent = formatTime(unproductive);
    document.getElementById('neutralTime').textContent = formatTime(neutral);

    const productivePercent = total ? Math.round((productive / total) * 100) : 0;
    const unproductivePercent = total ? Math.round((unproductive / total) * 100) : 0;
    document.getElementById('productivePercent').textContent = `${productivePercent}%`;
    document.getElementById('unproductivePercent').textContent = `${unproductivePercent}%`;

    const donutCtx = document.getElementById('donutChart').getContext('2d');
    new Chart(donutCtx, {
      type: 'doughnut',
      data: {
        labels: ['Productive', 'Unproductive', 'Neutral'],
        datasets: [{
          data: [productive, unproductive, neutral],
          backgroundColor: ['#22c55e', '#ef4444', '#64748b']
        }]
      },
      options: { responsive: true }
    });

    const barCtx = document.getElementById('barChart').getContext('2d');
    new Chart(barCtx, {
      type: 'bar',
      data: {
        labels: entries.slice(0, 10).map(item => item.domain),
        datasets: [{
          label: 'Time',
          data: entries.slice(0, 10).map(item => item.seconds / 60),
          backgroundColor: entries.slice(0, 10).map(() => '#3b82f6')
        }]
      },
      options: {
        responsive: true,
        indexAxis: 'y',
        scales: { x: { title: { display: true, text: 'Minutes' } } }
      }
    });

    const lineCtx = document.getElementById('lineChart').getContext('2d');
    const weeklyLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    new Chart(lineCtx, {
      type: 'line',
      data: {
        labels: weeklyLabels,
        datasets: [
          { label: 'Productive', data: [2, 3, 2.5, 4, 3, 2, 3.5], borderColor: '#22c55e', tension: 0.3 },
          { label: 'Unproductive', data: [1.5, 1, 1.2, 0.8, 1.5, 2, 1.2], borderColor: '#ef4444', tension: 0.3 }
        ]
      },
      options: { responsive: true }
    });

    const score = total ? Math.round((productive / total) * 100) : 0;
    const scoreValue = document.getElementById('scoreValue');
    scoreValue.textContent = score;
    scoreValue.style.color = getScoreColor(score);
    document.getElementById('scoreMessage').textContent = getScoreMessage(score);

    const tbody = document.getElementById('siteTableBody');
    tbody.innerHTML = '';
    entries.forEach((item) => {
      const category = item.domain.includes('youtube') || item.domain.includes('instagram') || item.domain.includes('facebook') || item.domain.includes('reddit') || item.domain.includes('netflix') || item.domain.includes('tiktok') || item.domain.includes('twitter') ? 'unproductive' : (['github.com', 'stackoverflow.com', 'leetcode.com', 'coursera.org', 'udemy.com', 'notion.so', 'kaggle.com', 'hackerrank.com'].some(domain => item.domain.includes(domain)) ? 'productive' : 'neutral');
      const row = document.createElement('tr');
      row.className = category;
      row.innerHTML = `
        <td>${item.domain}</td>
        <td>${category}</td>
        <td>${formatTime(item.seconds)}</td>
        <td>${formatTime(item.seconds)}</td>
      `;
      tbody.appendChild(row);
    });
  } catch (error) {
    console.error('Dashboard load error:', error.message);
  }
}

loadDashboardData();
