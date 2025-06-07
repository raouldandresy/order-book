import { Order } from "./Order";

export type OrderBook = {
  bids: Order[];
  asks: Order[];
};