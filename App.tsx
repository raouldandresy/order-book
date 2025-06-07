import { StatusBar } from 'expo-status-bar';
import { FlatList, StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Dimensions } from 'react-native';
import useWebsocket from './src/hooks/useWebsocket';
import { useCallback, useState } from 'react';
import { Precision, PRECISIONS } from './src/models/Precision';
import { MaterialIcons } from '@expo/vector-icons';
import OrderRow from './src/components/OrderRow';

export default function App() {
  const [precisionIndex, setPrecisionIndex] = useState<number>(0);
  const precision: Precision = PRECISIONS[precisionIndex];
  const { orderBook, isConnected, connect, close } = useWebsocket(precision);

  const increasePrecision = () => {
    setPrecisionIndex((prev) => Math.max(0, prev - 1)); 
  };

  const decreasePrecision = () => {
    setPrecisionIndex((prev) => Math.min(PRECISIONS.length - 1, prev + 1)); 
  };

  const maxBidAmount = Math.max(...orderBook.bids.map((o) => o.amount), 1);
  const maxAskAmount = Math.max(...orderBook.asks.map((o) => o.amount), 1);

  const renderAskItem = useCallback(
  ({ item  }) => <OrderRow order={item} side="ask" maxAmount={maxAskAmount} />,
  [maxAskAmount]
);

const renderBidItem = useCallback(
  ({ item }) => <OrderRow order={item} side="bid" maxAmount={maxBidAmount} />,
  [maxBidAmount]
);


  return (
    <SafeAreaView style={styles.container}>
       <View style={styles.buttonRow}>
      <Text style={styles.title}>Order Book</Text>
        <TouchableOpacity onPress={decreasePrecision} style={styles.button} disabled={precisionIndex==3}>
        <MaterialIcons name="remove" size={20} color={precisionIndex==3 ? '#999' : 'black'} />
      </TouchableOpacity>

      <TouchableOpacity onPress={increasePrecision} style={styles.button} disabled={precisionIndex==0}>
        <MaterialIcons name="add" size={20} color={precisionIndex==0 ? '#999' : 'black'} />
      </TouchableOpacity>

      <TouchableOpacity onPress={connect} style={styles.button} disabled={isConnected}>
        <MaterialIcons name="link" size={20} color={isConnected ? '#999' : 'green'} />
      </TouchableOpacity>

      <TouchableOpacity onPress={close} style={styles.button} disabled={!isConnected} >
        <MaterialIcons name="link-off" size={20} color={!isConnected ? '#999' : 'red'}/>
      </TouchableOpacity>
      </View>

       <View style={styles.columns}>
        <View style={styles.orderColumn}>
          <View style={styles.headerRow}>
            <Text style={[styles.headerText, { flex: 1 }]}>Total</Text>
            <Text style={[styles.headerText, { width: 80, textAlign: 'right' }]}>Price</Text>
          </View>
          <FlatList
            data={orderBook.bids}
            keyExtractor={(item) => `bid-${item.price}`}
            renderItem={renderBidItem}
            style={styles.list}
          />
        </View>

        <View style={styles.orderColumn}>
          <View style={styles.headerRow}>
            <Text style={[styles.headerText, { flex: 1 }]}>Price</Text>
            <Text style={[styles.headerText, { width: 80, textAlign: 'right' }]}>Total</Text>
          </View>
          <FlatList
            data={orderBook.asks}
            keyExtractor={(item) => `ask-${item.price}`}
            renderItem={renderAskItem}
            style={styles.list}
          />
        </View>
      </View>

      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
    backgroundColor: '#fff',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
  },
  columns: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 10,
  },
  orderColumn: {
    flex: 1,
    marginHorizontal: 5,
  },
  headerRow: {
    flexDirection: 'row',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderColor: '#ddd',
    marginBottom: 4,
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  list: {
    flexGrow: 1, 
    maxHeight: Dimensions.get('window').height * 0.85,
  },
  button: {
    padding: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

