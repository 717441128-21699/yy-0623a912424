export default defineAppConfig({
  pages: [
    'pages/today/index',
    'pages/confirm/index',
    'pages/standard/index',
    'pages/supplement/index',
    'pages/records/index',
    'pages/shooting/index',
    'pages/template-detail/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#1677FF',
    navigationBarTitleText: '医美拍摄助手',
    navigationBarTextStyle: 'white',
    backgroundColor: '#F5F7FA'
  },
  tabBar: {
    color: '#86909C',
    selectedColor: '#1677FF',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/today/index',
        text: '今日拍摄'
      },
      {
        pagePath: 'pages/confirm/index',
        text: '客户确认'
      },
      {
        pagePath: 'pages/standard/index',
        text: '标准姿势'
      },
      {
        pagePath: 'pages/supplement/index',
        text: '待补照片'
      },
      {
        pagePath: 'pages/records/index',
        text: '上传记录'
      }
    ]
  }
})
