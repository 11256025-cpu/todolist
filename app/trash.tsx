import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { Alert, FlatList, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTodo } from '../context/TodoContext';

export default function TrashScreen() {
  const { trashItems, restoreTodo, deleteTrashItem, emptyTrash, categories } = useTodo();

  const getCategoryName = (categoryId: string) => {
    return categories.find((category: any) => category.id === categoryId)?.name || '已刪除分類';
  };

  const showConfirm = (
    title: string,
    message: string,
    confirmText: string,
    onConfirm: () => void
  ) => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      if (window.confirm(`${title}\n\n${message}`)) {
        onConfirm();
      }
      return;
    }

    Alert.alert(title, message, [
      { text: '取消', style: 'cancel' },
      { text: confirmText, style: 'destructive', onPress: onConfirm },
    ]);
  };

  const confirmRestore = (item: any) => {
    restoreTodo(item);
  };

  const confirmDeletePermanent = (id: string) => {
    showConfirm('永久刪除', '這個項目將無法恢復，確定要刪除嗎？', '刪除', () => deleteTrashItem(id));
  };

  const handleEmptyTrash = () => {
    if (trashItems.length === 0) return;

    showConfirm('清空垃圾桶', '確定要永久刪除所有項目嗎？', '清空', emptyTrash);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: '垃圾桶' }} />

      <View style={styles.headerCardContent}>
        <View style={styles.headerTextBlock}>
          <Text style={styles.title}>最近刪除</Text>
          <Text style={styles.subtitle}>代辦事項在此恢復或永久刪除已刪除的待辦事項。</Text>
        </View>
      </View>

      {trashItems.length > 0 && (
        <Pressable 
          style={styles.clearButton} 
          onPress={handleEmptyTrash}
        >
          {({ pressed }) => (
            <View style={[styles.clearButtonContent, pressed && styles.clearButtonPressed]}>
              <Ionicons name="trash-bin-outline" size={20} color="#DC2626" />
              <Text style={styles.clearButtonText}>清空垃圾桶</Text>
            </View>
          )}
        </Pressable>
      )}

      <FlatList
        data={trashItems}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={styles.emptyText}>目前沒有最近刪除的代辦項目。</Text>}
        renderItem={({ item }) => (
          <View style={styles.trashItem}>
            <View style={[styles.colorDot, { backgroundColor: item.color || '#D1D1D6' }]} />
            <View style={styles.trashTextContainer}>
              <Text style={styles.trashTitle}>{item.text}</Text>
              <Text style={styles.trashSubtitle}>{getCategoryName(item.categoryId)}</Text>
            </View>
            <TouchableOpacity style={styles.actionButton} onPress={() => confirmRestore(item)} activeOpacity={0.7}>
              <Ionicons name="arrow-undo-outline" size={22} color="#10B981" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => confirmDeletePermanent(item.id)} activeOpacity={0.7}>
              <Ionicons name="trash-outline" size={22} color="#EF4444" />
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EEF2FF' },
  headerCardContent: {
    margin: 16,
    marginBottom: 0,
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  headerTextBlock: { flex: 1 },
  title: { fontSize: 24, fontWeight: '800', color: '#0B1220', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#6B7280', lineHeight: 20 },
  clearButton: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
    overflow: 'hidden',
  },
  clearButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  clearButtonPressed: {
    backgroundColor: '#F5E6E6',
  },
  clearButtonText: { color: '#DC2626', fontWeight: '700', fontSize: 16 },
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },
  trashItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  colorDot: { width: 8, height: 48, borderRadius: 4, marginRight: 14 },
  trashTextContainer: { flex: 1 },
  trashTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 4 },
  trashSubtitle: { fontSize: 13, color: '#6B7280' },
  actionButton: { marginLeft: 12, padding: 8, borderRadius: 12 },
  emptyText: { textAlign: 'center', marginTop: 48, color: '#6B7280', fontSize: 16 },
});
