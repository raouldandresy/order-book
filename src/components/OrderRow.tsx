import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const MAX_BAR_WIDTH = 120;

function OrderRow({
  order,
  side,
  maxAmount,
}: {
  order: { price: number; amount: number };
  side: 'bid' | 'ask';
  maxAmount: number;
}) {
  const barWidth = (order.amount / maxAmount) * MAX_BAR_WIDTH;

  return (
    <View style={styles.row}>
      <View
        style={[
          styles.bar,
          {
            width: barWidth,
            backgroundColor: side === 'bid' ? 'rgba(0, 255, 0, 0.2)' : 'rgba(255, 0, 0, 0.2)',
            left: side === 'ask' ? 0 : undefined,
            right: side === 'bid' ? 0 : undefined,
          },
        ]}
      />
      <Text style={styles.price}>
        {side === 'bid'
          ? order.amount.toFixed(4)
          : order.price.toLocaleString()}
      </Text>
      <Text style={styles.amount}>
        {side === 'bid'
          ? order.price.toLocaleString()
          : order.amount.toFixed(4)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    paddingVertical: 4,
    paddingHorizontal: 6,
    overflow: 'hidden',
  },
  bar: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    borderRadius: 4,
  },
  price: {
    flex: 1,
    fontWeight: '600'
  },
  amount: {
    flex: 1,
    textAlign: 'right',
    fontWeight: '600'
  },
});

export default OrderRow;
