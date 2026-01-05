import './styles.css'

interface NewsItem {
  title: string
  source: string
  heat: number
  time: string
  url: string
  category: string
}

let allNews: NewsItem[] = []

// 初始化应用
async function init() {
  await fetchNews()
  renderNews()
  setupEventListeners()
}

// 获取新闻数据
async function fetchNews() {
  try {
    const response = await fetch('/api/trending')
    allNews = await response.json()
    updateUpdateTime()
  } catch (error) {
    console.error('获取数据失败:', error)
    allNews = generateMockData()
  }
}

// 生成模拟数据
function generateMockData(): NewsItem[] {
  return [
    {
      title: 'AI技术突破：GPT-5即将发布',
      source: 'HackerNews',
      heat: 9800,
      time: new Date().toISOString(),
      url: 'https://news.ycombinator.com',
      category: 'tech'
    },
    {
      title: '全球科技峰会在旧金山召开',
      source: 'Reddit',
      heat: 8500,
      time: new Date().toISOString(),
      url: 'https://reddit.com',
      category: 'tech'
    },
    {
      title: '开源项目Stars突破10万',
      source: 'GitHub',
      heat: 7200,
      time: new Date().toISOString(),
      url: 'https://github.com',
      category: 'tech'
    }
  ]
}

// 渲染新闻列表
function renderNews() {
  const newsGrid = document.getElementById('newsGrid')
  if (!newsGrid) return

  newsGrid.innerHTML = allNews
    .slice(0, 20)
    .map(
      (news, index) => `
    <article class="news-card" data-index="${index}">
      <div class="card-header">
        <span class="source-badge">${news.source}</span>
        <span class="heat-badge">🔥 ${formatHeat(news.heat)}</span>
      </div>
      <h3 class="news-title">${news.title}</h3>
      <div class="card-footer">
        <span class="time">${formatTime(news.time)}</span>
        <a href="${news.url}" target="_blank" class="read-more">查看详情 →</a>
      </div>
    </article>
  `
    )
    .join('')
}

// 格式化热度
function formatHeat(heat: number): string {
  if (heat >= 10000) return `${(heat / 10000).toFixed(1)}w`
  if (heat >= 1000) return `${(heat / 1000).toFixed(1)}k`
  return heat.toString()
}

// 格式化时间
function formatTime(time: string): string {
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const hours = Math.floor(diff / 3600000)

  if (hours < 1) return '刚刚'
  if (hours < 24) return `${hours}小时前`
  return `${Math.floor(hours / 24)}天前`
}

// 更新时间
function updateUpdateTime() {
  const timeEl = document.getElementById('updateTime')
  if (timeEl) {
    timeEl.textContent = new Date().toLocaleTimeString('zh-CN')
  }
}

// 设置事件监听
function setupEventListeners() {
  const refreshBtn = document.getElementById('refreshBtn')
  if (refreshBtn) {
    refreshBtn.addEventListener('click', async () => {
      await fetchNews()
      renderNews()
    })
  }
}

// 启动应用
init()
