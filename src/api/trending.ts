export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 's-maxage=300')

  try {
    const news = await fetchAllNews()
    res.status(200).json(news)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch news' })
  }
}

async function fetchAllNews() {
  const [hackerNews, reddit, github] = await Promise.all([
    fetchHackerNews(),
    fetchReddit(),
    fetchGitHub()
  ])

  return [...hackerNews, ...reddit, ...github].sort((a, b) => b.heat - a.heat)
}

async function fetchHackerNews() {
  try {
    const res = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json')
    const ids = await res.json()

    const stories = await Promise.all(
      ids.slice(0, 10).map(async (id: number) => {
        const storyRes = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
        return storyRes.json()
      })
    )

    return stories.map(story => ({
      title: story.title,
      source: 'HackerNews',
      heat: story.score || 0,
      time: new Date(story.time * 1000).toISOString(),
      url: story.url || `https://news.ycombinator.com/item?id=${story.id}`,
      category: 'tech'
    }))
  } catch {
    return []
  }
}

async function fetchReddit() {
  try {
    const res = await fetch('https://www.reddit.com/r/technology/hot.json?limit=10')
    const data = await res.json()

    return data.data.children.map((post: any) => ({
      title: post.data.title,
      source: 'Reddit',
      heat: post.data.ups || 0,
      time: new Date(post.data.created_utc * 1000).toISOString(),
      url: `https://reddit.com${post.data.permalink}`,
      category: 'tech'
    }))
  } catch {
    return []
  }
}

async function fetchGitHub() {
  try {
    const res = await fetch('https://api.github.com/search/repositories?q=stars:>1000&sort=stars&per_page=10')
    const data = await res.json()

    return data.items.map((repo: any) => ({
      title: `${repo.full_name}: ${repo.description || 'No description'}`,
      source: 'GitHub',
      heat: repo.stargazers_count,
      time: repo.updated_at,
      url: repo.html_url,
      category: 'tech'
    }))
  } catch {
    return []
  }
}
