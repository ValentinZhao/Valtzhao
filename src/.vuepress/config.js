module.exports = {
  // 网站 Title
  // title: 'Valtz Blog',

  // // 网站描述
  // description: 'Valtz的博客，专注于分享前端后端全栈leetcode机器学习技术',

  // 网站语言
  locales: {
    '/': {
      lang: 'zh-CN',
      title: 'Valtz Blog',
      description: 'Valtz\'s blog published with vuepress, web developing, frontend, backend, fullstack, leetcode, machine learning and tech blogs,Valtz的博客，专注于分享前端后端全栈leetcode机器学习技术',
    },
  },

  // 使用的主题
  theme: 'meteorlxy',

  // 主题配置
  themeConfig: {
    // 主题语言，参考下方 [主题语言] 章节
    lang: 'zh-CN',

    // 个人信息（没有或不想设置的，删掉对应字段即可）
    personalInfo: {
      // 昵称
      nickname: 'Valtzhao',

      // 个人简介
      description: 'No matter full-stack or machine-learning engineer, be an engineer first.',

      // 电子邮箱
      email: '',

      // 所在地
      location: 'San Francisco, CA',

      // 组织
      organization: 'Northeastern University',

      // 头像
      // 设置为外部链接
      avatar: '/img/vz.jpg',
      // 或者放置在 .vuepress/public 文件夹，例如 .vuepress/public/img/avatar.jpg
      // avatar: '/img/avatar.jpg',
      

      // 社交平台帐号信息
      sns: {
        // Github 帐号和链接
        github: {
          account: 'ValentinZhao',
          link: 'https://github.com/ValentinZhao',
        },

        // Facebook 帐号和链接
        // facebook: {
        //   account: 'meteorlxy.cn',
        //   link: 'https://www.facebook.com/meteorlxy.cn',
        // },

        // // LinkedIn 帐号和链接
        // linkedin: {
        //   account: 'meteorlxy',
        //   link: 'http://www.linkedin.com/in/meteorlxy',
        // },

        // // Twitter 帐号和链接
        // twitter: {
        //   account: 'meteorlxy_cn',
        //   link: 'https://twitter.com/meteorlxy_cn',
        // },

        // // 新浪微博 帐号和链接
        // weibo: {
        //   account: '@焦炭君_Meteor',
        //   link: 'https://weibo.com/u/2039655434',
        // },

        // // 知乎 帐号和链接
        // zhihu: {
        //   account: 'meteorlxy.cn',
        //   link: 'https://www.zhihu.com/people/meteorlxy.cn',
        // },

        // // 豆瓣 帐号和链接
        // douban: {
        //   account: '159342708',
        //   link: 'https://www.douban.com/people/159342708',
        // },

        // // Reddit 帐号和链接
        // reddit: {
        //   account: 'meteorlxy',
        //   link: 'https://www.reddit.com/user/meteorlxy',
        // },

        // // Medium 帐号和链接
        // medium: {
        //   account: 'meteorlxy.cn',
        //   link: 'https://medium.com/@meteorlxy.cn',
        // },

        // // Instagram 帐号和链接
        // instagram: {
        //   account: 'meteorlxy.cn',
        //   link: 'https://www.instagram.com/meteorlxy.cn',
        // },

        // // GitLab 帐号和链接
        // gitlab: {
        //   account: 'meteorlxy',
        //   link: 'https://gitlab.com/meteorlxy',
        // },

        // // Bitbucket 帐号和链接
        // bitbucket: {
        //   account: 'meteorlxy',
        //   link: 'https://bitbucket.org/meteorlxy',
        // },

        // // Docker Hub 帐号和链接
        // docker: {
        //   account: 'meteorlxy',
        //   link: 'https://hub.docker.com/u/meteorlxy',
        // },
      },
    },

    // 上方 header 的相关设置
    header: {
      // header 的背景，可以使用图片，或者随机变化的图案（geopattern）
      background: {
        // 使用图片的 URL，如果设置了图片 URL，则不会生成随机变化的图案，下面的 useGeo 将失效
        url: '',

        // 使用随机变化的图案，如果设置为 false，且没有设置图片 URL，将显示为空白背景
        useGeo: true,
      },

      // 是否在 header 显示标题
      showTitle: true,
    },

    // 是否显示文章的最近更新时间
    lastUpdated: true,

    // 顶部导航栏内容
    nav: [
      { text: '首页', link: '/', exact: true },
      { text: '文章', link: '/posts/', exact: false },
      { text: 'English Version', link: '/en/', exact: false },
    ],

    // 评论配置，参考下方 [页面评论] 章节
    // comments: {
    //   owner: 'meteorlxy',
    //   repo: 'vuepress-theme-meteorlxy',
    //   clientId: 'MY_CLIENT_ID',
    //   clientSecret: 'MY_CLIENT_SECRET',
    // },
    comments: false,

    // 分页配置
    pagination: {
      perPage: 5,
    },

    // 默认页面（可选，默认全为 true）
    defaultPages: {
      // 是否允许主题自动添加 Home 页面 (url: /)
      home: true,
      // 是否允许主题自动添加 Posts 页面 (url: /posts/)
      posts: true,
    },

    plugins: {
      'seo': {
        siteTitle: (_, $site) => $site.title,
        title: $page => $page.title,
        description: $page => $page.frontmatter.description,
        author: (_, $site) => $site.themeConfig.author,
        tags: $page => $page.frontmatter.tags,
        twitterCard: _ => 'summary_large_image',
        type: $page => ['articles', 'posts', 'blog'].some(folder => $page.regularPath.startsWith('/' + folder)) ? 'article' : 'website',
        url: (_, $site, path) => ($site.themeConfig.domain || '') + path,
        image: ($page, $site) => $page.frontmatter.image && (($site.themeConfig.domain || '') + $page.frontmatter.image),
        publishedAt: $page => $page.frontmatter.date && new Date($page.frontmatter.date),
        modifiedAt: $page => $page.lastUpdated && new Date($page.lastUpdated),
      }
  },
  },
}
