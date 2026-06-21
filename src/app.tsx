import React, { useEffect } from 'react';
import { useDidShow, useDidHide } from '@tarojs/taro';
import { useAppStore } from './store';
// 全局样式
import './app.scss';

function App(props) {
  const loadInitialData = useAppStore(state => state.loadInitialData);
  
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useDidShow(() => {});

  useDidHide(() => {});

  return props.children;
}

export default App;
