'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { CartItem } from '@/types';

interface CartState {
  items: CartItem[];
  coupon: { code: string; discount: number } | null;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'APPLY_COUPON'; payload: { code: string; discount: number } }
  | { type: 'REMOVE_COUPON' }
  | { type: 'LOAD_CART'; payload: CartState };

interface CartContextType {
  state: CartState;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string, discount: number) => void;
  removeCoupon: () => void;
  getSubtotal: () => number;
  getDiscount: () => number;
  getShipping: () => number;
  getTax: () => number;
  getTotal: () => number;
  getItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const SHIPPING_COST = 50;
const FREE_SHIPPING_MIN = 999;
const TAX_RATE = 0.05;

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find((i) => i.id === action.payload.id);
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.id === action.payload.id
              ? { ...i, quantity: Math.min(i.quantity + action.payload.quantity, i.stock) }
              : i
          ),
        };
      }
      return { ...state, items: [...state.items, action.payload] };
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter((i) => i.id !== action.payload) };
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.payload.id
            ? { ...i, quantity: Math.max(1, Math.min(action.payload.quantity, i.stock)) }
            : i
        ),
      };
    case 'CLEAR_CART':
      return { items: [], coupon: null };
    case 'APPLY_COUPON':
      return { ...state, coupon: action.payload };
    case 'REMOVE_COUPON':
      return { ...state, coupon: null };
    case 'LOAD_CART':
      return action.payload;
    default:
      return state;
  }
}

function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], coupon: null });

  useEffect(() => {
    const saved = localStorage.getItem('ayaan_cart');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        dispatch({ type: 'LOAD_CART', payload: parsed });
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('ayaan_cart', JSON.stringify(state));
  }, [state]);

  const addItem = (item: CartItem) => dispatch({ type: 'ADD_ITEM', payload: item });
  const removeItem = (id: string) => dispatch({ type: 'REMOVE_ITEM', payload: id });
  const updateQuantity = (id: string, quantity: number) => dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  const clearCart = () => dispatch({ type: 'CLEAR_CART' });
  const applyCoupon = (code: string, discount: number) => dispatch({ type: 'APPLY_COUPON', payload: { code, discount } });
  const removeCoupon = () => dispatch({ type: 'REMOVE_COUPON' });

  const getSubtotal = () => state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const getDiscount = () => state.coupon?.discount || 0;
  const getShipping = () => (getSubtotal() >= FREE_SHIPPING_MIN ? 0 : SHIPPING_COST);
  const getTax = () => (getSubtotal() - getDiscount()) * TAX_RATE;
  const getTotal = () => Math.max(0, getSubtotal() - getDiscount() + getShipping() + getTax());
  const getItemCount = () => state.items.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        state, addItem, removeItem, updateQuantity, clearCart,
        applyCoupon, removeCoupon, getSubtotal, getDiscount,
        getShipping, getTax, getTotal, getItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}

export { CartProvider, useCart };
