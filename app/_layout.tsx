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
          }} 
        />
        <Stack.Screen
          name="trash"
          options={{
            title: '垃圾桶',
            headerBackTitle: '列表',
            headerTintColor: '#007AFF',
          }}
        />
      </Stack>
    </TodoProvider>
  );
}