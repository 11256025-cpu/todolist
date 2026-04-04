import { Stack } from 'expo-router';
import { TodoProvider } from '../context/TodoContext';

export default function RootLayout() {
  return (
    <TodoProvider>
      <Stack
        screenOptions={{
          headerLargeTitle: true, // iOS 大標題風格
          headerStyle: { backgroundColor: '#F2F2F7' },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: '#F2F2F7' },
        }}
      >
        <Stack.Screen 
          name="index" 
          options={{ title: '列表' }} 
        />
        <Stack.Screen 
          name="todolist" 
          options={{ 
            headerBackTitle: '列表',
            headerTintColor: '#007AFF',
            // 標題會由 todolist 頁面動態設定
          }} 
        />
      </Stack>
    </TodoProvider>
  );
}