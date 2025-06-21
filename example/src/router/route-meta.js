/**
 * 路由元数据配置文件
 * 可以为不同的路由路径定义元数据
 */
export default {
  '/': {
    title: '首页',
    icon: 'home',
    keepAlive: true
  },
  '/users': {
    title: '用户管理',
    permissions: ['admin'],
    icon: 'user-group'
  },
  '/users/:id': {
    title: '用户详情',
    parentPath: '/users',
    breadcrumb: true
  },
  '/about': {
    title: '关于我们',
    noCache: true
  }
} 