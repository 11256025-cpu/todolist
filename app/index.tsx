import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTodo } from '../context/TodoContext';

export default function HomeScreen() {
  const { categories, todos } = useTodo();

  return (
    <View style={styles.container}>
      <FlatList
        data={categories}
        keyExtractor={item => item.id}
        renderItem={({ item }) => {
          const listTodos = todos[item.id] || [];
          const unfinishedCount = listTodos.filter((t: any) => !t.completed).length;

          return (
            <TouchableOpacity 
              style={styles.categoryCard}
              onPress={() => {
                // 使用 expo-router 跳轉並傳遞參數
                router.push({
                  pathname: '/todolist',
                  params: { categoryId: item.id, categoryName: item.name }
                });
              }}
            >
              <View style={styles.categoryHeader}>
                <View style={styles.iconContainer}>
                  <Ionicons name={item.icon as any} size={24} color="#007AFF" />
                </View>
                <Text style={styles.categoryCount}>{unfinishedCount}</Text>
              </View>
              <Text style={styles.categoryName}>{item.name}</Text>
            </TouchableOpacity>
          );
        }}
        numColumns={2}
        contentContainerStyle={styles.categoryList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  categoryList: { padding: 16 },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    margin: 8,
    flex: 1,
    height: 100,
    justifyContent: 'space-between',
  },
  categoryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  iconContainer: { backgroundColor: '#E5F1FF', padding: 8, borderRadius: 30 },
  categoryCount: { fontSize: 24, fontWeight: 'bold', color: '#000' },
  categoryName: { fontSize: 16, fontWeight: '600', color: '#8E8E93' },
});
